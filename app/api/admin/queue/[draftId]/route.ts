import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess, isAuthError } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const { draftId } = await params;

  const draft = await prisma.emailDraft.findFirst({
    where: { id: draftId, tenantId: auth.tenantId },
    include: {
      lead: { include: { answers: { orderBy: { id: "asc" } } } },
    },
  });

  if (!draft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ draft });
}

const patchSchema = z.object({
  editedSubject: z.string().optional(),
  editedBodyHtml: z.string().optional(),
  editedBodyText: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ draftId: string }> }
) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const { draftId } = await params;

  const existing = await prisma.emailDraft.findFirst({
    where: { id: draftId, tenantId: auth.tenantId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = patchSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 422 });
  }

  const updated = await prisma.emailDraft.update({
    where: { id: draftId },
    data: body.data,
  });

  return NextResponse.json({ draft: updated });
}
