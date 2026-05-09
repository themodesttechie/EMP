import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_SONNET } from "./models";
import {
  CHANGE_RISK_SYSTEM,
  buildChangeRiskUser,
  type ChangeRiskUserInput,
} from "./prompts/change-risk";
import { runAI } from "./actions-logger";

export type ChangeRiskResult = {
  score: number;
  reasoning: string;
  factors: string[];
};

const FALLBACK: ChangeRiskResult = {
  score: 0.5,
  reasoning: "AI risk scoring unavailable; default neutral score.",
  factors: [],
};

function parseRisk(text: string): ChangeRiskResult {
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    const score =
      typeof obj.score === "number" ? Math.max(0, Math.min(1, obj.score)) : 0.5;
    const reasoning = typeof obj.reasoning === "string" ? obj.reasoning : "";
    const factors = Array.isArray(obj.factors)
      ? obj.factors.filter((x: unknown): x is string => typeof x === "string").slice(0, 8)
      : [];
    return { score: Number(score.toFixed(3)), reasoning, factors };
  } catch {
    return FALLBACK;
  }
}

export async function scoreChangeRisk(opts: {
  tenant_id: string;
  actor_id: string | null;
  change_id?: string;
  input: ChangeRiskUserInput;
}): Promise<ChangeRiskResult & { degraded: boolean; model: string }> {
  const c = getAnthropic();
  if (!c.ok) return { ...FALLBACK, degraded: true, model: MODEL_SONNET };

  const userPrompt = buildChangeRiskUser(opts.input);
  const r = await runAI<ChangeRiskResult>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "risk_score",
    model: MODEL_SONNET,
    prompt: CHANGE_RISK_SYSTEM + "\n" + userPrompt,
    related_entity_type: opts.change_id ? "change" : undefined,
    related_entity_id: opts.change_id,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_SONNET,
        system: CHANGE_RISK_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 600,
        temperature: 0.2,
      });
      return {
        result: parseRisk(call.text),
        tokens_in: call.tokens_in,
        tokens_out: call.tokens_out,
        cache_read_tokens: call.cache_read_tokens,
        cache_write_tokens: call.cache_write_tokens,
      };
    },
  });

  if (!r.ok) return { ...FALLBACK, degraded: true, model: MODEL_SONNET };
  return { ...r.data, degraded: false, model: MODEL_SONNET };
}
