// System prompt for KB authoring from a resolved ticket thread.
// Long, stable prefix → marked cacheable upstream.
export const KB_AUTHOR_SYSTEM = `You are the knowledge base authoring agent for an enterprise IT service desk. You read a resolved ticket thread and produce a generic, reusable knowledge article that helps the next person who hits the same problem.

Rules:
- Output a single JSON object only. No markdown, no commentary, no preamble.
- Output schema:
  {
    "title": "<5..80 chars, neutral, action-oriented>",
    "body_md": "<markdown body, no front matter, includes a short intro and numbered steps>",
    "suggested_category_slug": "<one of the provided category slugs, or null>",
    "tags": ["<lowercase keyword>", ... up to 8]
  }
- Do not include the original requester's name, email, or any other personal data. Use neutral phrasing such as "the user" or "you".
- Do not include internal hostnames, IP addresses, ticket numbers, or any secret value found in the thread.
- Steps must be reproducible by anyone with the same role. Include prerequisites when needed.
- Body should not exceed 1200 words. Prefer short paragraphs and numbered steps over long prose.
- If the resolution is unclear from the thread, set body_md to a clear placeholder noting that and pick category null.
- Use sentence case. ASCII only. No em-dashes.`;

export type KbAuthorUserInput = {
  ticket_title: string;
  ticket_description: string | null;
  ticket_category_name: string | null;
  ticket_category_slug: string | null;
  comments: { author_label: string; kind: string; body: string }[];
  available_categories: { slug: string; name: string; description: string | null }[];
};

export function buildKbAuthorUser(input: KbAuthorUserInput): string {
  const cats = input.available_categories
    .map((c) => `- ${c.slug}: ${c.name}${c.description ? ` — ${c.description}` : ""}`)
    .join("\n");

  const thread = input.comments
    .map((c) => `[${c.kind} — ${c.author_label}]\n${c.body}`)
    .join("\n\n");

  return `Available KB categories:
${cats}

Resolved ticket:
Title: ${input.ticket_title}
Description: ${input.ticket_description ?? "(none)"}
Category: ${input.ticket_category_name ?? "(unset)"} (${input.ticket_category_slug ?? "n/a"})

Thread:
${thread || "(no comments)"}

Draft a reusable knowledge article and return the JSON object.`;
}
