"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import {
  promoteToKnownErrorFormAction,
  proposeRootCauseFormAction,
  unlinkIncidentFormAction,
  updateStateFormAction,
} from "@/lib/problems/actions";
import { PROBLEM_STATES, type KnownError, type Problem } from "@/lib/problems/types";

type Profile = { id: string; full_name: string | null; email: string; role: string };

const STATE_STYLES: Record<string, string> = {
  new: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  investigating: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  known_error: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
  resolved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  closed: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500",
};

function PendingButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="rounded-md bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50">
      {pending ? "Working…" : children}
    </button>
  );
}

export default function ProblemDetail({
  problem,
  incidents,
  knownError,
  profiles,
}: {
  problem: Problem;
  incidents: Array<{ id: string; number: string; title: string; state: string; priority: string; created_at: string; description: string | null }>;
  knownError: KnownError | null;
  profiles: Profile[];
}) {
  void profiles;
  const ai = problem.ai_proposed_root_cause;
  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b] overflow-y-auto">
      <header className="sticky top-0 z-30 bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-slate-500">{problem.number}</p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">{problem.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATE_STYLES[problem.state] ?? ""}`}>
              {problem.state.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-500">Priority {problem.priority}</span>
            <span className="text-xs text-slate-500">{problem.related_incidents_count} linked incidents</span>
          </div>
        </div>
        <Link href="/problems" className="text-xs text-brand-600 hover:underline">← Back to list</Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6 pb-24 space-y-6">
        {problem.description ? (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
            {problem.description}
          </div>
        ) : null}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <form action={updateStateFormAction} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4 space-y-3">
            <input type="hidden" name="id" value={problem.id} />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Update state and findings</h3>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">State</label>
              <select name="state" defaultValue={problem.state} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm">
                {PROBLEM_STATES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Root cause</label>
              <textarea name="root_cause" defaultValue={problem.root_cause ?? ""} rows={3} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Workaround</label>
              <textarea name="workaround" defaultValue={problem.workaround ?? ""} rows={3} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm" />
            </div>
            <div className="flex justify-end"><PendingButton>Save</PendingButton></div>
          </form>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI root cause proposal</h3>
            {ai ? (
              <div className="text-sm space-y-2">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{ai.root_cause || "(no proposal text)"}</p>
                <p className="text-xs text-slate-500">Confidence {(ai.confidence * 100).toFixed(0)}%</p>
                {ai.reasoning ? <p className="text-xs text-slate-500 italic">{ai.reasoning}</p> : null}
                {ai.supporting_incidents?.length ? (
                  <p className="text-xs text-slate-500">Supporting: {ai.supporting_incidents.join(", ")}</p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-slate-500">No proposal yet. Run the analyser over the linked incidents.</p>
            )}
            <form action={proposeRootCauseFormAction}>
              <input type="hidden" name="problem_id" value={problem.id} />
              <PendingButton>Propose root cause</PendingButton>
            </form>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Linked incidents</h3>
          {incidents.length === 0 ? (
            <p className="text-sm text-slate-500">No linked incidents.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left px-3 py-2 font-medium">Number</th>
                  <th className="text-left px-3 py-2 font-medium">Title</th>
                  <th className="text-left px-3 py-2 font-medium">State</th>
                  <th className="text-left px-3 py-2 font-medium">Priority</th>
                  <th className="text-left px-3 py-2 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {incidents.map((i) => (
                  <tr key={i.id}>
                    <td className="px-3 py-2 font-mono text-xs text-brand-600">
                      <Link href={`/helpdesk/${i.number}`} className="hover:underline">{i.number}</Link>
                    </td>
                    <td className="px-3 py-2">{i.title}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{i.state.replace("_", " ")}</td>
                    <td className="px-3 py-2 text-xs text-slate-500">{i.priority}</td>
                    <td className="px-3 py-2 text-right">
                      <form action={unlinkIncidentFormAction}>
                        <input type="hidden" name="problem_id" value={problem.id} />
                        <input type="hidden" name="ticket_id" value={i.id} />
                        <button type="submit" className="text-xs text-red-600 hover:underline">Unlink</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Known error</h3>
          {knownError ? (
            <div className="text-sm space-y-1">
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{knownError.workaround_summary || "(no summary)"}</p>
              <p className="text-xs text-slate-500">Promoted {new Date(knownError.created_at).toLocaleDateString()}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mb-3">Not promoted yet. Promoting publishes the workaround for agents.</p>
          )}
          <form action={promoteToKnownErrorFormAction} className="space-y-2 mt-2">
            <input type="hidden" name="problem_id" value={problem.id} />
            <textarea
              name="workaround_summary"
              defaultValue={knownError?.workaround_summary ?? problem.workaround ?? ""}
              rows={3}
              placeholder="One-paragraph workaround for agents"
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
            />
            <div className="flex justify-end"><PendingButton>{knownError ? "Update" : "Promote to known error"}</PendingButton></div>
          </form>
        </section>
      </main>
    </div>
  );
}
