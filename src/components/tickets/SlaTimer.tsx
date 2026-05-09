"use client";

import { useEffect, useState } from "react";

function fmtMs(ms: number): string {
  const sign = ms < 0 ? "-" : "";
  const a = Math.abs(ms);
  const h = Math.floor(a / 3_600_000);
  const m = Math.floor((a % 3_600_000) / 60_000);
  if (h >= 24) return `${sign}${Math.floor(h / 24)}d ${h % 24}h`;
  return `${sign}${h}h ${m}m`;
}

export default function SlaTimer({
  resolutionDueAt,
  resolved,
  breached,
}: {
  resolutionDueAt: string | null;
  resolved: boolean;
  breached: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setNow(Date.now());
    });
    if (resolved || !resolutionDueAt) {
      return () => {
        cancelled = true;
      };
    }
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [resolved, resolutionDueAt]);

  if (now === null) {
    return <span className="text-xs text-slate-500">—</span>;
  }

  if (!resolutionDueAt) {
    return <span className="text-xs text-slate-500">No SLA</span>;
  }
  const due = new Date(resolutionDueAt).getTime();
  const remaining = due - now;
  const tone =
    resolved
      ? "text-slate-500"
      : remaining < 0 || breached
        ? "text-red-600 dark:text-red-400"
        : remaining < 60 * 60 * 1000
          ? "text-orange-600 dark:text-orange-400"
          : "text-emerald-600 dark:text-emerald-400";

  return (
    <span className={`text-xs font-medium ${tone}`}>
      {resolved ? "Resolved" : breached ? `Breached ${fmtMs(remaining)}` : `Due in ${fmtMs(remaining)}`}
    </span>
  );
}
