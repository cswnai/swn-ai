import { NextRequest, NextResponse } from "next/server";
import { requireTenantAccess, isAuthError } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { FieldType } from "@prisma/client";

const fieldSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1),
  key: z.string().min(1).regex(/^[a-z0-9_]+$/),
  type: z.nativeEnum(FieldType),
  placeholder: z.string().optional(),
  isRequired: z.boolean().default(false),
  order: z.number().int(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  scoringWeight: z.number().min(0).max(10).default(1.0),
  scoringHint: z.string().optional(),
});

const putSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  submitButtonLabel: z.string().default("Submit"),
  thankYouMessage: z.string().default("We'll be in touch soon!"),
  fields: z.array(fieldSchema),
});

export async function GET(_req: NextRequest) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const formConfig = await prisma.formConfig.findUnique({
    where: { tenantId: auth.tenantId },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json({ formConfig });
}

export async function PUT(req: NextRequest) {
  const auth = await requireTenantAccess();
  if (isAuthError(auth)) return auth;

  const body = putSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: body.error.flatten() },
      { status: 422 }
    );
  }

  const { fields, ...configData } = body.data;

  const formConfig = await prisma.$transaction(async (tx) => {
    const existing = await tx.formConfig.findUnique({
      where: { tenantId: auth.tenantId },
    });

    let config;
    if (existing) {
      await tx.formField.deleteMany({ where: { formConfigId: existing.id } });
      config = await tx.formConfig.update({
        where: { id: existing.id },
        data: configData,
      });
    } else {
      config = await tx.formConfig.create({
        data: { tenantId: auth.tenantId, ...configData },
      });
    }

    await tx.formField.createMany({
      data: fields.map(({ id: _id, ...f }) => ({
        ...f,
        formConfigId: config.id,
        options: f.options ?? undefined,
      })),
    });

    return tx.formConfig.findUniqueOrThrow({
      where: { id: config.id },
      include: { fields: { orderBy: { order: "asc" } } },
    });
  });

  return NextResponse.json({ formConfig });
}
