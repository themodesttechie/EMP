"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  recordApprovalDecisionAction,
  type ActionResult,
} from "@/lib/changes/actions";
import { useRealtime } from "@/hooks/useRealtime";
import {
  ApprovalStateBadge,
  ChangeStateBadge,
  ChangeTypeBadge,
} from "./ChangeBadges";
import RiskScore from "./RiskScore";
import type { Change, ChangeApproval } from "@/lib/changes/types";

type Profile = { id: string; full_name: string | null; email: string; role: string };

type Props = {
  changes: Change[];
  myApprovals: ChangeApproval[];
  allApprovals: ChangeApproval[];
  profiles: Profile[];
  myProfileId: string;
  myTenantId: string;
};

export default function CabQueue(props: Props) {
  const router = useRouter();
  useRealtime({
    table: "change_approvals",
    filter: `tenant_id=eq.${props.myTenantId}`,
    onChange: () => router.refresh(),
  });
  useRealtime({
    table: "changes",
    filter: `tenant_id=eq.${props.myTenantId}`,
    onChange: () => router.refresh(),
  });

  const profileById = (id: string | null) => {
    if (!id) return null;
    return props.profiles.find((p) => p.id === id) ?? null;
  };

  const myPending = props.myApprovals.filter((a) => a.state === "pending");
  const myDone = props.myApprovals.filter((a) => a.state !== "pending");

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b]">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
          Change advisory board
        </h1>
        <p className="text-xs font-medium text-slate-500 mt-1">
          {myPending.length} awaiting your decision · {props.changes.length} in CAB review
        </p>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6 pb-24">
        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Awaiting your decision
          </h2>
          {myPending.length === 0 ? (
            <p className="text-sm text-slate-500 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4">
              You have no pending CAB decisions.
            </p>
          ) : (
            <ul className="space-y-3">
              {myPending.map((a) => {
                const ch = props.changes.find((c) => c.id === a.change_id);
                if (!ch) return null;
                return (
                  <li
                    key={a.id}
                    className="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/40 dark:bg-blue-500/5 p-4"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <Link
                          href={`/changes/${ch.number}`}
                          className="font-mono text-sm text-brand-600 hover:underline"
                        >
                          {ch.number}
                        </Link>
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {ch.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <ChangeTypeBadge type={ch.type} />
                          <ChangeStateBadge state={ch.state} />
                          <RiskScore score={ch.risk_score} compact />
                        </div>
                      </div>
                      <DecisionForm approvalId={a.id} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            All changes in CAB review
          </h2>
          {props.changes.length === 0 ? (
            <p className="text-sm text-slate-500 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4">
              The CAB queue is empty.
            </p>
          ) : (
            <ul className="space-y-3">
              {props.changes.map((c) => {
                const approvers = props.allApprovals.filter((a) => a.change_id === c.id);
                const requester = profileById(c.requester_id);
                return (
                  <li
                    key={c.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4"
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <Link
                          href={`/changes/${c.number}`}
                          className="font-mono text-sm text-brand-600 hover:underline"
                        >
                          {c.number}
                        </Link>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {c.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          By {requester?.full_name || requester?.email || "-"}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <ChangeTypeBadge type={c.type} />
                          <RiskScore score={c.risk_score} compact />
                          {approvers.map((a) => {
                            const by = profileById(a.approver_id);
                            return (
                              <span
                                key={a.id}
                                className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300"
                              >
                                {by?.full_name?.split(" ")[0] || by?.email?.split("@")[0] || "?"}
                                <ApprovalStateBadge state={a.state} />
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {myDone.length > 0 ? (
          <section>
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Your recent decisions
            </h2>
            <ul className="space-y-2">
              {myDone.slice(0, 10).map((a) => {
                const ch = props.changes.find((c) => c.id === a.change_id);
                return (
                  <li
                    key={a.id}
                    className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-3 flex items-center justify-between gap-3"
                  >
                    <div>
                      {ch ? (
                        <Link href={`/changes/${ch.number}`} className="font-mono text-sm text-brand-600 hover:underline">
                          {ch.number}
                        </Link>
                      ) : (
                        <span className="font-mono text-sm text-slate-500">(removed)</span>
                      )}
                      {a.comment ? (
                        <p className="text-xs text-slate-500 mt-0.5">{a.comment}</p>
                      ) : null}
                    </div>
                    <ApprovalStateBadge state={a.state} />
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}

function DecisionForm({ approvalId }: { approvalId: string }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    recordApprovalDecisionAction,
    undefined,
  );
  return (
    <form action={formAction} className="flex flex-col gap-2 min-w-[260px]">
      <input type="hidden" name="approval_id" value={approvalId} />
      <textarea
        name="comment"
        rows={2}
        placeholder="Comment (optional)"
        maxLength={2000}
        className="rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-2 py-1 text-xs"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          name="decision"
          value="approved"
          className="flex-1 rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-600"
        >
          Approve
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          className="flex-1 rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-600"
        >
          Reject
        </button>
        <button
          type="submit"
          name="decision"
          value="abstained"
          className="flex-1 rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200"
        >
          Abstain
        </button>
      </div>
      {state?.error ? <p className="text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
