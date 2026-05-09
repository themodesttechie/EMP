"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Star, MessageSquare, CheckCircle2, Clock } from "lucide-react";
import { recordResponseAction } from "@/lib/surveys/actions";
import type { Survey, SurveyResponse } from "@/lib/surveys/types";

type Props = {
  pending: SurveyResponse[];
  history: SurveyResponse[];
  surveys: Record<string, Survey>;
};

type Tab = "pending" | "history";

export default function SurveysFeedbacksView({ pending, history, surveys }: Props) {
  const [tab, setTab] = useState<Tab>("pending");
  const [activeId, setActiveId] = useState<string | null>(
    pending[0]?.id ?? null,
  );

  const activeResponse = useMemo(() => {
    if (!activeId) return null;
    return pending.find((p) => p.id === activeId) ?? null;
  }, [activeId, pending]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-4">
        <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab("pending")}
            className={`flex-1 rounded-lg px-3 py-2 transition ${tab === "pending" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}
          >
            Pending ({pending.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("history")}
            className={`flex-1 rounded-lg px-3 py-2 transition ${tab === "history" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}
          >
            Submitted ({history.length})
          </button>
        </div>

        {tab === "pending" ? (
          <ul className="space-y-2">
            {pending.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-slate-500">
                No surveys pending. You are all caught up.
              </li>
            ) : (
              pending.map((r) => {
                const survey = surveys[r.survey_id];
                const isActive = r.id === activeId;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(r.id)}
                      className={`w-full rounded-xl border px-3 py-3 text-left transition ${isActive ? "border-brand-500 bg-brand-50/50 dark:bg-brand-500/10" : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"}`}
                    >
                      <div className="flex items-start gap-2">
                        <Clock size={16} className="mt-0.5 text-amber-500 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {survey?.name ?? "Survey"}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Sent {new Date(r.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        ) : (
          <ul className="space-y-2">
            {history.length === 0 ? (
              <li className="px-2 py-6 text-center text-sm text-slate-500">
                No submissions yet.
              </li>
            ) : (
              history.map((r) => {
                const survey = surveys[r.survey_id];
                return (
                  <li
                    key={r.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-3"
                  >
                    <div className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className="mt-0.5 text-emerald-500 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {survey?.name ?? "Survey"}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>
                            {r.submitted_at
                              ? new Date(r.submitted_at).toLocaleDateString()
                              : ""}
                          </span>
                          {typeof r.score === "number" ? (
                            <span className="inline-flex items-center gap-0.5 text-amber-500">
                              <Star size={12} fill="currentColor" /> {r.score}/5
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6">
        {tab === "pending" && activeResponse ? (
          <SurveyForm
            response={activeResponse}
            survey={surveys[activeResponse.survey_id]}
          />
        ) : tab === "pending" ? (
          <EmptyState />
        ) : (
          <HistoryDetail history={history} surveys={surveys} />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center text-slate-500">
      <MessageSquare size={42} className="mb-4 text-slate-300" />
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Nothing to do
      </h2>
      <p className="mt-2 max-w-sm text-sm">
        When a ticket or change is resolved, a short survey will appear here.
      </p>
    </div>
  );
}

function SurveyForm({
  response,
  survey,
}: {
  response: SurveyResponse;
  survey: Survey | undefined;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!survey) {
    return <div className="text-sm text-slate-500">Survey definition missing.</div>;
  }

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center py-16 text-center">
        <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Thanks for the feedback
        </h2>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Your response was recorded and helps the team improve.
        </p>
      </div>
    );
  }

  return (
    <form
      action={(fd: FormData) => {
        setError(null);
        fd.set("response_id", response.id);
        startTransition(async () => {
          const r = await recordResponseAction(undefined, fd);
          if (r?.error) setError(r.error);
          else setDone(true);
        });
      }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          {survey.name}
        </h2>
        {survey.description ? (
          <p className="mt-1 text-sm text-slate-500">{survey.description}</p>
        ) : null}
      </header>

      <div className="space-y-5">
        {survey.questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              {q.label}
              {q.required ? <span className="ml-1 text-rose-500">*</span> : null}
            </label>
            {q.type === "rating" ? (
              <RatingInput name={`q_${q.id}`} required={q.required} />
            ) : q.type === "choice" ? (
              <select
                name={`q_${q.id}`}
                required={q.required}
                className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                defaultValue=""
              >
                <option value="" disabled>
                  Select an option
                </option>
                {(q.options ?? []).map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            ) : (
              <textarea
                name={`q_${q.id}`}
                required={q.required}
                maxLength={4000}
                rows={3}
                className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            )}
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Submitting..." : "Submit feedback"}
      </button>
    </form>
  );
}

function RatingInput({ name, required }: { name: string; required: boolean }) {
  const [value, setValue] = useState<number | null>(null);
  return (
    <div className="mt-2 flex items-center gap-2">
      <input type="hidden" name={name} value={value ?? ""} required={required} />
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => setValue(n)}
          aria-label={`Rate ${n} out of 5`}
          className={`h-10 w-10 rounded-full border transition ${value !== null && n <= value ? "border-amber-400 bg-amber-50 text-amber-500" : "border-slate-200 dark:border-slate-700 text-slate-400 hover:border-amber-300"}`}
        >
          <Star
            size={20}
            className="mx-auto"
            fill={value !== null && n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

function HistoryDetail({
  history,
  surveys,
}: {
  history: SurveyResponse[];
  surveys: Record<string, Survey>;
}) {
  if (history.length === 0) return <EmptyState />;
  return (
    <div className="space-y-4">
      {history.map((r) => {
        const survey = surveys[r.survey_id];
        return (
          <div
            key={r.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {survey?.name ?? "Survey"}
                </div>
                <div className="text-xs text-slate-500">
                  {r.submitted_at
                    ? new Date(r.submitted_at).toLocaleString()
                    : "Pending"}
                </div>
              </div>
              {typeof r.score === "number" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                  <Star size={12} fill="currentColor" /> {r.score}/5
                </span>
              ) : null}
            </div>
            {r.comments ? (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {r.comments}
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
