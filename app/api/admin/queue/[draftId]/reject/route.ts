import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess, isAuthError } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ reason: z.string().optional() });

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const { draftId } = await params;

  const draft = await prisma.emailDraft.findFirst({
    where: { id: draftId, tenantId: auth.tenantId, status: "PENDING_REVIEW" },
  });

  if (!draft) {
    return NextResponse.json(
      { error: "Draft not found or already actioned" },
      { status: 404 }
    );
  }

  const body = schema.safeParse(await req.json().catch(() => ({})));
  const reason = body.success ? body.data.reason : undefined;

  await prisma.emailDraft.update({
    where: { id: draftId },
    data: {
      status: "REJECTED",
      rejectedAt: new Date(),
      rejectedByUserId: auth.userId,
      rejectionReason: reason,
    },
  });

  await prisma.lead.update({
    where: { id: draft.leadId },
    data: { status: "REJECTED" },
  });

  return NextResponse.json({ success: true });
}
