import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TierBadge } from "@/components/admin/TierBadge";
import { ScoreBadge } from "@/components/admin/ScoreBadge";
import { LeadStatus, LeadTier } from "@prisma/client";

interface Props {
  searchParams: Promise<{
    tier?: string;
    status?: string;
    page?: string;
    search?: string;
  }>;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  SCORED: "Scored",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  NURTURING: "Nurturing",
  ARCHIVED: "Archived",
};

export default async function LeadsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/admin/login");

  const { tier, status, page: pageStr, search } = await searchParams;
  const page = Number(pageStr ?? "1");
  const limit = 25;

  const where = {
    tenantId: session.user.tenantId,
    ...(tier ? { tier: tier as LeadTier } : {}),
    ...(status ? { status: status as LeadStatus } : {}),
    ...(search
      ? { answers: { some: { value: { contains: search, mode: "insensitive" as const } } } }
      : {}),
  };

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        answers: { where: { fieldKey: { in: ["name", "email", "business"] } } },
      },
    }),
    prisma.lead.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const getAnswer = (
    lead: (typeof leads)[number],
    key: string
  ) => lead.answers.find((a) => a.fieldKey === key)?.value ?? "—";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="mt-1 text-sm text-white/50">{total} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["", "HIGH", "MEDIUM", "LOW"] as const).map((t) => (
          <Link
            key={t || "all"}
            href={`/admin/leads?${new URLSearchParams({ ...(t ? { tier: t } : {}), ...(status ? { status } : {}) }).toString()}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              (tier ?? "") === t
                ? "bg-[#00E5FF] text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {t || "All Tiers"}
          </Link>
        ))}
        <span className="w-px bg-white/10" />
        {(["", "NEW", "SCORED", "APPROVED", "REJECTED", "NURTURING"] as const).map((s) => (
          <Link
            key={s || "all-status"}
            href={`/admin/leads?${new URLSearchParams({ ...(tier ? { tier } : {}), ...(s ? { status: s } : {}) }).toString()}`}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              (status ?? "") === s
                ? "bg-[#00E5FF] text-black"
                : "bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            {s ? STATUS_LABELS[s] : "All Statuses"}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr>
              {["Name", "Business", "Email", "Score", "Tier", "Status", "Submitted", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/40"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {leads.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-white/30"
                >
                  No leads yet.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-white/90">
                  {getAnswer(lead, "name")}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {getAnswer(lead, "business")}
                </td>
                <td className="px-4 py-3 text-white/50 font-mono text-xs">
                  {getAnswer(lead, "email")}
                </td>
                <td className="px-4 py-3">
                  <ScoreBadge score={lead.score} />
                </td>
                <td className="px-4 py-3">
                  <TierBadge tier={lead.tier} />
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-white/50">
                    {STATUS_LABELS[lead.status] ?? lead.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-white/40">
                  {new Date(lead.submittedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="text-xs text-[#00E5FF] hover:underline"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-white/40">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/leads?page=${page - 1}${tier ? `&tier=${tier}` : ""}${status ? `&status=${status}` : ""}`}
                className="rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors"
              >
                ← Prev
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/leads?page=${page + 1}${tier ? `&tier=${tier}` : ""}${status ? `&status=${status}` : ""}`}
                className="rounded-lg bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
