import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TierBadge } from "@/components/admin/TierBadge";
import { ScoreBadge } from "@/components/admin/ScoreBadge";
import { DraftEditor } from "@/components/admin/DraftEditor";

interface Props {
  params: Promise<{ draftId: string }>;
}

export default async function DraftPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const { draftId } = await params;

  const draft = await prisma.emailDraft.findFirst({
    where: { id: draftId, tenantId: session.user.tenantId },
    include: {
      lead: { include: { answers: { orderBy: { id: "asc" } } } },
    },
  });

  if (!draft) notFound();

  const getName = (key: string) =>
    draft.lead.answers.find((a) => a.fieldKey === key)?.value ?? "—";

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/queue"
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          ← Queue
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/70">{getName("name")}</span>
        <ScoreBadge score={draft.lead.score} />
        <TierBadge tier={draft.lead.tier} />
      </div>

      <h1 className="mb-6 text-xl font-bold text-white">
        Review email for {getName("name")}
      </h1>

      <DraftEditor draft={draft} />
    </div>
  );
}
