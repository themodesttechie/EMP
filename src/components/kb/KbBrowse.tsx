"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { BookOpen, FolderTree, PlusCircle, Search, Star, Trophy } from "lucide-react";
import type { KbArticleSummary, KbCategory } from "@/lib/kb/types";

type Props = {
  categories: KbCategory[];
  recent: KbArticleSummary[];
  mostViewed: KbArticleSummary[];
  searchResults: KbArticleSummary[];
  activeQuery: string;
  canAuthor: boolean;
};

export default function KbBrowse({
  categories,
  recent,
  mostViewed,
  searchResults,
  activeQuery,
  canAuthor,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(activeQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(sp?.toString());
    if (q) params.set("q", q);
    else params.delete("q");
    router.push(`/kb?${params.toString()}`);
  }

  const tree = buildTree(categories);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Knowledge base
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Search published guides, browse by category, or read the most helpful articles.
          </p>
        </div>
        <div className="flex gap-2">
          {canAuthor && (
            <Link
              href="/kb/drafts"
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Drafts
            </Link>
          )}
          {canAuthor && (
            <Link
              href="/kb/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium"
            >
              <PlusCircle size={16} /> New article
            </Link>
          )}
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-2 shadow-sm"
      >
        <Search className="text-gray-400 ml-3 mr-2" size={20} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles by title or text"
          className="flex-1 bg-transparent px-2 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold"
        >
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-4 space-y-4">
          <Card title="Categories" icon={<FolderTree size={16} />}>
            {tree.length === 0 ? (
              <Empty>No categories yet</Empty>
            ) : (
              <ul className="space-y-1">
                {tree.map((node) => (
                  <CategoryNode key={node.id} node={node} />
                ))}
              </ul>
            )}
          </Card>

          <Card title="Most helpful" icon={<Trophy size={16} />}>
            {mostViewed.length === 0 ? (
              <Empty>No votes yet</Empty>
            ) : (
              <ul className="space-y-2">
                {mostViewed.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/kb/${a.slug}`}
                      className="block text-sm text-gray-700 dark:text-gray-200 hover:text-brand-600"
                    >
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 inline-flex items-center gap-1">
                        <Star size={12} /> {a.helpful_count} helpful votes
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </aside>

        <section className="lg:col-span-8 space-y-4">
          {activeQuery ? (
            <Card
              title={`Search results for "${activeQuery}"`}
              icon={<Search size={16} />}
            >
              {searchResults.length === 0 ? (
                <Empty>No matches.</Empty>
              ) : (
                <ArticleList items={searchResults} />
              )}
            </Card>
          ) : (
            <Card title="Recently published" icon={<BookOpen size={16} />}>
              {recent.length === 0 ? (
                <Empty>No published articles yet.</Empty>
              ) : (
                <ArticleList items={recent} />
              )}
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 shadow-sm">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white inline-flex items-center gap-2 mb-3">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-gray-500 dark:text-gray-400">{children}</p>
  );
}

function ArticleList({ items }: { items: KbArticleSummary[] }) {
  return (
    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
      {items.map((a) => (
        <li key={a.id} className="py-3">
          <Link
            href={`/kb/${a.slug}`}
            className="block group"
          >
            <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
              {a.title}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
              <span>
                {a.helpful_count} helpful · {a.unhelpful_count} unhelpful
              </span>
              {a.tags.length > 0 && <span>· {a.tags.slice(0, 4).join(", ")}</span>}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

type Node = KbCategory & { children: Node[] };

function buildTree(rows: KbCategory[]): Node[] {
  const byId: Record<string, Node> = {};
  rows.forEach((r) => (byId[r.id] = { ...r, children: [] }));
  const roots: Node[] = [];
  rows.forEach((r) => {
    if (r.parent_id && byId[r.parent_id]) {
      byId[r.parent_id].children.push(byId[r.id]);
    } else {
      roots.push(byId[r.id]);
    }
  });
  return roots;
}

function CategoryNode({ node, depth = 0 }: { node: Node; depth?: number }) {
  return (
    <li>
      <Link
        href={`/kb?q=&category=${encodeURIComponent(node.slug)}`}
        className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <span className="font-medium">{node.name}</span>
      </Link>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((c) => (
            <CategoryNode key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
