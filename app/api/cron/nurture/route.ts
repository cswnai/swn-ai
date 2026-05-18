import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resend } from "@/lib/email/resend-client";
import { interpolate } from "@/lib/nurture/interpolate";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dueEmails = await prisma.nurtureEmail.findMany({
    where: {
      status: "SCHEDULED",
      scheduledFor: { lte: new Date() },
    },
    include: {
      lead: { include: { answers: true } },
      tenant: true,
      sequence: {
        include: {
          steps: true,
        },
      },
    },
    take: 50, // Process at most 50 per cron run to avoid timeouts
  });

  let sent = 0;
  let failed = 0;

  for (const nurtureEmail of dueEmails) {
    const step = nurtureEmail.sequence.steps.find(
      (s) => s.stepNumber === nurtureEmail.stepNumber
    );

    if (!step) {
      await prisma.nurtureEmail.update({
        where: { id: nurtureEmail.id },
        data: { status: "FAILED", failureReason: "Step template not found" },
      });
      failed++;
      continue;
    }

    const toEmail =
      nurtureEmail.lead.answers.find((a) => a.fieldKey === "email")?.value ??
      "";

    if (!toEmail) {
      await prisma.nurtureEmail.update({
        where: { id: nurtureEmail.id },
        data: { status: "FAILED", failureReason: "No email address on lead" },
      });
      failed++;
      continue;
    }

    const subject = interpolate(step.subjectTemplate, nurtureEmail.lead.answers);
    const html = interpolate(step.bodyHtmlTemplate, nurtureEmail.lead.answers);
    const text = interpolate(step.bodyTextTemplate, nurtureEmail.lead.answers);

    try {
      const result = await resend.emails.send({
        from: nurtureEmail.tenant.fromEmail,
        replyTo: nurtureEmail.tenant.replyToEmail ?? nurtureEmail.tenant.fromEmail,
        to: toEmail,
        subject,
        html,
        text,
      });

      await prisma.nurtureEmail.update({
        where: { id: nurtureEmail.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
          resendMessageId: result.data?.id ?? null,
        },
      });
      sent++;
    } catch (err) {
      await prisma.nurtureEmail.update({
        where: { id: nurtureEmail.id },
        data: {
          status: "FAILED",
          failureReason: String(err),
        },
      });
      failed++;
    }
  }

  return NextResponse.json({ processed: dueEmails.length, sent, failed });
}
