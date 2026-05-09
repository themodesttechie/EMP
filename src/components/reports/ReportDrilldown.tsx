"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, TrendingUp } from "lucide-react";
import { explainTrendAction } from "@/lib/reports/actions";

type Props = {
  slug: string;
  title: string;
  rows: Record<string, unknown>[];
};

export default function ReportDrilldown({ slug, title, rows }: Props) {
  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]);
  }, [rows]);

  const [pending, startTransition] = useTransition();
  const [explainer, setExplainer] = useState<{
    narrative: string;
    factors: { label: string; weight: number; evidence: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/reports"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft size={12} /> All reports
          </Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="text-sm text-slate-500">
            View <code>{slug}</code>. {rows.length} rows.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const r = await explainTrendAction(slug);
              if (r.ok) {
                setExplainer({
                  narrative: r.narrative,
                  factors: r.top_factors,
                });
              } else {
                setError(r.error);
              }
            });
          }}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Sparkles size={14} />
          {pending ? "Thinking..." : "Explain this"}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {explainer ? (
        <section className="rounded-2xl border border-brand-200 dark:border-brand-700/40 bg-brand-50/50 dark:bg-brand-500/5 p-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400">
            <TrendingUp size={12} /> AI explainer
          </div>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
            {explainer.narrative}
          </p>
          {explainer.factors.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {explainer.factors.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                  <span>
                    <strong className="text-slate-900 dark:text-white">
                      {f.label}
                    </strong>{" "}
                    ({Math.round(f.weight * 100)}%) — {f.evidence}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
        {rows.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-500">
            No rows in this view.
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr className="text-left">
                  {columns.map((c) => (
                    <th key={c} className="px-4 py-3 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                  >
                    {columns.map((c) => (
                      <td key={c} className="px-4 py-2 font-mono text-xs">
                        {formatCell(r[c])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatCell(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  if (typeof v === "number") return String(v);
  return String(v);
}
