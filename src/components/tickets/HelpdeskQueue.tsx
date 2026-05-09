"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Ticket, TicketCategory, TicketPriority, TicketState } from "@/lib/tickets/types";
import { PriorityBadge, StateBadge } from "./TicketBadges";
import SlaTimer from "./SlaTimer";
import NewTicketModal from "./NewTicketModal";
import { useRealtime } from "@/hooks/useRealtime";

type Profile = { id: string; full_name: string | null; email: string; role: string };

type Props = {
  tickets: Ticket[];
  categories: TicketCategory[];
  profiles: Profile[];
  myProfileId: string;
  myTenantId: string;
  myRole: string;
  canSeeAll: boolean;
};

const STATES: TicketState[] = ["new", "triage", "in_progress", "pending_user", "resolved", "closed", "cancelled"];
const PRIORITIES: TicketPriority[] = ["P1", "P2", "P3", "P4"];

export default function HelpdeskQueue(props: Props) {
  const router = useRouter();
  const [filter, setFilter] = useState({ state: "", priority: "", category: "", assignee: "" });
  const [modalOpen, setModalOpen] = useState(false);

  useRealtime({
    table: "tickets",
    filter: `tenant_id=eq.${props.myTenantId}`,
    onChange: () => router.refresh(),
  });

  const profileLookup = useMemo(() => {
    const m = new Map<string, Profile>();
    for (const p of props.profiles) m.set(p.id, p);
    return m;
  }, [props.profiles]);

  const categoryLookup = useMemo(() => {
    const m = new Map<string, TicketCategory>();
    for (const c of props.categories) m.set(c.id, c);
    return m;
  }, [props.categories]);

  const filtered = useMemo(() => {
    return props.tickets.filter((t) => {
      if (filter.state && t.state !== filter.state) return false;
      if (filter.priority && t.priority !== filter.priority) return false;
      if (filter.category && t.category_id !== filter.category) return false;
      if (filter.assignee && t.assignee_id !== filter.assignee) return false;
      return true;
    });
  }, [props.tickets, filter]);

  const headerLabel = props.canSeeAll ? "Helpdesk queue" : "My tickets";
  const subLabel = props.canSeeAll
    ? `${filtered.length} of ${props.tickets.length} tickets`
    : `${filtered.length} tickets`;

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">{headerLabel}</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">{subLabel}</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          New ticket
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 pb-24">
        <div className="bg-white dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <select
            value={filter.state}
            onChange={(e) => setFilter({ ...filter, state: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">All states</option>
            {STATES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={filter.priority}
            onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {props.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {props.canSeeAll ? (
            <select
              value={filter.assignee}
              onChange={(e) => setFilter({ ...filter, assignee: e.target.value })}
              className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
            >
              <option value="">All assignees</option>
              {props.profiles
                .filter((p) => ["agent", "admin", "owner", "manager"].includes(p.role))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name || p.email}
                  </option>
                ))}
            </select>
          ) : (
            <div />
          )}
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Number</th>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">State</th>
                <th className="text-left px-4 py-3 font-medium">Priority</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Assignee</th>
                <th className="text-left px-4 py-3 font-medium">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center px-4 py-10 text-sm text-slate-500">
                    No tickets match the filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
                    onClick={() => router.push(`/helpdesk/${t.number}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-brand-600">
                      <Link href={`/helpdesk/${t.number}`} className="hover:underline">
                        {t.number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">{t.title}</td>
                    <td className="px-4 py-3">
                      <StateBadge state={t.state} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {t.category_id ? categoryLookup.get(t.category_id)?.name ?? "—" : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {t.assignee_id
                        ? profileLookup.get(t.assignee_id)?.full_name ||
                          profileLookup.get(t.assignee_id)?.email ||
                          "—"
                        : "Unassigned"}
                    </td>
                    <td className="px-4 py-3">
                      <SlaTimer
                        resolutionDueAt={t.resolution_due_at}
                        resolved={["resolved", "closed", "cancelled"].includes(t.state)}
                        breached={t.sla_breached}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <NewTicketModal open={modalOpen} onClose={() => setModalOpen(false)} categories={props.categories} />
    </div>
  );
}
