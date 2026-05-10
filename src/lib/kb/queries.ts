import "server-only";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type {
  KbArticle,
  KbArticleSummary,
  KbArticleVersionRow,
  KbCategory,
  KbViewSource,
} from "./types";

const ARTICLE_SUMMARY_COLS =
  "id, tenant_id, slug, title, category_id, state, helpful_count, unhelpful_count, tags, published_at, updated_at";

const ARTICLE_FULL_COLS =
  "id, tenant_id, slug, title, body, body_tiptap, category_id, state, version, helpful_count, unhelpful_count, tags, author_id, reviewer_id, source_ticket_id, published_at, retired_at, created_at, updated_at";

export async function listCategories(): Promise<KbCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kb_categories")
    .select("id, tenant_id, parent_id, slug, name, description, sort_order")
    .order("sort_order")
    .order("name");
  return (data ?? []) as KbCategory[];
}

export async function listPublished(opts?: {
  limit?: number;
}): Promise<KbArticleSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kb_articles")
    .select(ARTICLE_SUMMARY_COLS)
    .eq("state", "published")
    .order("published_at", { ascending: false })
    .limit(opts?.limit ?? 50);
  return (data ?? []) as KbArticleSummary[];
}

export async function listMostViewed(opts?: {
  limit?: number;
}): Promise<KbArticleSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kb_articles")
    .select(ARTICLE_SUMMARY_COLS)
    .eq("state", "published")
    .order("helpful_count", { ascending: false })
    .limit(opts?.limit ?? 10);
  return (data ?? []) as KbArticleSummary[];
}

export async function listByCategory(
  category_slug: string,
  opts?: { limit?: number },
): Promise<KbArticleSummary[]> {
  const supabase = await createClient();
  const { data: cat } = await supabase
    .from("kb_categories")
    .select("id")
    .eq("slug", category_slug)
    .maybeSingle();
  if (!cat) return [];

  const { data } = await supabase
    .from("kb_articles")
    .select(ARTICLE_SUMMARY_COLS)
    .eq("state", "published")
    .eq("category_id", (cat as { id: string }).id)
    .order("helpful_count", { ascending: false })
    .limit(opts?.limit ?? 50);
  return (data ?? []) as KbArticleSummary[];
}

export async function searchPublishedByText(
  q: string,
  opts?: { limit?: number },
): Promise<KbArticleSummary[]> {
  const supabase = await createClient();
  const trimmed = q.trim();
  if (!trimmed) return [];
  // Cheap textual fallback for the browse UI; the AI deflection path uses pgvector.
  const { data } = await supabase
    .from("kb_articles")
    .select(ARTICLE_SUMMARY_COLS)
    .eq("state", "published")
    .or(`title.ilike.%${trimmed}%,body.ilike.%${trimmed}%`)
    .order("helpful_count", { ascending: false })
    .limit(opts?.limit ?? 20);
  return (data ?? []) as KbArticleSummary[];
}

export async function getArticle(slug: string): Promise<KbArticle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kb_articles")
    .select(ARTICLE_FULL_COLS)
    .eq("slug", slug)
    .maybeSingle();
  return (data ?? null) as KbArticle | null;
}

export async function getArticleById(id: string): Promise<KbArticle | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kb_articles")
    .select(ARTICLE_FULL_COLS)
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as KbArticle | null;
}

export async function listVersions(article_id: string): Promise<KbArticleVersionRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kb_article_versions")
    .select("id, article_id, version, title, body, body_tiptap, changed_by, changed_at, change_summary")
    .eq("article_id", article_id)
    .order("version", { ascending: false });
  return (data ?? []) as KbArticleVersionRow[];
}

export async function getDraftsForReview(): Promise<KbArticleSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kb_articles")
    .select(ARTICLE_SUMMARY_COLS)
    .in("state", ["draft", "in_review"])
    .order("updated_at", { ascending: false })
    .limit(100);
  return (data ?? []) as KbArticleSummary[];
}

// Anonymous/agent view recording. Uses admin client so RLS does not block from
// public surfaces (tenant_id still enforced by the caller passing the right id).
export async function recordView(opts: {
  tenant_id: string;
  article_id: string;
  viewer_id: string | null;
  source: KbViewSource;
}): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("kb_article_views").insert({
      tenant_id: opts.tenant_id,
      article_id: opts.article_id,
      viewer_id: opts.viewer_id,
      source: opts.source,
    });
  } catch (err) {
    console.error("[kb] recordView failed:", err);
  }
}

export async function listRelatedByCategory(
  article: KbArticle,
  opts?: { limit?: number },
): Promise<KbArticleSummary[]> {
  if (!article.category_id) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("kb_articles")
    .select(ARTICLE_SUMMARY_COLS)
    .eq("state", "published")
    .eq("category_id", article.category_id)
    .neq("id", article.id)
    .order("helpful_count", { ascending: false })
    .limit(opts?.limit ?? 5);
  return (data ?? []) as KbArticleSummary[];
}
