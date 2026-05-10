"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createCiAction, type ActionResult } from "@/lib/assets/actions";
import type { CiClass } from "@/lib/assets/types";
import { CI_STATUSES } from "@/lib/assets/types";

type Props = { open: boolean; onClose: () => void; classes: CiClass[] };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Create CI"}
    </button>
  );
}

export default function NewCiModal({ open, onClose, classes }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult<{ id: string; number: string }> | undefined, FormData>(
    createCiAction,
    undefined,
  );

  useEffect(() => {
    if (state?.ok && state.data?.id) {
      router.push(`/asset-documentation/${state.data.id}`);
      onClose();
    }
  }, [state, router, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 shadow-xl my-10">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New CI</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white" aria-label="Close">×</button>
        </div>
        <form action={formAction} className="px-6 py-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
            <input name="name" required maxLength={200} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class</label>
              <select name="class_id" defaultValue="" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
                <option value="">—</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
              <select name="status" defaultValue="in_stock" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
                {CI_STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asset tag</label>
              <input name="asset_tag" maxLength={100} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Serial</label>
              <input name="serial" maxLength={200} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
              <input name="location" maxLength={200} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost centre</label>
              <input name="cost_centre" maxLength={100} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purchased</label>
              <input name="purchased_at" type="date" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Warranty until</label>
              <input name="warranty_until" type="date" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <textarea name="notes" rows={3} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
          </div>
          {state?.error ? <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
