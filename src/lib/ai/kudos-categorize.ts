import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_HAIKU } from "./models";
import { runAI } from "./actions-logger";
import { KUDOS_CATEGORIZE_SYSTEM, buildKudosCategorizeUser } from "./prompts/kudos-categorize";
import { KUDOS_CATEGORIES, type KudosCategory } from "@/lib/workplace/kudos";

export type CategorizeKudosResult = {
  value: KudosCategory | null;
  confidence: number;
  degraded: boolean;
};

function parseCat(text: string): { category: KudosCategory; confidence: number } {
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    const cat = (KUDOS_CATEGORIES as readonly string[]).includes(obj.category)
      ? (obj.category as KudosCategory)
      : "other";
    const conf = typeof obj.confidence === "number" ? Math.max(0, Math.min(1, obj.confidence)) : 0;
    return { category: cat, confidence: conf };
  } catch {
    return { category: "other", confidence: 0 };
  }
}

export async function categorizeKudos(opts: {
  tenant_id: string;
  actor_id: string | null;
  message: string;
}): Promise<CategorizeKudosResult> {
  const c = getAnthropic();
  if (!c.ok) return { value: null, confidence: 0, degraded: true };

  const userPrompt = buildKudosCategorizeUser(opts.message);
  const result = await runAI<{ category: KudosCategory; confidence: number }>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "kudos_categorize",
    model: MODEL_HAIKU,
    prompt: KUDOS_CATEGORIZE_SYSTEM + "\n" + userPrompt,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_HAIKU,
        system: KUDOS_CATEGORIZE_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 100,
        temperature: 0,
      });
      return {
        result: parseCat(call.text),
        tokens_in: call.tokens_in,
        tokens_out: call.tokens_out,
        cache_read_tokens: call.cache_read_tokens,
        cache_write_tokens: call.cache_write_tokens,
      };
    },
  });

  if (!result.ok) return { value: null, confidence: 0, degraded: true };
  return { value: result.data.category, confidence: result.data.confidence, degraded: false };
}
