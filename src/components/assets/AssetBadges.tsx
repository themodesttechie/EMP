import type { AssetCondition, CiStatus } from "@/lib/assets/types";

const STATUS_STYLES: Record<CiStatus, string> = {
  planned: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  in_stock: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  assigned: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  in_repair: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  retired: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
  lost: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const CONDITION_STYLES: Record<AssetCondition, string> = {
  new: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  good: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  fair: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  damaged: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export function StatusBadge({ status }: { status: CiStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_STYLES[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function ConditionBadge({ condition }: { condition: AssetCondition }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${CONDITION_STYLES[condition]}`}>
      {condition}
    </span>
  );
}
