"use client";

import { useActionState, useState } from "react";
import {
  decideApprovalAction,
  type ActionResult,
} from "@/lib/catalog/actions";

export default function ApprovalActions({
  requestId,
  stage,
}: {
  requestId: string;
  stage: number;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    decideApprovalAction,
    undefined,
  );
  const [comment, setComment] = useState("");

  return (
    <div className="space-y-3">
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional comment on your decision…"
        rows={3}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-4 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-brand-500/10"
      />

      <div className="flex items-center gap-3">
        <form action={formAction} className="contents">
          <input type="hidden" name="request_id" value={requestId} />
          <input type="hidden" name="stage" value={stage} />
          <input type="hidden" name="decision" value="approved" />
          <input type="hidden" name="comment" value={comment} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {pending ? "…" : "Approve"}
          </button>
        </form>

        <form action={formAction} className="contents">
          <input type="hidden" name="request_id" value={requestId} />
          <input type="hidden" name="stage" value={stage} />
          <input type="hidden" name="decision" value="rejected" />
          <input type="hidden" name="comment" value={comment} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg border border-error-500 px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 disabled:opacity-50 dark:hover:bg-error-500/10"
          >
            {pending ? "…" : "Reject"}
          </button>
        </form>
      </div>

      {state?.error && (
        <p className="text-xs text-error-600 dark:text-error-400">{state.error}</p>
      )}
    </div>
  );
}
