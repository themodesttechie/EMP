import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_HAIKU } from "./models";
import {
  STANDARD_CHANGE_DETECT_SYSTEM,
  buildStandardChangeDetectUser,
  type StandardChangeDetectUserInput,
} from "./prompts/standard-change-detect";
import { runAI } from "./actions-logger";

export type StandardChangeMatchResult = {
  match_slug: string | null;
  confidence: number;
  reasoning: string;
};

const FALLBACK: StandardChangeMatchResult = {
  match_slug: null,
  confidence: 0,
  reasoning: "no_ai_available",
};

const AUTO_APPROVE_CONFIDENCE = 0.85;

function parseMatch(text: string): StandardChangeMatchResult {
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    return {
      match_slug:
        typeof obj.match_slug === "string" && obj.match_slug.length > 0
          ? obj.match_slug
          : null,
      confidence:
        typeof obj.confidence === "number"
          ? Math.max(0, Math.min(1, obj.confidence))
          : 0,
      reasoning: typeof obj.reasoning === "string" ? obj.reasoning : "",
    };
  } catch {
    return FALLBACK;
  }
}

export async function detectStandardChangeMatch(opts: {
  tenant_id: string;
  actor_id: string | null;
  change_id?: string;
  input: StandardChangeDetectUserInput;
}): Promise<StandardChangeMatchResult & { degraded: boolean; auto_approve_recommended: boolean; model: string }> {
  const c = getAnthropic();
  if (!c.ok) {
    return { ...FALLBACK, degraded: true, auto_approve_recommended: false, model: MODEL_HAIKU };
  }
  if (opts.input.templates.length === 0) {
    return { ...FALLBACK, degraded: false, auto_approve_recommended: false, model: MODEL_HAIKU };
  }

  const userPrompt = buildStandardChangeDetectUser(opts.input);
  const r = await runAI<StandardChangeMatchResult>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "other",
    model: MODEL_HAIKU,
    prompt: STANDARD_CHANGE_DETECT_SYSTEM + "\n" + userPrompt,
    related_entity_type: opts.change_id ? "change" : undefined,
    related_entity_id: opts.change_id,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_HAIKU,
        system: STANDARD_CHANGE_DETECT_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 250,
        temperature: 0,
      });
      return {
        result: parseMatch(call.text),
        tokens_in: call.tokens_in,
        tokens_out: call.tokens_out,
        cache_read_tokens: call.cache_read_tokens,
        cache_write_tokens: call.cache_write_tokens,
      };
    },
  });

  if (!r.ok) {
    return { ...FALLBACK, degraded: true, auto_approve_recommended: false, model: MODEL_HAIKU };
  }
  const auto_approve_recommended =
    r.data.match_slug !== null && r.data.confidence >= AUTO_APPROVE_CONFIDENCE;
  return { ...r.data, degraded: false, auto_approve_recommended, model: MODEL_HAIKU };
}

export { AUTO_APPROVE_CONFIDENCE };
