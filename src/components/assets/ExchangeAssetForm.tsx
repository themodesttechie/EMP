"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { exchangeAssetAction, type ActionResult } from "@/lib/assets/actions";
import type { Ci } from "@/lib/assets/types";

type Profile = { id: string; full_name: string | null; email: string; role: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
      {pending ? "Exchanging…" : "Exchange"}
    </button>
  );
}

export default function ExchangeAssetForm({ assets, profiles }: { assets: Ci[]; profiles: Profile[] }) {
  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(exchangeAssetAction, undefined);
  const assignedAssets = assets.filter((a) => a.status === "assigned");
  const stockAssets = assets.filter((a) => a.status === "in_stock");

  return (
    <form action={formAction} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Old asset (currently assigned) *</label>
        <select name="old_ci_id" required defaultValue="" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
          <option value="">— Pick —</option>
          {assignedAssets.map((a) => (
            <option key={a.id} value={a.id}>{a.number} — {a.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New asset (in stock) *</label>
        <select name="new_ci_id" required defaultValue="" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
          <option value="">— Pick —</option>
          {stockAssets.map((a) => (
            <option key={a.id} value={a.id}>{a.number} — {a.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">User *</label>
        <select name="user_id" required defaultValue="" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
          <option value="">— Pick —</option>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.full_name || p.email}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Return condition</label>
        <select name="return_condition" defaultValue="good" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
          <option value="new">New</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="damaged">Damaged</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
        <textarea name="notes" rows={3} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
      </div>

      {state?.error ? <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-emerald-600 dark:text-emerald-400">Exchange recorded.</p> : null}

      <div className="flex justify-end pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}
