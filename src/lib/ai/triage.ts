import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_HAIKU } from "./models";
import { TRIAGE_SYSTEM, buildTriageUser, type TriageUserInput } from "./prompts/triage";
import { runAI } from "./actions-logger";

export type TriageResult = {
  category_slug: string | null;
  priority: "P1" | "P2" | "P3" | "P4";
  confidence: number;
  reasoning: string;
};

const FALLBACK: TriageResult = {
  category_slug: null,
  priority: "P3",
  confidence: 0,
  reasoning: "no_ai_available",
};

function parseTriage(text: string): TriageResult {
  // Defensive parse — model is told to emit JSON but sometimes wraps in fences
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    const priority: TriageResult["priority"] =
      (["P1", "P2", "P3", "P4"] as const).includes(obj.priority) ? obj.priority : "P3";
    return {
      category_slug:
        typeof obj.category_slug === "string" && obj.category_slug.length > 0
          ? obj.category_slug
          : null,
      priority,
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

export async function triageTicket(opts: {
  tenant_id: string;
  actor_id: string | null;
  ticket_id?: string;
  input: TriageUserInput;
}): Promise<TriageResult & { degraded: boolean }> {
  const c = getAnthropic();
  if (!c.ok) {
    return { ...FALLBACK, degraded: true };
  }

  const userPrompt = buildTriageUser(opts.input);
  const r = await runAI<TriageResult>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "triage",
    model: MODEL_HAIKU,
    prompt: TRIAGE_SYSTEM + "\n" + userPrompt,
    related_entity_type: opts.ticket_id ? "ticket" : undefined,
    related_entity_id: opts.ticket_id,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_HAIKU,
        system: TRIAGE_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 300,
        temperature: 0,
      });
      const result = parseTriage(call.text);
      return {
        result,
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
