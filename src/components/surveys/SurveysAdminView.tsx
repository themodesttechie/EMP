"use client";

import React, { useMemo, useState, useTransition } from "react";
import { Plus, Star, Filter } from "lucide-react";
import {
  createSurveyAction,
  updateSurveyAction,
} from "@/lib/surveys/actions";
import type { Survey, SurveyResponse } from "@/lib/surveys/types";

type Tab = "surveys" | "responses";

const TRIGGER_LABELS: Record<string, string> = {
  post_incident_resolved: "Post incident resolved",
  post_change_done: "Post change done",
  scheduled: "Scheduled",
  manual: "Manual",
};

export default function SurveysAdminView({
  surveys,
  responses,
}: {
  surveys: Survey[];
  responses: SurveyResponse[];
}) {
  const [tab, setTab] = useState<Tab>("surveys");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const surveyMap = useMemo(() => {
    const m: Record<string, Survey> = {};
    for (const s of surveys) m[s.id] = s;
    return m;
  }, [surveys]);

  const editing = editingId ? surveyMap[editingId] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Surveys
          </h1>
          <p className="text-sm text-slate-500">
            Create CSAT surveys, view responses, watch sentiment.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditingId(null);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus size={16} /> New survey
        </button>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 text-xs font-semibold w-fit">
        <button
          type="button"
          onClick={() => setTab("surveys")}
          className={`rounded-lg px-4 py-2 transition ${tab === "surveys" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}
        >
          Surveys ({surveys.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("responses")}
          className={`rounded-lg px-4 py-2 transition ${tab === "responses" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-500"}`}
        >
          Responses ({responses.length})
        </button>
      </div>

      {creating ? (
        <SurveyEditor
          mode="create"
          onClose={() => setCreating(false)}
        />
      ) : editing ? (
        <SurveyEditor
          mode="edit"
          survey={editing}
          onClose={() => setEditingId(null)}
        />
      ) : tab === "surveys" ? (
        <SurveyList
          surveys={surveys}
          onEdit={(id) => setEditingId(id)}
        />
      ) : (
        <ResponsesList responses={responses} surveys={surveyMap} />
      )}
    </div>
  );
}

function SurveyList({
  surveys,
  onEdit,
}: {
  surveys: Survey[];
  onEdit: (id: string) => void;
}) {
  if (surveys.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500">
        No surveys yet. Click &quot;New survey&quot; to get started.
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {surveys.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onEdit(s.id)}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-5 text-left hover:border-brand-300 transition"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {s.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                {s.description || s.slug}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${s.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
            >
              {s.active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
            <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5">
              {TRIGGER_LABELS[s.trigger] ?? s.trigger}
            </span>
            <span>{s.questions.length} questions</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function SurveyEditor({
  mode,
  survey,
  onClose,
}: {
  mode: "create" | "edit";
  survey?: Survey;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [questionsJson, setQuestionsJson] = useState(
    survey
      ? JSON.stringify(survey.questions, null, 2)
      : JSON.stringify(
          [
            {
              id: "overall",
              type: "rating",
              label: "How satisfied were you?",
              required: true,
            },
            {
              id: "worked_well",
              type: "text",
              label: "What worked well?",
              required: false,
            },
            {
              id: "better",
              type: "text",
              label: "What could be better?",
              required: false,
            },
          ],
          null,
          2,
        ),
  );

  return (
    <form
      action={(fd: FormData) => {
        setError(null);
        fd.set("questions_json", questionsJson);
        startTransition(async () => {
          const r =
            mode === "create"
              ? await createSurveyAction(undefined, fd)
              : await updateSurveyAction(undefined, fd);
          if (r?.error) setError(r.error);
          else onClose();
        });
      }}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212] p-6 space-y-5"
    >
      {survey ? (
        <input type="hidden" name="id" value={survey.id} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            Name
          </label>
          <input
            name="name"
            required
            defaultValue={survey?.name ?? ""}
            className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            Slug
          </label>
          <input
            name="slug"
            defaultValue={survey?.slug ?? ""}
            placeholder="auto from name"
            className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900 dark:text-white">
          Description
        </label>
        <input
          name="description"
          defaultValue={survey?.description ?? ""}
          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-semibold text-slate-900 dark:text-white">
            Trigger
          </label>
          <select
            name="trigger"
            defaultValue={survey?.trigger ?? "manual"}
            className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm"
          >
            {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <input
              type="checkbox"
              name="active"
              defaultChecked={survey?.active ?? true}
              className="h-4 w-4"
            />
            Active
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-slate-900 dark:text-white">
          Questions (JSON)
        </label>
        <textarea
          rows={14}
          value={questionsJson}
          onChange={(e) => setQuestionsJson(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs font-mono"
        />
        <p className="mt-1 text-xs text-slate-500">
          Array of {`{ id, type: "rating"|"text"|"choice", label, required, options? }`}.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {pending ? "Saving..." : mode === "create" ? "Create survey" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 dark:border-slate-700 px-5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ResponsesList({
  responses,
  surveys,
}: {
  responses: SurveyResponse[];
  surveys: Record<string, Survey>;
}) {
  const [sentiment, setSentiment] = useState<string>("");
  const [days, setDays] = useState<string>("30");
  // Snapshot "now" once so filter is a pure transform of inputs.
  const [nowMs] = useState<number>(() => Date.now());

  const filtered = useMemo(() => {
    const sinceMs = days === "all" ? null : Number(days) * 86400000;
    return responses.filter((r) => {
      if (sentiment && r.ai_sentiment !== sentiment) return false;
      if (sinceMs !== null && r.submitted_at) {
        const submittedTs = Date.parse(r.submitted_at);
        if (isNaN(submittedTs)) return false;
        if (nowMs - submittedTs > sinceMs) return false;
      }
      return true;
    });
  }, [responses, sentiment, days, nowMs]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-slate-400" />
        <select
          value={sentiment}
          onChange={(e) => setSentiment(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm"
        >
          <option value="">All sentiment</option>
          <option value="positive">Positive</option>
          <option value="neutral">Neutral</option>
          <option value="negative">Negative</option>
        </select>
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="all">All time</option>
        </select>
        <span className="ml-auto text-xs text-slate-500">
          {filtered.length} of {responses.length}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121212]">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr className="text-left">
              <th className="px-4 py-3 font-semibold">Survey</th>
              <th className="px-4 py-3 font-semibold">Submitted</th>
              <th className="px-4 py-3 font-semibold">Score</th>
              <th className="px-4 py-3 font-semibold">Sentiment</th>
              <th className="px-4 py-3 font-semibold">Themes</th>
              <th className="px-4 py-3 font-semibold">Comments</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  No responses match the filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40"
                >
                  <td className="px-4 py-3">
                    {surveys[r.survey_id]?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {r.submitted_at
                      ? new Date(r.submitted_at).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeof r.score === "number" ? (
                      <span className="inline-flex items-center gap-1 text-amber-500">
                        <Star size={12} fill="currentColor" /> {r.score}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {r.ai_sentiment ? (
                      <SentimentChip s={r.ai_sentiment} />
                    ) : (
                      <span className="text-xs text-slate-400">pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(r.ai_themes ?? []).map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="line-clamp-2 text-slate-600 dark:text-slate-400">
                      {r.comments || "—"}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SentimentChip({ s }: { s: string }) {
  const styles: Record<string, string> = {
    positive: "bg-emerald-50 text-emerald-700",
    neutral: "bg-slate-100 text-slate-700",
    negative: "bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[s] ?? styles.neutral}`}
    >
      {s}
    </span>
  );
}
