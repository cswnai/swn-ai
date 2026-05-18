import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TierBadge } from "@/components/admin/TierBadge";
import { ScoreBadge } from "@/components/admin/ScoreBadge";

interface Props {
  params: Promise<{ leadId: string }>;
}

const DRAFT_STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Pending review",
  APPROVED: "Approved",
  SENT: "Sent",
  REJECTED: "Rejected",
};

export default async function LeadDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const { leadId } = await params;

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, tenantId: session.user.tenantId },
    include: {
      answers: { orderBy: { id: "asc" } },
      emailDrafts: { orderBy: { createdAt: "desc" } },
      nurtureEmails: { orderBy: { stepNumber: "asc" } },
    },
  });

  if (!lead) notFound();

  const getName = (key: string) =>
    lead.answers.find((a) => a.fieldKey === key)?.value ?? "—";

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/leads"
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          ← Leads
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-sm text-white/70">{getName("name")}</span>
      </div>

      <div className="mb-8 flex flex-wrap items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{getName("name")}</h1>
          <p className="mt-1 text-white/50">{getName("business")}</p>
        </div>
        <div className="flex gap-2 mt-1">
          <ScoreBadge score={lead.score} />
          <TierBadge tier={lead.tier} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Form Answers */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
            Form Answers
          </h2>
          <dl className="flex flex-col gap-3">
            {lead.answers.map((answer) => (
              <div key={answer.id}>
                <dt className="text-xs text-white/40">{answer.fieldLabel}</dt>
                <dd className="mt-0.5 text-sm text-white/90">{answer.value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* AI Scoring */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
            AI Scoring
          </h2>
          {lead.score !== null ? (
            <div className="flex flex-col gap-3">
              <div>
                <dt className="text-xs text-white/40">Score</dt>
                <dd className="mt-1">
                  <ScoreBadge score={lead.score} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-white/40">Tier</dt>
                <dd className="mt-1">
                  <TierBadge tier={lead.tier} />
                </dd>
              </div>
              {lead.scoreRationale && (
                <div>
                  <dt className="text-xs text-white/40">Rationale</dt>
                  <dd className="mt-0.5 text-sm text-white/70">
                    {lead.scoreRationale}
                  </dd>
                </div>
              )}
              {lead.scoredAt && (
                <div>
                  <dt className="text-xs text-white/40">Scored at</dt>
                  <dd className="mt-0.5 text-xs text-white/40">
                    {new Date(lead.scoredAt).toLocaleString("en-GB")}
                  </dd>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/30">
              Lead is being scored… check back shortly.
            </p>
          )}
        </section>

        {/* Email Drafts */}
        <section className="rounded-xl border border-white/10 bg-white/5 p-5 md:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
            Email Drafts
          </h2>
          {lead.emailDrafts.length === 0 ? (
            <p className="text-sm text-white/30">No email drafts yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {lead.emailDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-white/80">
                      {draft.editedSubject ?? draft.subject}
                    </p>
                    <p className="mt-0.5 text-xs text-white/40">
                      To: {draft.toEmail} ·{" "}
                      {DRAFT_STATUS_LABELS[draft.status] ?? draft.status}
                    </p>
                  </div>
                  {draft.status === "PENDING_REVIEW" && (
                    <Link
                      href={`/admin/queue/${draft.id}`}
                      className="ml-4 shrink-0 text-xs text-[#00E5FF] hover:underline"
                    >
                      Review →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Nurture Emails */}
        {lead.nurtureEmails.length > 0 && (
          <section className="rounded-xl border border-white/10 bg-white/5 p-5 md:col-span-2">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
              Nurture Sequence
            </h2>
            <div className="flex flex-col gap-2">
              {lead.nurtureEmails.map((ne) => (
                <div
                  key={ne.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3"
                >
                  <div>
                    <p className="text-xs text-white/50">
                      Step {ne.stepNumber}
                    </p>
                    <p className="text-sm text-white/70">
                      Scheduled:{" "}
                      {new Date(ne.scheduledFor).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      ne.status === "SENT"
                        ? "text-emerald-400"
                        : ne.status === "FAILED"
                          ? "text-red-400"
                          : ne.status === "CANCELLED"
                            ? "text-white/30"
                            : "text-yellow-400"
                    }`}
                  >
                    {ne.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
