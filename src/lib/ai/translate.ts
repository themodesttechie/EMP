import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_HAIKU } from "./models";
import { runAI } from "./actions-logger";
import { TRANSLATE_SYSTEM, buildTranslateUser } from "./prompts/translate";
import { createAdminClient } from "@/lib/supabase/server";

export type TranslateResult = {
  translations: Record<string, string>;
};

function parseTranslate(text: string): TranslateResult {
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned) as { translations?: Record<string, string> };
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj.translations ?? {})) {
      if (typeof v === "string" && v.trim().length > 0) {
        out[k.toLowerCase()] = v;
      }
    }
    return { translations: out };
  } catch {
    return { translations: {} };
  }
}

export type TranslateAnnouncementOpts = {
  tenant_id: string;
  actor_id: string | null;
  announcement_id: string;
  target_locales: string[];
  source_locale?: string;
};

export async function translateAnnouncement(
  opts: TranslateAnnouncementOpts,
): Promise<{ ok: boolean; translated_locales: string[]; degraded?: boolean }> {
  const c = getAnthropic();
  if (!c.ok) return { ok: false, translated_locales: [], degraded: true };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("announcements")
    .select("id, body_md, body_translated")
    .eq("id", opts.announcement_id)
    .maybeSingle();
  if (!row) return { ok: false, translated_locales: [] };
  const r = row as { id: string; body_md: string; body_translated: Record<string, string> | null };

  const existing = r.body_translated ?? {};
  const need = opts.target_locales
    .map((l) => l.toLowerCase())
    .filter((l) => l !== (opts.source_locale ?? "en") && (!existing[l] || existing[l].length === 0));
  if (need.length === 0) return { ok: true, translated_locales: [] };

  const userPrompt = buildTranslateUser({
    source_text: r.body_md,
    source_locale: opts.source_locale ?? "en",
    target_locales: need,
  });

  const result = await runAI<TranslateResult>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "translate",
    model: MODEL_HAIKU,
    prompt: TRANSLATE_SYSTEM + "\n" + userPrompt,
    related_entity_type: "announcement",
    related_entity_id: opts.announcement_id,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_HAIKU,
        system: TRANSLATE_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 2000,
        temperature: 0,
      });
      return {
        result: parseTranslate(call.text),
        tokens_in: call.tokens_in,
        tokens_out: call.tokens_out,
        cache_read_tokens: call.cache_read_tokens,
        cache_write_tokens: call.cache_write_tokens,
      };
    },
  });

  if (!result.ok) return { ok: false, translated_locales: [], degraded: true };

  const merged = { ...existing, ...result.data.translations };
  await admin.from("announcements").update({ body_translated: merged }).eq("id", opts.announcement_id);

  return { ok: true, translated_locales: Object.keys(result.data.translations) };
}
