"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createTicketAction, type ActionResult } from "@/lib/tickets/actions";
import type { TicketCategory, TicketPriority } from "@/lib/tickets/types";

type Props = {
  open: boolean;
  onClose: () => void;
  categories: TicketCategory[];
};

type DeflectionMatch = {
  id: string;
  title: string;
  snippet: string;
  source: string;
  slug?: string;
  similarity?: number;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
    >
      {pending ? "Creating…" : "Create ticket"}
    </button>
  );
}

export default function NewTicketModal({ open, onClose, categories }: Props) {
  const [state, formAction] = useActionState<ActionResult<{ number: string }> | undefined, FormData>(
    createTicketAction,
    undefined,
  );
  const [description, setDescription] = useState("");
  const [matches, setMatches] = useState<DeflectionMatch[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const tooShort = description.trim().length < 30;
    debounceRef.current = setTimeout(async () => {
      if (tooShort) {
        setMatches([]);
        return;
      }
      try {
        const r = await fetch("/api/tickets/deflect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: description }),
        });
        const j = await r.json();
        setMatches((j.kb_articles ?? []).slice(0, 3));
      } catch {
        // ignore
      }
    }, tooShort ? 200 : 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [description]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-6 overflow-y-auto">
      <div className="w-full max-w-xl rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-slate-800 shadow-xl my-10">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">New ticket</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white" aria-label="Close">
            ×
          </button>
        </div>
        <form action={formAction} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              required
              maxLength={200}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="Short summary of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              placeholder="What happened, what did you expect, any error messages…"
            />
          </div>

          {matches.length > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-500/5 dark:border-blue-500/20 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                Before you submit, these may help
              </p>
              {matches.map((m) => {
                const href = m.slug ? `/kb/${m.slug}` : null;
                const onClick = () => {
                  if (!m.id) return;
                  fetch("/api/kb/view", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ article_id: m.id, source: "ticket_form" }),
                  }).catch(() => undefined);
                };
                const inner = (
                  <>
                    <p className="font-medium text-slate-800 dark:text-slate-100">{m.title}</p>
                    {m.snippet ? (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{m.snippet}</p>
                    ) : null}
                  </>
                );
                return href ? (
                  <a
                    key={m.id}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={onClick}
                    className="block rounded-md bg-white dark:bg-[#0f0f10] border border-blue-100 dark:border-blue-500/10 p-2 text-sm hover:border-blue-300"
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    key={m.id}
                    className="rounded-md bg-white dark:bg-[#0f0f10] border border-blue-100 dark:border-blue-500/10 p-2 text-sm"
                  >
                    {inner}
                  </div>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                name="category_id"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="">Auto (AI suggested)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                name="priority"
                defaultValue={"P3" as TicketPriority}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f0f10] px-3 py-2 text-sm"
              >
                <option value="P1">P1 — Critical</option>
                <option value="P2">P2 — High</option>
                <option value="P3">P3 — Standard</option>
                <option value="P4">P4 — Low</option>
              </select>
            </div>
          </div>

          {state?.error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
