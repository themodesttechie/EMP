"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createAssetIssueAction, type ActionResult } from "@/lib/assets/actions";
import type { Ci } from "@/lib/assets/types";
import type { TicketCategory } from "@/lib/tickets/types";

type Props = {
  assets: Ci[];
  categories: TicketCategory[];
  preselectedCiId: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
    >
      {pending ? "Submitting…" : "Open ticket"}
    </button>
  );
}

export default function AssetIssueForm({ assets, categories, preselectedCiId }: Props) {
  const [state, formAction] = useActionState<ActionResult<{ number: string }> | undefined, FormData>(
    createAssetIssueAction,
    undefined,
  );
  const [ci, setCi] = useState(preselectedCiId ?? assets[0]?.id ?? "");

  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] p-10 text-center">
        <p className="text-sm text-slate-500">You have no assigned assets to report on.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Asset *</label>
        <select
          name="ci_id"
          value={ci}
          onChange={(e) => setCi(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
        >
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.number} — {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
        <input
          name="title"
          required
          maxLength={200}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          placeholder="Short summary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea
          name="description"
          rows={5}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          placeholder="What happened, what did you expect, error messages…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select
            name="category_id"
            defaultValue=""
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="">Auto</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
          <select
            name="priority"
            defaultValue="P3"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
          >
            <option value="P1">P1 — Critical</option>
            <option value="P2">P2 — High</option>
            <option value="P3">P3 — Standard</option>
            <option value="P4">P4 — Low</option>
          </select>
        </div>
      </div>

      {state?.error ? <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p> : null}

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
