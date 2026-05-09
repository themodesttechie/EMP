"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Change, ChangeState, ChangeType } from "@/lib/changes/types";
import { CHANGE_STATES, CHANGE_TYPES } from "@/lib/changes/types";
import { ChangeStateBadge, ChangeTypeBadge } from "./ChangeBadges";
import RiskScore from "./RiskScore";
import { useRealtime } from "@/hooks/useRealtime";

type Profile = { id: string; full_name: string | null; email: string; role: string };

type Props = {
  changes: Change[];
  profiles: Profile[];
  myProfileId: string;
  myTenantId: string;
  myRole: string;
};

export default function ChangesList(props: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState({ state: "", type: "", requester: "", scheduled: "" });

  useRealtime({
    table: "changes",
    filter: `tenant_id=eq.${props.myTenantId}`,
    onChange: () => router.refresh(),
  });

  const profileLookup = useMemo(() => {
    const m = new Map<string, Profile>();
    for (const p of props.profiles) m.set(p.id, p);
    return m;
  }, [props.profiles]);

  const filtered = useMemo(() => {
    return props.changes.filter((c) => {
      if (filter.state && c.state !== filter.state) return false;
      if (filter.type && c.type !== filter.type) return false;
      if (filter.requester && c.requester_id !== filter.requester) return false;
      if (filter.scheduled === "today") {
        if (!c.planned_start) return false;
        const today = new Date();
        const d = new Date(c.planned_start);
        if (d.toDateString() !== today.toDateString()) return false;
      }
      if (filter.scheduled === "week") {
        if (!c.planned_start) return false;
        const now = new Date();
        const week = new Date(now.getTime() + 7 * 86400_000);
        const d = new Date(c.planned_start);
        if (d > week || d < now) return false;
      }
      return true;
    });
  }, [props.changes, filter]);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
            Change management
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            {filtered.length} of {props.changes.length} changes
          </p>
        </div>
        <Link
          href="/changes/new"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          New change
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 pb-24">
        <div className="bg-white dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={filter.state}
            onChange={(e) => setFilter({ ...filter, state: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">All states</option>
            {CHANGE_STATES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">All types</option>
            {CHANGE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={filter.requester}
            onChange={(e) => setFilter({ ...filter, requester: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">All requesters</option>
            {props.profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || p.email}
              </option>
            ))}
          </select>
          <select
            value={filter.scheduled}
            onChange={(e) => setFilter({ ...filter, scheduled: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">Any schedule</option>
            <option value="today">Scheduled today</option>
            <option value="week">Scheduled this week</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Number</th>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">State</th>
                <th className="text-left px-4 py-3 font-medium">Risk</th>
                <th className="text-left px-4 py-3 font-medium">Requester</th>
                <th className="text-left px-4 py-3 font-medium">Planned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center px-4 py-10 text-sm text-slate-500">
                    No changes match the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const requester = profileLookup.get(c.requester_id);
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                      onClick={() => router.push(`/changes/${c.number}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-brand-600">
                        <Link href={`/changes/${c.number}`} className="hover:underline">
                          {c.number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-white">{c.title}</td>
                      <td className="px-4 py-3">
                        <ChangeTypeBadge type={c.type as ChangeType} />
                      </td>
                      <td className="px-4 py-3">
                        <ChangeStateBadge state={c.state as ChangeState} />
                      </td>
                      <td className="px-4 py-3">
                        <RiskScore score={c.risk_score} compact />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {requester?.full_name || requester?.email || "-"}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {c.planned_start
                          ? new Date(c.planned_start).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
