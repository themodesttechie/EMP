import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { runAI } from "@/lib/ai/actions-logger";
import { EMBEDDINGS_DIM, EMBEDDINGS_MODEL, getOpenAI } from "./client";

export type EmbeddingResult =
  | { ok: true; embedding: number[]; tokens: number }
  | { ok: false; reason: "no_api_key" | "empty_input" | "error"; error?: string };

function clampForEmbed(text: string): string {
  // Embeddings model accepts ~8k tokens; trim conservatively to ~24k chars.
  return text.replace(/\s+/g, " ").trim().slice(0, 24000);
}

export async function embedText(text: string): Promise<EmbeddingResult> {
  const c = getOpenAI();
  if (!c.ok) return { ok: false, reason: "no_api_key" };
  const cleaned = clampForEmbed(text);
  if (!cleaned) return { ok: false, reason: "empty_input" };

  try {
    const resp = await c.client.embeddings.create({
      model: EMBEDDINGS_MODEL,
      input: cleaned,
      dimensions: EMBEDDINGS_DIM,
    });
    const vec = resp.data[0]?.embedding;
    if (!vec || vec.length !== EMBEDDINGS_DIM) {
      return { ok: false, reason: "error", error: "bad_embedding_shape" };
    }
    return { ok: true, embedding: vec, tokens: resp.usage?.total_tokens ?? 0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, reason: "error", error: message };
  }
}

// Logged variant — accounts under ai_actions so per-tenant caps apply.
export async function embedTextLogged(opts: {
  tenant_id: string;
  actor_id: string | null;
  text: string;
  related_entity_type?: string;
  related_entity_id?: string;
}): Promise<EmbeddingResult> {
  const r = await runAI<{ vec: number[]; tokens: number }>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "other",
    model: EMBEDDINGS_MODEL,
    prompt: opts.text.slice(0, 4000),
    related_entity_type: opts.related_entity_type,
    related_entity_id: opts.related_entity_id,
    fn: async () => {
      const inner = await embedText(opts.text);
      if (!inner.ok) {
        throw new Error(inner.reason + (inner.error ? `:${inner.error}` : ""));
      }
      return {
        result: { vec: inner.embedding, tokens: inner.tokens },
        tokens_in: inner.tokens,
        tokens_out: 0,
      };
    },
  });
  if (!r.ok) {
    return { ok: false, reason: "error", error: r.error };
  }
  return { ok: true, embedding: r.data.vec, tokens: r.data.tokens };
}

// Recompute + persist embedding for a specific article.
export async function embedArticle(article_id: string): Promise<{
  ok: boolean;
  reason?: string;
}> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("kb_articles")
    .select("id, tenant_id, title, body, author_id")
    .eq("id", article_id)
    .maybeSingle();
  if (error || !data) return { ok: false, reason: "not_found" };

  const row = data as {
    id: string;
    tenant_id: string;
    title: string;
    body: string;
    author_id: string | null;
  };
  const text = `${row.title}\n\n${row.body}`.trim();
  const r = await embedTextLogged({
    tenant_id: row.tenant_id,
    actor_id: row.author_id,
    text,
    related_entity_type: "kb_article",
    related_entity_id: row.id,
  });
  if (!r.ok) return { ok: false, reason: r.reason };

  const { error: upErr } = await admin
    .from("kb_articles")
    .update({ embedding: toPgVector(r.embedding) })
    .eq("id", article_id);
  if (upErr) return { ok: false, reason: upErr.message };

  return { ok: true };
}

// pgvector accepts the textual `[1,2,3]` cast at the protocol level via PostgREST.
export function toPgVector(v: number[]): string {
  return "[" + v.join(",") + "]";
}
