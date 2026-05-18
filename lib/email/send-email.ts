import { resend } from "./resend-client";
import { prisma } from "../prisma";

export async function sendEmailDraft(
  draftId: string,
  approvedByUserId?: string
): Promise<void> {
  const draft = await prisma.emailDraft.findUniqueOrThrow({
    where: { id: draftId },
    include: { tenant: true },
  });

  const subject = draft.editedSubject ?? draft.subject;
  const html = draft.editedBodyHtml ?? draft.bodyHtml;
  const text = draft.editedBodyText ?? draft.bodyText;

  const result = await resend.emails.send({
    from: draft.tenant.fromEmail,
    replyTo: draft.tenant.replyToEmail ?? draft.tenant.fromEmail,
    to: draft.toEmail,
    subject,
    html,
    text,
  });

  await prisma.emailDraft.update({
    where: { id: draftId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      resendMessageId: result.data?.id ?? null,
      approvedAt: approvedByUserId ? new Date() : undefined,
      approvedByUserId: approvedByUserId ?? undefined,
    },
  });
}
