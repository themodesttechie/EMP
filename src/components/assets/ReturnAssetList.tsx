"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { returnFromUserFormAction } from "@/lib/assets/actions";
import type { AssetAssignment, AssetCondition, Ci } from "@/lib/assets/types";
import { ConditionBadge, StatusBadge } from "./AssetBadges";

type Row = AssetAssignment & { ci: Ci | null };

function ReturnButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
    >
      {pending ? "Returning…" : "Return"}
    </button>
  );
}

export default function ReturnAssetList({ assigns }: { assigns: Row[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [condition, setCondition] = useState<AssetCondition>("good");
  const [notes, setNotes] = useState("");

  if (assigns.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#121212] p-10 text-center">
        <p className="text-sm text-slate-500">You have no assets to return.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assigns.map((a) => (
        <div
          key={a.id}
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {a.ci?.name || "Unknown asset"}
              </p>
              <p className="font-mono text-xs text-slate-500 mt-0.5">
                {a.ci?.number || "—"} · tag {a.ci?.asset_tag || "—"}
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                {a.ci ? <StatusBadge status={a.ci.status} /> : null}
                <ConditionBadge condition={a.condition} />
                <span>Issued {new Date(a.assigned_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={() => setOpenId(openId === a.id ? null : a.id)}
              className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {openId === a.id ? "Cancel" : "Start return"}
            </button>
          </div>
          {openId === a.id && a.ci ? (
            <form action={returnFromUserFormAction} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="hidden" name="ci_id" value={a.ci.id} />
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Condition</label>
                <select
                  name="return_condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as AssetCondition)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
                >
                  <option value="new">New</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
                <input
                  name="return_notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything IT should know"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <ReturnButton />
              </div>
            </form>
          ) : null}
        </div>
      ))}
    </div>
  );
}
