"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { logAction } from "@/lib/audit/logger";
import { embedArticle } from "@/lib/embeddings/embed";
import { draftKbArticleFromTicket } from "@/lib/ai/kb-author";
import { uniqueArticleSlug } from "./slug";
import type { KbActionResult, KbState } from "./types";

const AUTHORING_ROLES = new Set(["agent", "admin", "owner"]);
const REVIEWING_ROLES = new Set(["admin", "owner"]);

function ensureCanAuthor(role: string): string | null {
  if (!AUTHORING_ROLES.has(role)) return "Forbidden";
  return null;
}

function ensureCanReview(role: string): string | null {
  if (!REVIEWING_ROLES.has(role)) return "Forbidden";
  return null;
}

function clean(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

async function snapshotVersion(
  article_id: string,
  changed_by: string | null,
  change_summary: string | null,
): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("kb_articles")
    .select("tenant_id, version, title, body, body_tiptap")
    .eq("id", article_id)
    .maybeSingle();
  if (!data) return;
  const row = data as {
    tenant_id: string;
    version: number;
    title: string;
    body: string;
    body_tiptap: unknown | null;
  };
  await admin.from("kb_article_versions").insert({
    tenant_id: row.tenant_id,
    article_id,
    version: row.version,
    title: row.title,
    body: row.body,
    body_tiptap: row.body_tiptap,
    changed_by,
    change_summary,
  });
}

export async function createDraftAction(
  _prev: KbActionResult | undefined,
  formData: FormData,
): Promise<KbActionResult<{ id: string; slug: string }>> {
  const profile = await requireProfile();
  const denied = ensureCanAuthor(profile.role);
  if (denied) return { error: denied };

  const title = clean(formData.get("title"), 200);
  const body = clean(formData.get("body"), 50000);
  const bodyTiptapRaw = clean(formData.get("body_tiptap"), 200000);
  const categoryId = clean(formData.get("category_id"), 64) || null;
  const tagsRaw = clean(formData.get("tags"), 400);
  if (!title) return { error: "Title is required." };

  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0)
    .slice(0, 8);

  let bodyTiptap: unknown | null = null;
  if (bodyTiptapRaw) {
    try {
      bodyTiptap = JSON.parse(bodyTiptapRaw);
    } catch {
      bodyTiptap = null;
    }
  }

  const slug = await uniqueArticleSlug(profile.tenant_id, title);

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("kb_articles")
    .insert({
      tenant_id: profile.tenant_id,
      slug,
      title,
      body,
      body_tiptap: bodyTiptap,
      category_id: categoryId,
      state: "draft" as KbState,
      version: 1,
      author_id: profile.id,
      tags,
    })
    .select("id, slug")
    .maybeSingle();
  if (error || !data) return { error: error?.message || "Insert failed" };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kb.create_draft",
    entity_type: "kb_article",
    entity_id: (data as { id: string }).id,
    after: { title, state: "draft", category_id: categoryId, tags },
  });

  // Fire and forget embedding so the article is immediately searchable.
  embedArticle((data as { id: string }).id).catch(() => undefined);

  revalidatePath("/kb");
  revalidatePath("/kb/drafts");
  return { ok: true, data: data as { id: string; slug: string } };
}

export async function updateBodyAction(
  _prev: KbActionResult | undefined,
  formData: FormData,
): Promise<KbActionResult> {
  const profile = await requireProfile();
  const denied = ensureCanAuthor(profile.role);
  if (denied) return { error: denied };

  const id = clean(formData.get("id"), 64);
  if (!id) return { error: "id is required" };
  const title = clean(formData.get("title"), 200);
  const body = clean(formData.get("body"), 50000);
  const bodyTiptapRaw = clean(formData.get("body_tiptap"), 200000);
  const categoryId = clean(formData.get("category_id"), 64) || null;
  const tagsRaw = clean(formData.get("tags"), 400);
  const changeSummary = clean(formData.get("change_summary"), 400) || null;

  const tags = tagsRaw
    ? tagsRaw
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0)
        .slice(0, 8)
    : null;
  let bodyTiptap: unknown | null = null;
  if (bodyTiptapRaw) {
    try {
      bodyTiptap = JSON.parse(bodyTiptapRaw);
    } catch {
      bodyTiptap = null;
    }
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("kb_articles")
    .select(
      "id, tenant_id, version, state, author_id, reviewer_id, title, body",
    )
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { error: "Not found" };
  const ex = existing as {
    id: string;
    tenant_id: string;
    version: number;
    state: KbState;
    author_id: string | null;
    reviewer_id: string | null;
    title: string;
    body: string;
  };
  if (ex.tenant_id !== profile.tenant_id) return { error: "Forbidden" };

  // Snapshot current body before mutation
  await snapshotVersion(id, profile.id, changeSummary);

  const update: Record<string, unknown> = {
    title: title || ex.title,
    body,
    body_tiptap: bodyTiptap,
    category_id: categoryId,
    version: ex.version + 1,
  };
  if (tags) update.tags = tags;

  const { error } = await admin.from("kb_articles").update(update).eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kb.update_body",
    entity_type: "kb_article",
    entity_id: id,
    before: { title: ex.title, version: ex.version },
    after: { title: update.title, version: update.version, change_summary: changeSummary },
  });

  // Re-embed asynchronously so search reflects the new content.
  embedArticle(id).catch(() => undefined);

  revalidatePath("/kb");
  revalidatePath(`/kb/${id}`);
  return { ok: true };
}

export async function submitForReviewAction(
  _prev: KbActionResult | undefined,
  formData: FormData,
): Promise<KbActionResult> {
  const profile = await requireProfile();
  const denied = ensureCanAuthor(profile.role);
  if (denied) return { error: denied };

  const id = clean(formData.get("id"), 64);
  if (!id) return { error: "id is required" };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("kb_articles")
    .select("tenant_id, state")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { error: "Not found" };
  const ex = existing as { tenant_id: string; state: KbState };
  if (ex.tenant_id !== profile.tenant_id) return { error: "Forbidden" };
  if (ex.state !== "draft") return { error: "Only drafts can be submitted" };

  const { error } = await admin
    .from("kb_articles")
    .update({ state: "in_review" })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kb.submit_for_review",
    entity_type: "kb_article",
    entity_id: id,
    before: { state: ex.state },
    after: { state: "in_review" },
  });

  revalidatePath("/kb/drafts");
  return { ok: true };
}

export async function approveDraftAction(
  _prev: KbActionResult | undefined,
  formData: FormData,
): Promise<KbActionResult> {
  const profile = await requireProfile();
  const denied = ensureCanReview(profile.role);
  if (denied) return { error: denied };

  const id = clean(formData.get("id"), 64);
  if (!id) return { error: "id is required" };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("kb_articles")
    .select("tenant_id, state")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { error: "Not found" };
  const ex = existing as { tenant_id: string; state: KbState };
  if (ex.tenant_id !== profile.tenant_id) return { error: "Forbidden" };

  const { error } = await admin
    .from("kb_articles")
    .update({ reviewer_id: profile.id })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kb.approve",
    entity_type: "kb_article",
    entity_id: id,
    after: { reviewer_id: profile.id },
  });

  revalidatePath("/kb/drafts");
  return { ok: true };
}

export async function publishDraftAction(
  _prev: KbActionResult | undefined,
  formData: FormData,
): Promise<KbActionResult> {
  const profile = await requireProfile();
  const denied = ensureCanReview(profile.role);
  if (denied) return { error: denied };

  const id = clean(formData.get("id"), 64);
  if (!id) return { error: "id is required" };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("kb_articles")
    .select("tenant_id, state")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { error: "Not found" };
  const ex = existing as { tenant_id: string; state: KbState };
  if (ex.tenant_id !== profile.tenant_id) return { error: "Forbidden" };

  const { error } = await admin
    .from("kb_articles")
    .update({
      state: "published",
      reviewer_id: profile.id,
      published_at: new Date().toISOString(),
      retired_at: null,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kb.publish",
    entity_type: "kb_article",
    entity_id: id,
    before: { state: ex.state },
    after: { state: "published" },
  });

  // Ensure a current embedding exists.
  embedArticle(id).catch(() => undefined);

  revalidatePath("/kb");
  revalidatePath("/kb/drafts");
  return { ok: true };
}

export async function retireArticleAction(
  _prev: KbActionResult | undefined,
  formData: FormData,
): Promise<KbActionResult> {
  const profile = await requireProfile();
  const denied = ensureCanReview(profile.role);
  if (denied) return { error: denied };

  const id = clean(formData.get("id"), 64);
  if (!id) return { error: "id is required" };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("kb_articles")
    .select("tenant_id, state")
    .eq("id", id)
    .maybeSingle();
  if (!existing) return { error: "Not found" };
  const ex = existing as { tenant_id: string; state: KbState };
  if (ex.tenant_id !== profile.tenant_id) return { error: "Forbidden" };

  const { error } = await admin
    .from("kb_articles")
    .update({ state: "retired", retired_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kb.retire",
    entity_type: "kb_article",
    entity_id: id,
    before: { state: ex.state },
    after: { state: "retired" },
  });

  revalidatePath("/kb");
  return { ok: true };
}

export async function voteHelpfulAction(article_id: string): Promise<KbActionResult> {
  const profile = await requireProfile();
  const admin = createAdminClient();
  const { error } = await admin.rpc("kb_vote_helpful", { p_article: article_id });
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kb.vote_helpful",
    entity_type: "kb_article",
    entity_id: article_id,
  });

  revalidatePath(`/kb`);
  return { ok: true };
}

export async function voteUnhelpfulAction(article_id: string): Promise<KbActionResult> {
  const profile = await requireProfile();
  const admin = createAdminClient();
  const { error } = await admin.rpc("kb_vote_unhelpful", { p_article: article_id });
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kb.vote_unhelpful",
    entity_type: "kb_article",
    entity_id: article_id,
  });

  revalidatePath(`/kb`);
  return { ok: true };
}

export async function generateFromTicketAction(opts: {
  ticket_id: string;
}): Promise<KbActionResult<{ id: string; slug: string; title: string; body: string; suggested_category_slug: string | null; tags: string[] }>> {
  const profile = await requireProfile();
  const denied = ensureCanAuthor(profile.role);
  if (denied) return { error: denied };

  const draft = await draftKbArticleFromTicket({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    ticket_id: opts.ticket_id,
  });
  if (draft.degraded || !draft.title) {
    return { error: "AI authoring unavailable. Try again or compose by hand." };
  }

  const admin = createAdminClient();
  const { data: cats } = await admin
    .from("kb_categories")
    .select("id, slug")
    .eq("tenant_id", profile.tenant_id);
  const catRows = (cats ?? []) as Array<{ id: string; slug: string }>;
  const categoryId = draft.suggested_category_slug
    ? catRows.find((c) => c.slug === draft.suggested_category_slug)?.id ?? null
    : null;

  const slug = await uniqueArticleSlug(profile.tenant_id, draft.title);
  const { data, error } = await admin
    .from("kb_articles")
    .insert({
      tenant_id: profile.tenant_id,
      slug,
      title: draft.title,
      body: draft.body_md,
      category_id: categoryId,
      state: "draft" as KbState,
      version: 1,
      author_id: profile.id,
      tags: draft.tags,
      source_ticket_id: opts.ticket_id,
    })
    .select("id, slug, title, body, tags, category_id")
    .maybeSingle();
  if (error || !data) return { error: error?.message || "Insert failed" };

  const row = data as {
    id: string;
    slug: string;
    title: string;
    body: string;
    tags: string[];
    category_id: string | null;
  };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kb.author_from_ticket",
    entity_type: "kb_article",
    entity_id: row.id,
    after: { source_ticket_id: opts.ticket_id, title: draft.title },
  });

  embedArticle(row.id).catch(() => undefined);

  revalidatePath("/kb/drafts");
  return {
    ok: true,
    data: {
      id: row.id,
      slug: row.slug,
      title: row.title,
      body: row.body,
      suggested_category_slug: draft.suggested_category_slug,
      tags: row.tags,
    },
  };
}

export async function recordViewAction(opts: {
  article_id: string;
  source: "search" | "ticket_form" | "faq_browse" | "direct" | "related";
}): Promise<KbActionResult> {
  const profile = await requireProfile();
  const admin = createAdminClient();
  const { error } = await admin.from("kb_article_views").insert({
    tenant_id: profile.tenant_id,
    article_id: opts.article_id,
    viewer_id: profile.id,
    source: opts.source,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

