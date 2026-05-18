import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess, isAuthError } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { LeadTier } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const tierParam = req.nextUrl.searchParams.get("tier");

  const drafts = await prisma.emailDraft.findMany({
    where: {
      tenantId: auth.tenantId,
      status: "PENDING_REVIEW",
      ...(tierParam
        ? { lead: { tier: tierParam as LeadTier } }
        : {}),
    },
    orderBy: { lead: { score: "desc" } },
    include: {
      lead: {
        include: {
          answers: {
            where: { fieldKey: { in: ["name", "email", "business"] } },
          },
        },
      },
    },
  });

  return NextResponse.json({ drafts });
}
