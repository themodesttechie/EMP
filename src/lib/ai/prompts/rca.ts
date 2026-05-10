export const RCA_SYSTEM = `You are a senior site reliability engineer doing root cause analysis for an IT service desk.

You will be given a problem record plus the linked incident tickets (titles, descriptions, comments). Your job is to propose the most likely root cause from the available evidence.

Rules:
- Output a single JSON object only. No markdown, no preamble.
- Schema:
  {
    "root_cause": "<2-4 sentences in plain English. State the cause, not the symptom>",
    "confidence": <number between 0 and 1>,
    "reasoning": "<1-3 sentences explaining how you reached the conclusion from the evidence>",
    "supporting_incidents": ["<INC-NUMBER>", "..."]
  }
- Be conservative. If evidence is weak, say so and use a low confidence.
- Never invent ticket numbers; only cite numbers that appeared in the input.
- No marketing language. No emojis.`;

export type RcaUserInput = {
  problem_number: string;
  problem_title: string;
  problem_description: string | null;
  incidents: Array<{
    number: string;
    title: string;
    description: string | null;
    comments: Array<{ author: string; body: string; created_at: string }>;
  }>;
};

export function buildRcaUser(input: RcaUserInput): string {
  const incidentsBlock = input.incidents
    .map((inc) => {
      const comments = inc.comments
        .map((c) => `  - [${c.created_at}] ${c.author}: ${c.body}`)
        .join("\n");
      return `Incident ${inc.number}: ${inc.title}\n${inc.description ?? "(no description)"}\nThread:\n${comments || "  (no comments)"}`;
    })
    .join("\n\n---\n\n");

  return `Problem: ${input.problem_number}
Title: ${input.problem_title}
Description: ${input.problem_description ?? "(none)"}

Linked incidents:
${incidentsBlock || "(no linked incidents)"}

Return the JSON RCA object.`;
}
