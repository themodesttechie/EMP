import type { TicketPriority, TicketState } from "@/lib/tickets/types";

const STATE_STYLES: Record<TicketState, string> = {
  new: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  triage: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  pending_user: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  resolved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  closed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
  cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
};

const PRIORITY_STYLES: Record<TicketPriority, string> = {
  P1: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  P2: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  P3: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  P4: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function StateBadge({ state }: { state: TicketState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATE_STYLES[state]}`}
    >
      {state.replace("_", " ")}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
