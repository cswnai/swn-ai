export function TierBadge({ tier }: { tier: string | null }) {
  if (!tier) return <span className="text-white/30 text-xs">—</span>;

  const styles: Record<string, string> = {
    HIGH: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    MEDIUM: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    LOW: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  };

  const emoji: Record<string, string> = {
    HIGH: "🔥",
    MEDIUM: "⚡",
    LOW: "💧",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[tier] ?? ""}`}
    >
      {emoji[tier]} {tier}
    </span>
  );
}
