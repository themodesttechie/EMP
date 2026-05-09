import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_SONNET } from "./models";
import {
  TREND_EXPLAINER_SYSTEM,
  buildTrendExplainerUser,
} from "./prompts/trend-explainer";
import { runAI } from "./actions-logger";

export type TrendFactor = {
  label: string;
  weight: number;
  evidence: string;
};

export type TrendExplainerResult = {
  narrative: string;
  top_factors: TrendFactor[];
};

const FALLBACK: TrendExplainerResult = {
  narrative: "AI explainer unavailable.",
  top_factors: [],
};

function parseTrend(text: string): TrendExplainerResult {
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    const factors: TrendFactor[] = Array.isArray(obj.top_factors)
      ? obj.top_factors
          .filter(
            (f: unknown): f is Record<string, unknown> =>
              !!f && typeof f === "object",
          )
          .map((f: Record<string, unknown>) => ({
            label: typeof f.label === "string" ? f.label : "",
            weight:
              typeof f.weight === "number"
                ? Math.max(0, Math.min(1, f.weight))
                : 0,
            evidence: typeof f.evidence === "string" ? f.evidence : "",
          }))
          .filter((f: TrendFactor) => f.label.length > 0)
          .slice(0, 5)
      : [];
    return {
      narrative: typeof obj.narrative === "string" ? obj.narrative : "",
      top_factors: factors,
    };
  } catch {
    return FALLBACK;
  }
}

export async function explainTrend(opts: {
  tenant_id: string;
  actor_id: string | null;
  view_name: string;
  time_range: string;
  rows: Record<string, unknown>[];
  notes?: string | null;
}): Promise<TrendExplainerResult & { degraded: boolean }> {
  const c = getAnthropic();
  if (!c.ok) return { ...FALLBACK, degraded: true };
  if (!opts.rows.length) {
    return { narrative: "No data in this time range.", top_factors: [], degraded: false };
  }

  const userPrompt = buildTrendExplainerUser({
    view_name: opts.view_name,
    time_range: opts.time_range,
    rows: opts.rows,
    notes: opts.notes ?? null,
  });

  const r = await runAI<TrendExplainerResult>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "trend_explain",
    model: MODEL_SONNET,
    prompt: TREND_EXPLAINER_SYSTEM + "\n" + userPrompt,
    related_entity_type: "report",
    related_entity_id: opts.view_name,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_SONNET,
        system: TREND_EXPLAINER_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 700,
        temperature: 0.2,
      });
      return {
        result: parseTrend(call.text),
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
