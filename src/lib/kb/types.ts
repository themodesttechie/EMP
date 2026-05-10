export type KbState = "draft" | "in_review" | "published" | "retired";
export type KbViewSource =
  | "search"
  | "ticket_form"
  | "faq_browse"
  | "direct"
  | "related";

export type KbCategory = {
  id: string;
  tenant_id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type KbArticleSummary = {
  id: string;
  tenant_id: string;
  slug: string;
  title: string;
  category_id: string | null;
  state: KbState;
  helpful_count: number;
  unhelpful_count: number;
  tags: string[];
  published_at: string | null;
  updated_at: string;
};

export type KbArticle = KbArticleSummary & {
  body: string;
  body_tiptap: unknown | null;
  version: number;
  author_id: string | null;
  reviewer_id: string | null;
  source_ticket_id: string | null;
  retired_at: string | null;
  created_at: string;
};

export type KbArticleVersionRow = {
  id: string;
  article_id: string;
  version: number;
  title: string;
  body: string;
  body_tiptap: unknown | null;
  changed_by: string | null;
  changed_at: string;
  change_summary: string | null;
};

export type KbDeflectionMatch = {
  id: string;
  slug: string;
  title: string;
  snippet: string;
  similarity: number;
};

export type KbAuthorDraft = {
  title: string;
  body_md: string;
  suggested_category_slug: string | null;
  tags: string[];
};

export type KbActionResult<T = unknown> = {
  ok?: boolean;
  error?: string;
  data?: T;
};
