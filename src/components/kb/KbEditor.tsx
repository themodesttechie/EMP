"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Save, Send } from "lucide-react";
import {
  createDraftAction,
  submitForReviewAction,
  updateBodyAction,
} from "@/lib/kb/actions";
import type { KbActionResult, KbArticle, KbCategory } from "@/lib/kb/types";

// Tiptap is client-only and heavy; load lazily.
const TiptapEditor = dynamic(() => import("@/components/ui/editor/TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="border border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6 text-sm text-gray-500">
      Loading editor…
    </div>
  ),
});

type Props = {
  categories: KbCategory[];
  existing: KbArticle | null;
};

const INIT: KbActionResult = {};

export default function KbEditor({ categories, existing }: Props) {
  const router = useRouter();
  const isEdit = !!existing;
  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [bodyHtml, setBodyHtml] = useState(
    existing?.body
      ? `<p>${(existing.body || "").replace(/\n/g, "</p><p>")}</p>`
      : "<p></p>",
  );
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? "");
  const [tags, setTags] = useState(existing?.tags?.join(", ") ?? "");
  const [changeSummary, setChangeSummary] = useState("");

  const action = isEdit ? updateBodyAction : createDraftAction;
  const [state, formAction, pending] = useActionState(action, INIT);
  const [submitState, submitAction, submitPending] = useActionState(
    submitForReviewAction,
    INIT,
  );

  useEffect(() => {
    if (state?.ok && !isEdit) {
      const created = (state.data as { id: string; slug: string } | undefined);
      if (created?.slug) router.push(`/kb/${created.slug}`);
    }
  }, [state, isEdit, router]);

  useEffect(() => {
    if (submitState?.ok) router.push("/kb/drafts");
  }, [submitState, router]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {isEdit ? "Edit article" : "New article"}
      </h1>

      <form action={formAction} className="space-y-4">
        {isEdit && <input type="hidden" name="id" value={existing!.id} />}
        <input type="hidden" name="body" value={body} />

        <Field label="Title">
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short, action oriented title"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Category">
            <select
              name="category_id"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Uncategorised</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tags (comma separated)">
            <input
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="vpn, network, access"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </Field>
        </div>

        <Field label="Body">
          <TiptapEditor
            content={bodyHtml}
            onChange={(html) => {
              setBodyHtml(html);
              // Strip HTML for the markdown-flavoured plaintext we store as body.
              setBody(htmlToText(html));
            }}
          />
        </Field>

        {isEdit && (
          <Field label="Change summary (optional)">
            <input
              name="change_summary"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="What changed?"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </Field>
        )}

        {state?.error && (
          <p className="text-sm text-rose-600">{state.error}</p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium disabled:opacity-60"
          >
            <Save size={16} /> {isEdit ? "Save changes" : "Save draft"}
          </button>
        </div>
      </form>

      {isEdit && existing && existing.state === "draft" && (
        <form action={submitAction} className="pt-2">
          <input type="hidden" name="id" value={existing.id} />
          {submitState?.error && (
            <p className="text-sm text-rose-600 mb-2">{submitState.error}</p>
          )}
          <button
            type="submit"
            disabled={submitPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium disabled:opacity-60"
          >
            <Send size={16} /> Submit for review
          </button>
        </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function htmlToText(html: string): string {
  return html
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<br\s*\/?>(\n)?/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<h([1-3])[^>]*>/gi, (_, n) => "\n" + "#".repeat(Number(n)) + " ")
    .replace(/<\/h[1-3]>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
