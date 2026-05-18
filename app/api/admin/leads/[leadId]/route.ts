import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess, isAuthError } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const { leadId } = await params;

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId: auth.tenantId },
    include: {
      answers: { orderBy: { id: "asc" } },
      emailDrafts: { orderBy: { createdAt: "desc" } },
      nurtureEmails: { orderBy: { stepNumber: "asc" } },
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ lead });
}
