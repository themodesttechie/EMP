"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Sparkles, TrendingUp, ChevronRight } from "lucide-react";
import { explainTrendAction } from "@/lib/reports/actions";
import type {
  CsatTrendRow,
  KpiSummary,
  ResolutionTimeRow,
  SlaComplianceRow,
  TicketVolumeRow,
} from "@/lib/reports/queries";

type Props = {
  kpi: KpiSummary;
  volume: TicketVolumeRow[];
  mttr: ResolutionTimeRow[];
  sla: SlaComplianceRow[];
  csat: CsatTrendRow[];
};

export default function ReportsDashboard({
  kpi,
  volume,
  mttr,
  sla,
  csat,
}: Props) {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Reports
        </h1>
        <p className="text-sm text-slate-500">
          Last 90 days. Click &quot;Explain this&quot; on any chart for an AI breakdown.
        </p>
      </header>

      <KpiGrid kpi={kpi} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Ticket volume (daily)"
          viewSlug="v_ticket_volume_daily"
        >
          <VolumeChart rows={volume} />
        </ChartCard>
        <ChartCard title="CSAT trend (weekly)" viewSlug="v_csat_trend">
          <CsatChart rows={csat} />
        </ChartCard>
        <ChartCard
          title="Resolution time by priority"
          viewSlug="v_ticket_resolution_time"
        >
          <MttrChart rows={mttr} />
        </ChartCard>
        <ChartCard title="SLA compliance" viewSlug="v_sla_compliance">
          <SlaChart rows={sla} />
        </ChartCard>
      </div>

      <CategoryBreakdown mttr={mttr} sla={sla} />
    </div>
  );
}

function KpiGrid({ kpi }: { kpi: KpiSummary }) {
  const cards = [
    { label: "MTTR (avg)", value: kpi.mttr_minutes !== null ? `${formatMinutes(kpi.mttr_minutes)}` : "—" },
    { label: "FCR", value: kpi.fcr_pct !== null ? `${kpi.fcr_pct}%` : "—" },
    { label: "SLA compliance", value: kpi.sla_compliance_pct !== null ? `${kpi.sla_compliance_pct}%` : "—" },
    { label: "Auto-resolve", value: `${kpi.auto_resolve_pct}%` },
    { label: "Deflection", value: `${kpi.deflection_pct}%` },
    { label: "CSAT", value: kpi.csat_avg !== null ? `${kpi.csat_avg} / 5` : "—" },
    { label: "AI $/resolved", value: `$${kpi.ai_cost_per_resolved_usd.toFixed(3)}` },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4"
        >
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {c.label}
          </div>
          <div className="mt-1.5 text-xl font-bold text-slate-900 dark:text-white">
            {c.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartCard({
  title,
  viewSlug,
  children,
}: {
  title: string;
  viewSlug: string;
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [explainer, setExplainer] = useState<{
    narrative: string;
    factors: { label: string; weight: number; evidence: string }[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const r = await explainTrendAction(viewSlug);
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
            className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 disabled:opacity-50 dark:bg-brand-500/10 dark:text-brand-400"
          >
            <Sparkles size={12} />
            {pending ? "Thinking..." : "Explain this"}
          </button>
          <Link
            href={`/reports/${viewSlug}`}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            Drill down <ChevronRight size={12} />
          </Link>
        </div>
      </div>
      <div className="mt-4 h-64">{children}</div>
      {error ? (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      ) : null}
      {explainer ? (
        <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-400">
            <TrendingUp size={12} />
            AI explainer
          </div>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
            {explainer.narrative}
          </p>
          {explainer.factors.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {explainer.factors.map((f, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                  <span>
                    <strong className="text-slate-900 dark:text-white">
                      {f.label}
                    </strong>{" "}
                    — {f.evidence}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function VolumeChart({ rows }: { rows: TicketVolumeRow[] }) {
  const data = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const r of rows) {
      byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.ticket_count);
    }
    return Array.from(byDay, ([day, count]) => ({ day, count })).sort((a, b) =>
      a.day.localeCompare(b.day),
    );
  }, [rows]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#465fff"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CsatChart({ rows }: { rows: CsatTrendRow[] }) {
  const data = rows.map((r) => ({
    week: r.week.slice(5),
    avg: r.avg_score === null ? null : Number(r.avg_score),
    count: r.response_count,
  }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="week" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="avg"
          stroke="#10b981"
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function MttrChart({ rows }: { rows: ResolutionTimeRow[] }) {
  const data = useMemo(() => {
    const byPri = new Map<string, { total: number; count: number }>();
    for (const r of rows) {
      if (r.avg_minutes === null) continue;
      const cur = byPri.get(r.priority) ?? { total: 0, count: 0 };
      cur.total += Number(r.avg_minutes) * r.resolved_count;
      cur.count += r.resolved_count;
      byPri.set(r.priority, cur);
    }
    return ["P1", "P2", "P3", "P4"].map((p) => {
      const cur = byPri.get(p);
      return {
        priority: p,
        avg_minutes: cur && cur.count > 0 ? Number((cur.total / cur.count).toFixed(0)) : 0,
      };
    });
  }, [rows]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v} min`, "Avg"]} />
        <Bar dataKey="avg_minutes" fill="#465fff" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function SlaChart({ rows }: { rows: SlaComplianceRow[] }) {
  const data = useMemo(() => {
    const byPri = new Map<string, { total: number; met: number }>();
    for (const r of rows) {
      const cur = byPri.get(r.priority) ?? { total: 0, met: 0 };
      cur.total += r.total;
      cur.met += r.met;
      byPri.set(r.priority, cur);
    }
    return ["P1", "P2", "P3", "P4"].map((p) => {
      const cur = byPri.get(p) ?? { total: 0, met: 0 };
      const pct = cur.total === 0 ? 0 : Number(((100 * cur.met) / cur.total).toFixed(1));
      return { priority: p, compliance: pct };
    });
  }, [rows]);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => [`${v}%`, "SLA"]} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="compliance" fill="#10b981" name="SLA met %" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function CategoryBreakdown({
  mttr,
  sla,
}: {
  mttr: ResolutionTimeRow[];
  sla: SlaComplianceRow[];
}) {
  type Row = {
    category: string;
    resolved: number;
    avg_minutes: number | null;
    sla_pct: number | null;
  };
  const data: Row[] = useMemo(() => {
    const byCat = new Map<string, Row>();
    for (const r of mttr) {
      const key = r.category_name ?? "Uncategorised";
      const cur = byCat.get(key) ?? {
        category: key,
        resolved: 0,
        avg_minutes: null,
        sla_pct: null,
      };
      cur.resolved += r.resolved_count;
      if (r.avg_minutes !== null) {
        const prev = cur.avg_minutes ?? 0;
        cur.avg_minutes =
          cur.resolved === 0
            ? Number(r.avg_minutes)
            : Number(((prev + Number(r.avg_minutes)) / 2).toFixed(2));
      }
      byCat.set(key, cur);
    }
    for (const r of sla) {
      const key = r.category_name ?? "Uncategorised";
      const cur = byCat.get(key);
      if (!cur) continue;
      cur.sla_pct = Number(r.compliance_pct);
    }
    return Array.from(byCat.values()).sort((a, b) => b.resolved - a.resolved);
  }, [mttr, sla]);

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
      <header className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Per-category breakdown
        </h3>
      </header>
      <div className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr className="text-left">
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Resolved</th>
              <th className="px-5 py-3 font-semibold">Avg time</th>
              <th className="px-5 py-3 font-semibold">SLA met</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                  No data yet.
                </td>
              </tr>
            ) : (
              data.map((r) => (
                <tr
                  key={r.category}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-5 py-3">{r.category}</td>
                  <td className="px-5 py-3">{r.resolved}</td>
                  <td className="px-5 py-3">
                    {r.avg_minutes === null ? "—" : formatMinutes(r.avg_minutes)}
                  </td>
                  <td className="px-5 py-3">
                    {r.sla_pct === null ? "—" : `${r.sla_pct}%`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)}m`;
  const h = min / 60;
  if (h < 48) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}
