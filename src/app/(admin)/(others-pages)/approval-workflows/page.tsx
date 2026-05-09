import Link from "next/link";
import { listPendingApprovalsForMe } from "@/lib/catalog/queries";
import { requireProfile } from "@/lib/auth";
import { Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Pending Approvals | ifBash" };

export default async function ApprovalWorkflowsPage() {
  const profile = await requireProfile();
  const all = await listPendingApprovalsForMe();

  // Filter to ones actionable by this user *now* (current_stage match + role/user match)
  const mine = all.filter((a) => {
    const onActiveStage = a.request.current_stage === a.stage;
    if (!onActiveStage) return false;
    if (a.approver_id === profile.id) return true;
    if (a.approver_kind === "role" && a.required_role === profile.role) return true;
    if (profile.role === "owner" || profile.role === "admin") return true;
    return false;
  });

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
          Pending Approvals
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          {mine.length} request{mine.length === 1 ? "" : "s"} awaiting your decision
        </p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 pb-24">
        {mine.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-sm text-slate-500">
            All clear — no requests need your approval right now.
          </div>
        ) : (
          <div className="space-y-3">
            {mine.map((a) => (
              <Link
                key={a.id}
                href={`/my-requests/${a.request.code}`}
                className="block rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-slate-500">{a.request.code}</span>
                      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                        Stage {a.stage + 1} of {a.request.total_stages}
                      </span>
                    </div>
                    <h3 className="font-medium text-slate-900 dark:text-white truncate">
                      {a.request.item_name_snapshot}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {a.request.category_name_snapshot}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock size={12} />
                      {a.request.submitted_at
                        ? new Date(a.request.submitted_at).toLocaleDateString()
                        : "—"}
                    </span>
                    {a.request.due_at && (
                      <span className="text-[11px] text-slate-400">
                        Due {new Date(a.request.due_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
