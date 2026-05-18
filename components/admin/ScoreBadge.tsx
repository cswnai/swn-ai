export function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-block rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/30">
        Scoring…
      </span>
    );
  }

  const color =
    score >= 75
      ? "bg-emerald-500/15 text-emerald-400"
      : score >= 40
        ? "bg-yellow-500/15 text-yellow-400"
        : "bg-slate-500/15 text-slate-400";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${color}`}
    >
      {score}/100
    </span>
  );
}
