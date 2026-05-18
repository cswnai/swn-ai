import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess, isAuthError } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { AutoSendConfig } from "@prisma/client";

const patchSchema = z.object({
  scoringCriteria: z.string().optional(),
  highTierThreshold: z.number().int().min(1).max(100).optional(),
  mediumTierThreshold: z.number().int().min(1).max(100).optional(),
  highAutoSend: z.nativeEnum(AutoSendConfig).optional(),
  mediumAutoSend: z.nativeEnum(AutoSendConfig).optional(),
  lowAutoSend: z.nativeEnum(AutoSendConfig).optional(),
  slackWebhookUrl: z.string().url().or(z.literal("")).optional(),
  fromEmail: z.string().email().optional(),
  replyToEmail: z.string().email().or(z.literal("")).optional(),
});

export async function GET(_req: NextRequest) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const tenant = await prisma.tenant.findUniqueOrThrow({
    where: { id: auth.tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      fromEmail: true,
      replyToEmail: true,
      slackWebhookUrl: true,
      highTierThreshold: true,
      mediumTierThreshold: true,
      highAutoSend: true,
      mediumAutoSend: true,
      lowAutoSend: true,
      scoringCriteria: true,
    },
  });

  return NextResponse.json({ config: tenant });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: body.error.flatten() },
      { status: 422 }
    );
  }

  const updated = await prisma.tenant.update({
    where: { id: auth.tenantId },
    data: {
      ...body.data,
      slackWebhookUrl: body.data.slackWebhookUrl || null,
      replyToEmail: body.data.replyToEmail || null,
    },
  });

  return NextResponse.json({ config: updated });
}
