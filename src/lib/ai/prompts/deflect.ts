// Self-service deflection: pick top KB-like candidates from a stub corpus before
// pgvector lands in Sprint 6. Currently used for prompt structure only — actual
// candidate retrieval is text search in deflect.ts.
export const DEFLECT_SYSTEM = `You suggest existing knowledge base articles before a user opens a support ticket.

Rules:
- Return a single JSON object only.
- Schema:
  {
    "matches": [{ "id": "<id>", "title": "<title>", "score": <0..1> }],
    "confidence": <0..1>
  }
- Only return candidates from the provided list. Never invent ids or titles.
- If nothing fits, return matches: [] and confidence: 0.`;

export type DeflectUserInput = {
  draft_text: string;
  candidates: { id: string; title: string; snippet: string }[];
};

export function buildDeflectUser(input: DeflectUserInput): string {
  const cands = input.candidates
    .map((c) => `- id=${c.id} | title=${c.title}\n  snippet: ${c.snippet}`)
    .join("\n");
  return `Draft ticket text:
${input.draft_text}

Candidate articles:
${cands}

Return the JSON object with the most relevant matches.`;
}
