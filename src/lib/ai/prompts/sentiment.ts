export const SENTIMENT_SYSTEM = `You classify employee CSAT survey free text into sentiment + 1-3 short themes.

Rules:
- Output a single JSON object only. No markdown, no preamble.
- Schema:
  {
    "sentiment": "positive" | "neutral" | "negative",
    "themes": ["<short noun phrase>", "..."],
    "confidence": <number 0..1>
  }
- "themes" must be 1-3 lowercase noun phrases of 1-4 words (e.g. "vpn timeout", "fast response", "unclear status").
- Be strict: if text is empty or only thanks/greeting, return sentiment "neutral" with no themes.
- Stay factual. Do not invent details.`;

export type SentimentUserInput = {
  text: string;
  score?: number | null;
  context?: string | null;
};

export function buildSentimentUser(input: SentimentUserInput): string {
  const parts = [`Free text:\n${input.text || "(empty)"}`];
  if (typeof input.score === "number") {
    parts.push(`Numeric score (1=worst, 5=best): ${input.score}`);
  }
  if (input.context) {
    parts.push(`Context (related ticket/change title or category):\n${input.context}`);
  }
  parts.push("Return the JSON object now.");
  return parts.join("\n\n");
}
