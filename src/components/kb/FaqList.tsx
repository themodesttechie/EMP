"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import type { KbArticleSummary } from "@/lib/kb/types";

type Props = {
  articles: KbArticleSummary[];
};

export default function FaqList({ articles }: Props) {
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return articles;
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(needle) ||
        a.tags.some((t) => t.toLowerCase().includes(needle)),
    );
  }, [q, articles]);

  return (
    <div className="flex-1 min-h-screen bg-[#F8F9FC] dark:bg-[#09090b]">
      <header className="px-6 py-12 md:py-16 bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-center">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-6 tracking-tight">
            How can we help you?
          </h1>
          <div className="relative max-w-2xl mx-auto">
            <div className="flex items-center bg-white dark:bg-[#121212] rounded-2xl p-2 shadow-xl border border-white/50 dark:border-slate-800">
              <Search className="text-slate-400 ml-4 mr-2" size={22} />
              <input
                type="text"
                placeholder="Search the knowledge base"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="w-full px-2 py-3 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 text-base focus:outline-none"
              />
              <Link
                href="/kb"
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition-colors text-sm"
              >
                Browse all
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[900px] mx-auto px-6 py-10 pb-32">
        <div className="mb-6 flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {q ? "Search results" : "Top articles"}
            </h2>
            {q && (
              <p className="text-sm text-slate-500 mt-1">
                Showing matches for &ldquo;{q}&rdquo;
              </p>
            )}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-500">
            <HelpCircle size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-base font-bold text-slate-900 dark:text-white">
              No matches yet
            </p>
            <p className="text-sm mt-1">
              Try different terms or open a ticket from helpdesk.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a) => {
              const isOpen = openId === a.id;
              return (
                <div
                  key={a.id}
                  className={`rounded-2xl border transition-all overflow-hidden bg-white dark:bg-[#121212] ${
                    isOpen
                      ? "border-brand-200 dark:border-brand-800/50 shadow-md"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : a.id)}
                    className="w-full p-5 text-left flex items-start justify-between gap-4"
                  >
                    <h3
                      className={`text-base font-bold leading-snug pr-6 ${
                        isOpen
                          ? "text-brand-600 dark:text-brand-400"
                          : "text-slate-900 dark:text-white"
                      }`}
                    >
                      {a.title}
                    </h3>
                    <div
                      className={`shrink-0 p-1.5 rounded-full transition-transform ${
                        isOpen
                          ? "bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 rotate-180"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                      }`}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <div
                    className={`transition-all duration-200 ${
                      isOpen
                        ? "max-h-[600px] opacity-100 pb-6 px-5"
                        : "max-h-0 opacity-0 overflow-hidden px-5"
                    }`}
                  >
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-sm text-slate-500 mb-3">
                        {a.tags.slice(0, 4).join(" · ")}
                      </p>
                      <Link
                        href={`/kb/${a.slug}`}
                        className="inline-flex items-center px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700"
                      >
                        Open article
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
