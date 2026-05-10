"use client";

import React, { useActionState } from "react";
import { Send, Check, ShieldOff } from "lucide-react";
import { submitFeedbackAction, type ActionResult } from "@/lib/workplace/actions";

const CATS = [
  { value: "suggestion", label: "Suggestion" },
  { value: "complaint", label: "Complaint" },
  { value: "praise", label: "Praise" },
  { value: "bug", label: "Bug" },
];

export default function FeedbackForm() {
  const [state, formAction, pending] = useActionState<ActionResult | undefined, FormData>(
    submitFeedbackAction,
    undefined,
  );
  // Inner form is re-keyed on success so uncontrolled fields reset cleanly.
  return <FeedbackFormInner key={state?.ok ? "ok" : "draft"} state={state} formAction={formAction} pending={pending} />;
}

function FeedbackFormInner({
  state,
  formAction,
  pending,
}: {
  state: ActionResult | undefined;
  formAction: (fd: FormData) => void;
  pending: boolean;
}) {
  const [body, setBody] = React.useState("");
  const [cat, setCat] = React.useState("suggestion");

  return (
    <form
      action={formAction}
      className="bg-white dark:bg-[#121212] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-6"
    >
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 text-amber-800 dark:text-amber-400">
        <ShieldOff size={18} />
        <p className="text-xs font-bold uppercase tracking-widest">
          Submissions are not linked to your profile
        </p>
      </div>

      {state?.error && (
        <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200">
          {state.error}
        </div>
      )}
      {state?.ok && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm border border-emerald-200 flex items-center gap-2">
          <Check size={16} /> Submitted. Thank you.
        </div>
      )}

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCat(c.value)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition ${
                cat === c.value
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="category" value={cat} />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          Your message ({body.length}/4000)
        </label>
        <textarea
          name="body"
          required
          rows={8}
          maxLength={4000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share what's on your mind..."
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
      </div>

      <button
        type="submit"
        disabled={pending || !body.trim()}
        className="w-full px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest disabled:opacity-60 flex items-center justify-center gap-2"
      >
        <Send size={16} /> {pending ? "Submitting..." : "Submit anonymously"}
      </button>
    </form>
  );
}
