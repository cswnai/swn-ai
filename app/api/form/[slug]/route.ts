import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { scoreLead } from "@/lib/ai/score-lead";
import { draftFirstTouchEmail } from "@/lib/ai/draft-email";
import { sendEmailDraft } from "@/lib/email/send-email";
import { notifySlack } from "@/lib/slack/notify";
import { enrollInNurtureSequence } from "@/lib/nurture/enroll";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      formConfig: {
        include: { fields: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!tenant || !tenant.formConfig || !tenant.formConfig.isActive) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  return NextResponse.json({ formConfig: tenant.formConfig });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      formConfig: {
        include: { fields: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!tenant || !tenant.formConfig || !tenant.formConfig.isActive) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }

  const formConfig = tenant.formConfig;
  const fields = formConfig.fields;

  // Build Zod schema dynamically from field config
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    let fieldSchema: z.ZodTypeAny = z.string();
    if (field.isRequired) {
      fieldSchema = z.string().min(1, `${field.label} is required`);
    } else {
      fieldSchema = z.string().optional();
    }
    shape[field.key] = fieldSchema;
  }
  const schema = z.object(shape);

  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  const lead = await prisma.lead.create({
    data: {
      tenantId: tenant.id,
      formConfigId: formConfig.id,
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? undefined,
      answers: {
        create: fields
          .filter((f) => parsed.data[f.key] !== undefined)
          .map((f) => ({
            fieldKey: f.key,
            fieldLabel: f.label,
            value: String(parsed.data[f.key] ?? ""),
          })),
      },
    },
    include: { answers: true },
  });

  // Run AI pipeline after response is sent
  after(async () => {
    try {
      // 1. Score the lead
      const scoreResult = await scoreLead(
        tenant,
        lead,
        fields,
        lead.answers
      );

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          score: scoreResult.score,
          tier: scoreResult.tier,
          scoreRationale: scoreResult.rationale,
          rawAiResponse: scoreResult.rawResponse,
          scoredAt: new Date(),
          status: "SCORED",
        },
      });

      // 2. Draft first-touch email
      const emailResult = await draftFirstTouchEmail(
        tenant,
        lead.answers,
        scoreResult.tier,
        scoreResult.rationale,
        scoreResult.emailPersonalizationNotes
      );

      const toEmail =
        lead.answers.find((a) => a.fieldKey === "email")?.value ?? "";

      const draft = await prisma.emailDraft.create({
        data: {
          leadId: lead.id,
          tenantId: tenant.id,
          toEmail,
          subject: emailResult.subject,
          bodyHtml: emailResult.bodyHtml,
          bodyText: emailResult.bodyText,
        },
      });

      // 3. Tier-based automation
      const updatedLead = await prisma.lead.findUniqueOrThrow({
        where: { id: lead.id },
        include: { answers: true },
      });

      if (scoreResult.tier === "HIGH") {
        // Slack notification
        await notifySlack(tenant, updatedLead);
        // Auto-send check
        const autoSend = tenant.highAutoSend;
        if (autoSend === "ALWAYS") {
          await sendEmailDraft(draft.id);
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: "APPROVED" },
          });
        }
        // APPROVAL_REQUIRED → leave PENDING_REVIEW in queue
      } else if (scoreResult.tier === "MEDIUM") {
        const autoSend = tenant.mediumAutoSend;
        if (autoSend === "ALWAYS") {
          await sendEmailDraft(draft.id);
          await prisma.lead.update({
            where: { id: lead.id },
            data: { status: "APPROVED" },
          });
        }
      } else {
        // LOW
        const autoSend = tenant.lowAutoSend;
        if (autoSend === "ALWAYS") {
          await sendEmailDraft(draft.id);
        } else if (autoSend === "NEVER") {
          await prisma.emailDraft.update({
            where: { id: draft.id },
            data: { status: "REJECTED" },
          });
        }
        // Enroll in nurture sequence
        await enrollInNurtureSequence(lead.id, tenant.id);
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "NURTURING" },
        });
      }
    } catch (err) {
      console.error("[AI pipeline error]", err);
    }
  });

  return NextResponse.json(
    {
      success: true,
      leadId: lead.id,
      thankYouMessage: formConfig.thankYouMessage,
    },
    { status: 201 }
  );
}
