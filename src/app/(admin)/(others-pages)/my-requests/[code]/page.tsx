import Link from "next/link";
import { notFound } from "next/navigation";
import { getRequestByCode } from "@/lib/catalog/queries";
import { requireProfile } from "@/lib/auth";
import ApprovalActions from "@/components/catalog/ApprovalActions";
import AddCommentForm from "@/components/catalog/AddCommentForm";
import { ChevronLeft, CheckCircle2, XCircle, Clock } from "lucide-react";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const profile = await requireProfile();
  const { code } = await params;
  const data = await getRequestByCode(code);
  if (!data) notFound();
  const { request, approvals, comments, requester } = data;

  const isAdmin = profile.role === "owner" || profile.role === "admin";
  const isAgent = profile.role === "agent";
  const canMarkInternal = isAdmin || isAgent;

  // Show ApprovalActions only for the active stage and the right approver
  const activeApproval = approvals.find((a) => a.stage === request.current_stage);
  const canDecideActive =
    request.status === "pending" &&
    !!activeApproval &&
    activeApproval.decision === "pending" &&
    (activeApproval.approver_id === profile.id ||
      (activeApproval.approver_kind === "role" &&
        activeApproval.required_role === profile.role) ||
      isAdmin);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <Link
          href="/my-requests"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <ChevronLeft size={14} />
          Back to requests
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {request.item_name_snapshot}
          </h1>
          <span className="font-mono text-xs text-slate-500">{request.code}</span>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-1">
          {request.category_name_snapshot} · status <span className="font-semibold">{request.status}</span>
          {request.due_at && ` · due ${new Date(request.due_at).toLocaleString()}`}
        </p>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 pb-24 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Submission detail
            </h2>
            <dl className="space-y-3 text-sm">
              {Object.entries(request.form_data || {}).map(([k, v]) => (
                <div key={k} className="grid grid-cols-3 gap-3">
                  <dt className="text-slate-500 capitalize">{k.replace(/_/g, " ")}</dt>
                  <dd className="col-span-2 text-slate-900 dark:text-white whitespace-pre-wrap">
                    {String(v ?? "—")}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Approval chain
            </h2>
            {approvals.length === 0 ? (
              <p className="text-xs text-slate-500">Auto-approved — no approval steps configured.</p>
            ) : (
              <ol className="space-y-3">
                {approvals.map((a) => {
                  const Icon =
                    a.decision === "approved"
                      ? CheckCircle2
                      : a.decision === "rejected"
                      ? XCircle
                      : Clock;
                  const tone =
                    a.decision === "approved"
                      ? "text-emerald-600"
                      : a.decision === "rejected"
                      ? "text-error-600"
                      : "text-amber-600";
                  return (
                    <li key={a.id} className="flex items-start gap-3">
                      <Icon size={16} className={`mt-0.5 ${tone}`} />
                      <div className="flex-1">
                        <p className="text-sm text-slate-900 dark:text-white">
                          Stage {a.stage + 1}:{" "}
                          {a.approver_kind === "manager"
                            ? "Manager"
                            : a.approver_kind === "role"
                            ? `${a.required_role} (role)`
                            : "Specific approver"}
                          {a.decision !== "pending" && ` · ${a.decision}`}
                        </p>
                        {a.comment && (
                          <p className="text-xs text-slate-500 mt-1">{a.comment}</p>
                        )}
                        {a.decided_at && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(a.decided_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}

            {canDecideActive && activeApproval && (
              <div className="mt-6 border-t border-slate-200 dark:border-slate-800 pt-5">
                <h3 className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">
                  Your decision on stage {activeApproval.stage + 1}
                </h3>
                <ApprovalActions requestId={request.id} stage={activeApproval.stage} />
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Activity
            </h2>
            <ul className="space-y-3">
              {comments.length === 0 && (
                <li className="text-xs text-slate-500">No activity yet.</li>
              )}
              {comments.map((c) => (
                <li
                  key={c.id}
                  className={`rounded-lg p-3 text-sm ${
                    c.kind === "system"
                      ? "bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 italic"
                      : c.is_internal
                      ? "bg-amber-50 dark:bg-amber-500/10 text-slate-800 dark:text-slate-200"
                      : "bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{c.body}</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {new Date(c.created_at).toLocaleString()}
                    {c.is_internal && " · internal"}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 border-t border-slate-200 dark:border-slate-800 pt-5">
              <AddCommentForm
                requestId={request.id}
                code={request.code}
                canMarkInternal={canMarkInternal}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-5">
            <h3 className="text-xs uppercase tracking-wide font-semibold text-slate-500 mb-3">
              Requester
            </h3>
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              {requester?.full_name || requester?.email || "—"}
            </p>
            <p className="text-xs text-slate-500">{requester?.email}</p>
            {requester?.job_title && (
              <p className="text-xs text-slate-500 mt-1">
                {requester.job_title}
                {requester.department && ` · ${requester.department}`}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-5 text-xs text-slate-500 space-y-2">
            <div>
              <span className="text-slate-400">Submitted</span>
              <p className="text-slate-700 dark:text-slate-300">
                {request.submitted_at ? new Date(request.submitted_at).toLocaleString() : "—"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Stage progress</span>
              <p className="text-slate-700 dark:text-slate-300">
                {request.total_stages > 0
                  ? `${Math.min(request.current_stage + 1, request.total_stages)} / ${request.total_stages}`
                  : "Auto-approved"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Last update</span>
              <p className="text-slate-700 dark:text-slate-300">
                {new Date(request.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
