import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_SONNET } from "./models";
import { runAI } from "./actions-logger";
import {
  KB_AUTHOR_SYSTEM,
  buildKbAuthorUser,
  type KbAuthorUserInput,
} from "./prompts/kb-author";
import { createAdminClient } from "@/lib/supabase/server";
import type { KbAuthorDraft } from "@/lib/kb/types";

const FALLBACK: KbAuthorDraft = {
  title: "",
  body_md: "",
  suggested_category_slug: null,
  tags: [],
};

function parseDraft(text: string): KbAuthorDraft {
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    return {
      title: typeof obj.title === "string" ? obj.title.slice(0, 200) : "",
      body_md: typeof obj.body_md === "string" ? obj.body_md : "",
      suggested_category_slug:
        typeof obj.suggested_category_slug === "string" &&
        obj.suggested_category_slug.length > 0
          ? obj.suggested_category_slug
          : null,
      tags: Array.isArray(obj.tags)
        ? obj.tags
            .filter((t: unknown): t is string => typeof t === "string")
            .map((t: string) => t.toLowerCase().trim())
            .filter((t: string) => t.length > 0)
            .slice(0, 8)
        : [],
    };
  } catch {
    return FALLBACK;
  }
}

export async function draftKbArticleFromTicket(opts: {
  tenant_id: string;
  actor_id: string | null;
  ticket_id: string;
}): Promise<KbAuthorDraft & { degraded: boolean }> {
  const c = getAnthropic();
  if (!c.ok) return { ...FALLBACK, degraded: true };

  const admin = createAdminClient();

  const { data: ticket } = await admin
    .from("tickets")
    .select(
      "id, title, description, category_id, ticket_categories(slug, name)",
    )
    .eq("id", opts.ticket_id)
    .maybeSingle();
  if (!ticket) return { ...FALLBACK, degraded: true };

  const t = ticket as {
    id: string;
    title: string;
    description: string | null;
    category_id: string | null;
    ticket_categories: { slug: string | null; name: string | null } | null;
  };

  const { data: comments } = await admin
    .from("ticket_comments")
    .select("kind, body, profiles(full_name, email, role)")
    .eq("ticket_id", opts.ticket_id)
    .order("created_at");
  const commentRows = (comments ?? []) as Array<{
    kind: string;
    body: string;
    profiles: { full_name: string | null; email: string; role: string } | null;
  }>;

  const { data: categories } = await admin
    .from("kb_categories")
    .select("slug, name, description")
    .eq("tenant_id", opts.tenant_id);

  const userInput: KbAuthorUserInput = {
    ticket_title: t.title,
    ticket_description: t.description,
    ticket_category_slug: t.ticket_categories?.slug ?? null,
    ticket_category_name: t.ticket_categories?.name ?? null,
    comments: commentRows.map((c) => ({
      author_label: c.profiles?.role ?? "user",
      kind: c.kind,
      body: (c.body || "").slice(0, 4000),
    })),
    available_categories: ((categories ?? []) as Array<{
      slug: string;
      name: string;
      description: string | null;
    }>).map((c) => ({ slug: c.slug, name: c.name, description: c.description })),
  };

  const userPrompt = buildKbAuthorUser(userInput);
  const r = await runAI<KbAuthorDraft>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "kb_authoring",
    model: MODEL_SONNET,
    prompt: KB_AUTHOR_SYSTEM + "\n" + userPrompt,
    related_entity_type: "ticket",
    related_entity_id: opts.ticket_id,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_SONNET,
        system: KB_AUTHOR_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 1500,
        temperature: 0.3,
      });
      return {
        result: parseDraft(call.text),
        tokens_in: call.tokens_in,
        tokens_out: call.tokens_out,
        cache_read_tokens: call.cache_read_tokens,
        cache_write_tokens: call.cache_write_tokens,
      };
    },
  });

  if (!r.ok) return { ...FALLBACK, degraded: true };
  return { ...r.data, degraded: false };
}
