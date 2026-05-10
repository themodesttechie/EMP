"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { createProblemAction, type ActionResult } from "@/lib/problems/actions";
import { PROBLEM_STATES, type Problem } from "@/lib/problems/types";

type Profile = { id: string; full_name: string | null; email: string; role: string };

const PRIORITIES = ["P1", "P2", "P3", "P4"];

const STATE_STYLES: Record<string, string> = {
  new: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  investigating: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  known_error: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  resolved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  closed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
};

export default function ProblemsList({
  problems,
  profiles,
  filters,
}: {
  problems: Problem[];
  profiles: Profile[];
  filters: { state: string; priority: string };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(filters.state);
  const [priority, setPriority] = useState(filters.priority);

  function applyFilters() {
    const sp = new URLSearchParams();
    if (state) sp.set("state", state);
    if (priority) sp.set("priority", priority);
    router.push(`/problems?${sp.toString()}`);
  }

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Problem management</h1>
          <p className="text-xs font-medium text-slate-500 mt-1">{problems.length} problems</p>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-600">
          New problem
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 pb-24">
        <div className="bg-white dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
            <option value="">All states</option>
            {PROBLEM_STATES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button onClick={applyFilters} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-100">Apply</button>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-900/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Number</th>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">State</th>
                <th className="text-left px-4 py-3 font-medium">Priority</th>
                <th className="text-left px-4 py-3 font-medium">Incidents</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {problems.length === 0 ? (
                <tr><td colSpan={6} className="text-center px-4 py-10 text-sm text-slate-500">No problems.</td></tr>
              ) : problems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 cursor-pointer" onClick={() => router.push(`/problems/${p.number}`)}>
                  <td className="px-4 py-3 font-mono text-xs text-brand-600">
                    <Link href={`/problems/${p.number}`} className="hover:underline">{p.number}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-900 dark:text-white">{p.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATE_STYLES[p.state] ?? ""}`}>
                      {p.state.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.priority}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{p.related_incidents_count}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <NewProblemModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}

function NewProblemModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [state, formAction] = useActionState<ActionResult<{ id: string; number: string }> | undefined, FormData>(
    createProblemAction,
    undefined,
  );

  if (!open) return null;
  if (state?.ok && state.data?.number) {
    router.push(`/problems/${state.data.number}`);
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 shadow-xl my-10">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New problem</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white" aria-label="Close">×</button>
        </div>
        <form action={formAction} className="px-6 py-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input name="title" required maxLength={200} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea name="description" rows={5} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
            <select name="priority" defaultValue="P3" className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
              <option value="P1">P1 — Critical</option>
              <option value="P2">P2 — High</option>
              <option value="P3">P3 — Standard</option>
              <option value="P4">P4 — Low</option>
            </select>
          </div>
          {state?.error ? <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p> : null}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
            <SubmitProblemButton />
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitProblemButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">
      {pending ? "Creating…" : "Create"}
    </button>
  );
}
