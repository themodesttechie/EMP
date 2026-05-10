"use client";

import Link from "next/link";
import { useTransition } from "react";
import { CheckCircle2, Edit3, FileText, Send, Trash2 } from "lucide-react";
import {
  approveDraftAction,
  publishDraftAction,
  retireArticleAction,
} from "@/lib/kb/actions";
import type { KbArticleSummary } from "@/lib/kb/types";

type Props = {
  drafts: KbArticleSummary[];
  canPublish: boolean;
};

export default function KbDraftsList({ drafts, canPublish }: Props) {
  const [pending, startTransition] = useTransition();

  function publish(id: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await publishDraftAction(undefined, fd);
    });
  }
  function approve(id: string) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await approveDraftAction(undefined, fd);
    });
  }
  function retire(id: string) {
    if (!confirm("Retire this article?")) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      await retireArticleAction(undefined, fd);
    });
  }

  const inReview = drafts.filter((d) => d.state === "in_review");
  const draftsOnly = drafts.filter((d) => d.state === "draft");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Knowledge base drafts
        </h1>
        <Link
          href="/kb/new"
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
        >
          New article
        </Link>
      </div>

      <Section title="In review" items={inReview}>
        {(d) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/kb/new?id=${d.id}`}
              className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Edit3 size={14} /> Edit
            </Link>
            <button
              type="button"
              disabled={pending}
              onClick={() => approve(d.id)}
              className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 disabled:opacity-60"
            >
              <CheckCircle2 size={14} /> Approve
            </button>
            {canPublish && (
              <button
                type="button"
                disabled={pending}
                onClick={() => publish(d.id)}
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-60"
              >
                <Send size={14} /> Publish
              </button>
            )}
            <button
              type="button"
              disabled={pending}
              onClick={() => retire(d.id)}
              className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-700 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/30 disabled:opacity-60"
            >
              <Trash2 size={14} /> Retire
            </button>
          </div>
        )}
      </Section>

      <Section title="Drafts" items={draftsOnly}>
        {(d) => (
          <div className="flex items-center gap-2">
            <Link
              href={`/kb/new?id=${d.id}`}
              className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Edit3 size={14} /> Continue
            </Link>
            {canPublish && (
              <button
                type="button"
                disabled={pending}
                onClick={() => publish(d.id)}
                className="inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white disabled:opacity-60"
              >
                <Send size={14} /> Publish
              </button>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  items,
  children,
}: {
  title: string;
  items: KbArticleSummary[];
  children: (d: KbArticleSummary) => React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-800 text-sm font-semibold text-gray-900 dark:text-white inline-flex items-center gap-2">
        <FileText size={14} /> {title} ({items.length})
      </div>
      {items.length === 0 ? (
        <p className="px-5 py-4 text-sm text-gray-500">Nothing here.</p>
      ) : (
        <ul className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((d) => (
            <li
              key={d.id}
              className="px-5 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {d.title}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  v{d.helpful_count + d.unhelpful_count > 0 ? "x" : "1"} ·
                  updated {new Date(d.updated_at).toLocaleString()}
                </div>
              </div>
              {children(d)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
