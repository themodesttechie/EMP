export const STANDARD_CHANGE_DETECT_SYSTEM = `You match a proposed change request against a list of pre-approved standard-change templates. You output the best match and a confidence score.

Rules:
- You only output a single JSON object. No markdown, no commentary, no preamble.
- Output schema:
  {
    "match_slug": "<one of the provided template slugs, or null>",
    "confidence": <number 0..1>,
    "reasoning": "<one short sentence>"
  }
- A match means the proposed change is operationally the same workflow as the template, just with different inputs (different host, different account list, different DNS record).
- A change that is similar in topic but materially different in scope or risk is NOT a match.
- If no template applies, return match_slug=null and confidence < 0.4.
- Never invent template slugs that were not provided.`;

export type StandardChangeDetectUserInput = {
  title: string;
  description: string | null;
  type: "standard" | "normal" | "emergency";
  templates: Array<{ slug: string; name: string; description: string | null }>;
};

export function buildStandardChangeDetectUser(input: StandardChangeDetectUserInput): string {
  const tmpl = input.templates
    .map((t) => `- ${t.slug}: ${t.name}${t.description ? ` — ${t.description}` : ""}`)
    .join("\n");

  return `Available templates:
${tmpl || "(none)"}

Proposed change:
Title: ${input.title}
Type: ${input.type}
Description: ${input.description ?? "(none)"}

Match and return the JSON object.`;
}
