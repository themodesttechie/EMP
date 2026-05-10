type Props = {
  score: number | null;
  reasoning?: string | null;
  factors?: string[];
  compact?: boolean;
};

function bandFor(score: number): { label: string; cls: string; ring: string } {
  if (score < 0.3) {
    return {
      label: "Low",
      cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
      ring: "ring-emerald-200 dark:ring-emerald-500/30",
    };
  }
  if (score < 0.7) {
    return {
      label: "Moderate",
      cls: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
      ring: "ring-amber-200 dark:ring-amber-500/30",
    };
  }
  return {
    label: "High",
    cls: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    ring: "ring-red-200 dark:ring-red-500/30",
  };
}

export default function RiskScore({ score, reasoning, factors, compact }: Props) {
  if (score == null) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-500">
        Risk: not scored
      </span>
    );
  }
  const band = bandFor(score);
  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${band.cls}`}
      >
        Risk {(score * 100).toFixed(0)} <span className="opacity-60">· {band.label}</span>
      </span>
    );
  }
  return (
    <div
      className={`rounded-xl border bg-white dark:bg-[#121212] p-4 ring-1 ${band.ring} border-slate-200 dark:border-slate-800`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500">AI risk score</p>
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${band.cls}`}>
          {(score * 100).toFixed(0)} / 100 · {band.label}
        </span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${score < 0.3 ? "bg-emerald-500" : score < 0.7 ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width: `${Math.max(2, score * 100)}%` }}
        />
      </div>
      {reasoning ? (
        <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{reasoning}</p>
      ) : null}
      {factors && factors.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {factors.map((f, i) => (
            <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
