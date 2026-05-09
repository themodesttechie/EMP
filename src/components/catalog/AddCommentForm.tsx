"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  addRequestCommentAction,
  type ActionResult,
} from "@/lib/catalog/actions";

export default function AddCommentForm({
  requestId,
  code,
  canMarkInternal,
}: {
  requestId: string;
  code: string;
  canMarkInternal: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    addRequestCommentAction,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="request_id" value={requestId} />
      <input type="hidden" name="code" value={code} />
      <textarea
        name="body"
        required
        rows={3}
        placeholder="Add a comment…"
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-4 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-brand-500/10"
      />
      <div className="flex items-center justify-between">
        {canMarkInternal ? (
          <label className="inline-flex items-center gap-2 text-xs text-slate-500">
            <input type="checkbox" name="is_internal" className="h-3.5 w-3.5" />
            Internal note (hidden from requester)
          </label>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
        >
          {pending ? "Posting…" : "Post comment"}
        </button>
      </div>
      {state?.error && (
        <p className="text-xs text-error-600 dark:text-error-400">{state.error}</p>
      )}
    </form>
  );
}
