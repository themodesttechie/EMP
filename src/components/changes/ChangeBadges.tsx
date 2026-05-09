import type { ChangeState, ChangeType, ChangeApprovalState, ChangeTaskState } from "@/lib/changes/types";

const STATE_STYLES: Record<ChangeState, string> = {
  draft: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  cab_review: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  scheduled: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  in_progress: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
  rolled_back: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  cancelled: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
};

const TYPE_STYLES: Record<ChangeType, string> = {
  standard: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  normal: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  emergency: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const APPROVAL_STYLES: Record<ChangeApprovalState, string> = {
  pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  abstained: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
};

const TASK_STYLES: Record<ChangeTaskState, string> = {
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  blocked: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export function ChangeStateBadge({ state }: { state: ChangeState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATE_STYLES[state]}`}
    >
      {state.replace("_", " ")}
    </span>
  );
}

export function ChangeTypeBadge({ type }: { type: ChangeType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TYPE_STYLES[type]}`}
    >
      {type}
    </span>
  );
}

export function ApprovalStateBadge({ state }: { state: ChangeApprovalState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${APPROVAL_STYLES[state]}`}
    >
      {state}
    </span>
  );
}

export function TaskStateBadge({ state }: { state: ChangeTaskState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${TASK_STYLES[state]}`}
    >
      {state.replace("_", " ")}
    </span>
  );
}
