import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_HAIKU } from "./models";
import {
  SENTIMENT_SYSTEM,
  buildSentimentUser,
  type SentimentUserInput,
} from "./prompts/sentiment";
import { runAI } from "./actions-logger";

export type SentimentResult = {
  sentiment: "positive" | "neutral" | "negative";
  themes: string[];
  confidence: number;
};

const FALLBACK: SentimentResult = {
  sentiment: "neutral",
  themes: [],
  confidence: 0,
};

function parseSentiment(text: string): SentimentResult {
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    const sentiment = ["positive", "neutral", "negative"].includes(obj.sentiment)
      ? (obj.sentiment as SentimentResult["sentiment"])
      : "neutral";
    return {
      sentiment,
      themes: Array.isArray(obj.themes)
        ? obj.themes
            .filter((x: unknown): x is string => typeof x === "string")
            .map((t: string) => t.trim().toLowerCase())
            .filter((t: string) => t.length > 0)
            .slice(0, 3)
        : [],
      confidence:
        typeof obj.confidence === "number"
          ? Math.max(0, Math.min(1, obj.confidence))
          : 0,
    };
  } catch {
    return FALLBACK;
  }
}

export async function analyzeSentiment(opts: {
  tenant_id: string;
  actor_id: string | null;
  related_entity_type?: string;
  related_entity_id?: string;
  input: SentimentUserInput;
}): Promise<SentimentResult & { degraded: boolean }> {
  const c = getAnthropic();
  if (!c.ok) return { ...FALLBACK, degraded: true };

  const userPrompt = buildSentimentUser(opts.input);
  const r = await runAI<SentimentResult>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "sentiment",
    model: MODEL_HAIKU,
    prompt: SENTIMENT_SYSTEM + "\n" + userPrompt,
    related_entity_type: opts.related_entity_type,
    related_entity_id: opts.related_entity_id,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_HAIKU,
        system: SENTIMENT_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 200,
        temperature: 0,
      });
      return {
        result: parseSentiment(call.text),
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
