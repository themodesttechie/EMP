"use client";

import { useActionState } from "react";
import { createRequestAction, type ActionResult } from "@/lib/catalog/actions";
import type { CatalogItemWithCategory } from "@/lib/catalog/types";

export default function DynamicRequestForm({ item }: { item: CatalogItemWithCategory }) {
  const [state, formAction, pending] = useActionState<ActionResult<{ code: string }> | undefined, FormData>(
    createRequestAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="item_slug" value={item.slug} />

      {item.form_schema.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {field.label}
            {field.required && <span className="text-error-500 ml-0.5">*</span>}
          </label>

          {field.type === "textarea" && (
            <textarea
              name={field.key}
              required={field.required}
              placeholder={field.placeholder}
              rows={4}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-4 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300"
            />
          )}

          {field.type === "select" && field.options && (
            <select
              name={field.key}
              required={field.required}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-4 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300"
              defaultValue=""
            >
              <option value="" disabled>
                Select an option…
              </option>
              {field.options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}

          {field.type === "checkbox" && (
            <input
              type="checkbox"
              name={field.key}
              className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
            />
          )}

          {(field.type === "text" || field.type === "number" || field.type === "date") && (
            <input
              type={field.type}
              name={field.key}
              required={field.required}
              placeholder={field.placeholder}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-4 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-brand-500/10 focus:border-brand-300"
            />
          )}
        </div>
      ))}

      {state?.error && (
        <div className="rounded-lg border border-error-500 bg-error-50 px-4 py-2.5 text-sm text-error-700 dark:bg-error-500/10 dark:text-error-400">
          {state.error}
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500">
          {item.approval_chain.length === 0
            ? "Auto-approved on submit."
            : `Will route through ${item.approval_chain.length} approval ${item.approval_chain.length === 1 ? "stage" : "stages"}.`}
          {item.sla_hours != null && ` Fulfilment SLA: ${item.sla_hours}h.`}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? "Submitting…" : "Submit request"}
        </button>
      </div>
    </form>
  );
}
