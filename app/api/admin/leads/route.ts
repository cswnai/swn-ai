import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess, isAuthError } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { LeadStatus, LeadTier } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const url = req.nextUrl;
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "25");
  const tierParam = url.searchParams.get("tier");
  const statusParam = url.searchParams.get("status");
  const search = url.searchParams.get("search") ?? "";

  const where = {
    tenantId: auth.tenantId,
    ...(tierParam ? { tier: tierParam as LeadTier } : {}),
    ...(statusParam ? { status: statusParam as LeadStatus } : {}),
    ...(search
      ? {
          answers: {
            some: {
              value: { contains: search, mode: "insensitive" as const },
            },
          },
        }
      : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        answers: {
          where: { fieldKey: { in: ["name", "email", "business"] } },
        },
        _count: { select: { emailDrafts: true } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  return NextResponse.json({ leads, total, page, limit });
}
