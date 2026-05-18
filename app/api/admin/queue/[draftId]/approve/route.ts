import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess, isAuthError } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { sendEmailDraft } from "@/lib/email/send-email";

export async function POST(
  _req: NextRequest,
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

  await sendEmailDraft(draftId, auth.userId);

  await prisma.lead.update({
    where: { id: draft.leadId },
    data: { status: "APPROVED" },
  });

  return NextResponse.json({ success: true });
}
