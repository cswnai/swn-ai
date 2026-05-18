import { prisma } from "../prisma";

export async function enrollInNurtureSequence(
  leadId: string,
  tenantId: string
): Promise<void> {
  const sequence = await prisma.nurtureSequence.findFirst({
    where: { tenantId, isActive: true },
    include: { steps: { orderBy: { stepNumber: "asc" } } },
  });

  if (!sequence || sequence.steps.length === 0) return;

  const now = new Date();

  const emails = sequence.steps.map((step) => {
    const scheduledFor = new Date(now);
    scheduledFor.setDate(scheduledFor.getDate() + step.delayDays);

    return {
      leadId,
      tenantId,
      sequenceId: sequence.id,
      stepNumber: step.stepNumber,
      scheduledFor,
    };
  });

  await prisma.nurtureEmail.createMany({ data: emails });
}
