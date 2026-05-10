"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Edit3, ThumbsDown, ThumbsUp } from "lucide-react";
import type { KbArticle, KbArticleSummary } from "@/lib/kb/types";
import {
  voteHelpfulAction,
  voteUnhelpfulAction,
} from "@/lib/kb/actions";
import Markdown from "./Markdown";

type Props = {
  article: KbArticle;
  related: KbArticleSummary[];
  canEdit: boolean;
};

export default function KbArticleView({ article, related, canEdit }: Props) {
  const [helpful, setHelpful] = useState(article.helpful_count);
  const [unhelpful, setUnhelpful] = useState(article.unhelpful_count);
  const [voted, setVoted] = useState<"yes" | "no" | null>(null);
  const [isPending, startTransition] = useTransition();

  function vote(kind: "yes" | "no") {
    if (voted) return;
    setVoted(kind);
    if (kind === "yes") setHelpful((n) => n + 1);
    else setUnhelpful((n) => n + 1);
    startTransition(async () => {
      if (kind === "yes") await voteHelpfulAction(article.id);
      else await voteUnhelpfulAction(article.id);
    });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <article className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/kb"
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600"
          >
            <ArrowLeft size={16} /> Back to knowledge base
          </Link>
          {canEdit && (
            <Link
              href={`/kb/new?id=${article.id}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Edit3 size={14} /> Edit
            </Link>
          )}
        </div>

        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {article.title}
          </h1>
          <div className="text-xs text-gray-500 flex flex-wrap items-center gap-3">
            <span>State: {article.state}</span>
            <span>Version v{article.version}</span>
            {article.published_at && (
              <span>
                Published {new Date(article.published_at).toLocaleDateString()}
              </span>
            )}
            {article.tags.length > 0 && (
              <span>Tags: {article.tags.join(", ")}</span>
            )}
          </div>
        </header>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-sm">
          <Markdown source={article.body} />
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Was this article helpful?
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isPending || voted !== null}
              onClick={() => vote("yes")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-60"
            >
              <ThumbsUp size={14} /> Yes ({helpful})
            </button>
            <button
              type="button"
              disabled={isPending || voted !== null}
              onClick={() => vote("no")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 text-sm font-semibold hover:bg-rose-100 disabled:opacity-60"
            >
              <ThumbsDown size={14} /> No ({unhelpful})
            </button>
            {voted && (
              <span className="text-xs text-gray-500">Thanks for the feedback.</span>
            )}
          </div>
        </div>
      </article>

      <aside className="lg:col-span-4 space-y-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Related articles
          </h2>
          {related.length === 0 ? (
            <p className="text-sm text-gray-500">No related articles in this category yet.</p>
          ) : (
            <ul className="space-y-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/kb/${r.slug}`}
                    className="text-sm text-gray-700 dark:text-gray-200 hover:text-brand-600 font-medium"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
