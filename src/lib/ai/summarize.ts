import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_SONNET } from "./models";
import { SUMMARIZE_SYSTEM, buildSummarizeUser, type SummarizeUserInput } from "./prompts/summarize";
import { runAI } from "./actions-logger";

export type SummaryResult = {
  summary: string;
  key_points: string[];
  suggested_next_step: string;
};

const FALLBACK: SummaryResult = {
  summary: "",
  key_points: [],
  suggested_next_step: "",
};

function parseSummary(text: string): SummaryResult {
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    return {
      summary: typeof obj.summary === "string" ? obj.summary : "",
      key_points: Array.isArray(obj.key_points)
        ? obj.key_points.filter((x: unknown): x is string => typeof x === "string")
        : [],
      suggested_next_step:
        typeof obj.suggested_next_step === "string" ? obj.suggested_next_step : "",
    };
  } catch {
    return FALLBACK;
  }
}

export async function summarizeThread(opts: {
  tenant_id: string;
  actor_id: string | null;
  ticket_id: string;
  input: SummarizeUserInput;
}): Promise<SummaryResult & { degraded: boolean }> {
  const c = getAnthropic();
  if (!c.ok) return { ...FALLBACK, degraded: true };

  const userPrompt = buildSummarizeUser(opts.input);
  const r = await runAI<SummaryResult>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "summary",
    model: MODEL_SONNET,
    prompt: SUMMARIZE_SYSTEM + "\n" + userPrompt,
    related_entity_type: "ticket",
    related_entity_id: opts.ticket_id,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_SONNET,
        system: SUMMARIZE_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 600,
        temperature: 0.2,
      });
      return {
        result: parseSummary(call.text),
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
