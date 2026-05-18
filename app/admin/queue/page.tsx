import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TierBadge } from "@/components/admin/TierBadge";
import { ScoreBadge } from "@/components/admin/ScoreBadge";
import { LeadTier } from "@prisma/client";

interface Props {
  searchParams: Promise<{ tier?: string }>;
}

export default async function QueuePage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const { tier } = await searchParams;

  const drafts = await prisma.emailDraft.findMany({
    where: {
      tenantId: session.user.tenantId,
      status: "PENDING_REVIEW",
      ...(tier ? { lead: { tier: tier as LeadTier } } : {}),
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

  const getAnswer = (
    lead: (typeof drafts)[number]["lead"],
    key: string
  ) => lead.answers.find((a) => a.fieldKey === key)?.value ?? "—";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
        <p className="mt-1 text-sm text-white/50">
          {drafts.length} email{drafts.length !== 1 ? "s" : ""} pending review
        </p>
      </div>

      {/* Tier filter */}
      <div className="mb-4 flex gap-2">
        {(["", "HIGH", "MEDIUM", "LOW"] as const).map((t) => (
          <Link
            key={t || "all"}
            href={`/admin/queue${t ? `?tier=${t}` : ""}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              (tier ?? "") === t
                ? "bg-[#00E5FF] text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {t || "All"}
          </Link>
        ))}
      </div>

      {drafts.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-12 text-center">
          <p className="text-white/30">Queue is clear — no emails pending review.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-white">
                    {getAnswer(draft.lead, "name")}
                  </span>
                  <span className="text-white/40">·</span>
                  <span className="text-sm text-white/60">
                    {getAnswer(draft.lead, "business")}
                  </span>
                  <ScoreBadge score={draft.lead.score} />
                  <TierBadge tier={draft.lead.tier} />
                </div>
                <p className="text-sm font-medium text-white/80">
                  {draft.editedSubject ?? draft.subject}
                </p>
                <p className="mt-0.5 text-xs text-white/40">
                  To: {draft.toEmail}
                </p>
              </div>
              <Link
                href={`/admin/queue/${draft.id}`}
                className="shrink-0 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-4 py-2 text-sm font-medium text-[#00E5FF] hover:bg-[#00E5FF]/20 transition-colors"
              >
                Review
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
