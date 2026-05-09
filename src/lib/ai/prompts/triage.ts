// System prompt for incident triage classification.
// Long, stable prefix → marked cacheable upstream.
export const TRIAGE_SYSTEM = `You are the triage agent for an enterprise IT service desk. You classify newly-created incident tickets so the right team picks them up first.

Rules:
- You only output a single JSON object. No markdown, no commentary, no preamble.
- Output schema:
  {
    "category_slug": "<one of the provided category slugs, or null>",
    "priority": "P1" | "P2" | "P3" | "P4",
    "confidence": <number 0..1>,
    "reasoning": "<one short sentence>"
  }
- Priority guide:
    P1 = full outage, business-critical impact (multiple users blocked, security breach, data loss).
    P2 = significant degradation or single-user blocker for a critical role.
    P3 = standard issue, user can continue working with a workaround.
    P4 = informational, request for tweak or low-impact tidy-up.
- If the description is too vague to choose a category, set category_slug to null and confidence < 0.5.
- Default priority for ambiguous tickets is P3.
- You never invent category slugs that were not provided.`;

export type TriageUserInput = {
  title: string;
  description: string | null;
  available_categories: { slug: string; name: string; description: string | null }[];
};

export function buildTriageUser(input: TriageUserInput): string {
  const cats = input.available_categories
    .map((c) => `- ${c.slug}: ${c.name}${c.description ? ` — ${c.description}` : ""}`)
    .join("\n");

  return `Available categories:
${cats}

New ticket:
Title: ${input.title}
Description: ${input.description ?? "(none)"}

Classify and return the JSON object.`;
}
