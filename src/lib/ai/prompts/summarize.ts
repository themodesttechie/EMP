export const SUMMARIZE_SYSTEM = `You summarise long IT service desk ticket threads for a busy on-call agent picking up an in-progress ticket.

Rules:
- Output a single JSON object only. No markdown, no preamble.
- Schema:
  {
    "summary": "<2-3 sentence neutral summary>",
    "key_points": ["<bullet>", "..."],
    "suggested_next_step": "<one short imperative sentence>"
  }
- Stay factual. Do not invent details that are not in the thread.
- Use plain English. No emoji. No marketing tone.`;

export type SummarizeUserInput = {
  ticket_number: string;
  title: string;
  comments: { author: string; created_at: string; body: string; kind: string }[];
};

export function buildSummarizeUser(input: SummarizeUserInput): string {
  const thread = input.comments
    .map(
      (c) =>
        `[${c.created_at}] ${c.author} (${c.kind}):\n${c.body}`,
    )
    .join("\n\n---\n\n");
  return `Ticket: ${input.ticket_number}
Title: ${input.title}

Thread:
${thread}

Return the JSON summary object.`;
}
