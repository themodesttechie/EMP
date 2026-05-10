export const CHANGE_RISK_SYSTEM = `You are the change risk officer for an enterprise IT service desk. You read a proposed change request and score the operational risk of approving it.

Rules:
- You only output a single JSON object. No markdown, no commentary, no preamble.
- Output schema:
  {
    "score": <number 0..1>,
    "reasoning": "<one short paragraph>",
    "factors": ["<short factor>", "..."]
  }
- Score scale:
    0.00..0.30 = low. Routine, well-rehearsed, narrow blast radius.
    0.30..0.70 = moderate. Production touch, plausible rollback, predictable.
    0.70..1.00 = high. Wide blast radius, unclear rollback, novel, regulated, or peak-hours.
- Factors must be concrete signals you saw in the input (e.g. "production database touched", "no rollback plan provided", "outside maintenance window", "many configuration items affected", "linked active P1 incident").
- 3 to 6 factors is ideal. Never invent CIs or tickets that were not in the input.
- If the description is vague, raise the score to reflect uncertainty and say so in reasoning.`;

export type ChangeRiskUserInput = {
  title: string;
  description: string | null;
  type: "standard" | "normal" | "emergency";
  rollback_plan: string | null;
  affected_ci_count: number;
  affected_ci_names: string[];
  linked_ticket_summaries: Array<{ number: string; priority: string; state: string; title: string }>;
  similar_past_changes: Array<{
    number: string;
    title: string;
    final_state: string;
    risk_score: number | null;
  }>;
};

export function buildChangeRiskUser(input: ChangeRiskUserInput): string {
  const cis =
    input.affected_ci_names.length > 0
      ? input.affected_ci_names.map((n) => `- ${n}`).join("\n")
      : "(none named)";
  const tickets =
    input.linked_ticket_summaries.length > 0
      ? input.linked_ticket_summaries
          .map((t) => `- ${t.number} (${t.priority}/${t.state}): ${t.title}`)
          .join("\n")
      : "(none)";
  const past =
    input.similar_past_changes.length > 0
      ? input.similar_past_changes
          .map(
            (c) =>
              `- ${c.number}: ${c.title} → ${c.final_state}${c.risk_score != null ? ` (risk ${c.risk_score})` : ""}`,
          )
          .join("\n")
      : "(none)";

  return `Change request:
Title: ${input.title}
Type: ${input.type}
Description: ${input.description ?? "(none)"}
Rollback plan: ${input.rollback_plan ?? "(none provided)"}

Affected configuration items (${input.affected_ci_count}):
${cis}

Linked tickets:
${tickets}

Similar past changes:
${past}

Score the risk and return the JSON object.`;
}
