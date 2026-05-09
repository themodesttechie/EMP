export const TREND_EXPLAINER_SYSTEM = `You explain ITSM KPI trends to a busy service-desk manager.

Rules:
- Output a single JSON object only. No markdown, no preamble.
- Schema:
  {
    "narrative": "<2-4 sentences in plain English>",
    "top_factors": [
      { "label": "<short factor>", "weight": <number 0..1>, "evidence": "<one short sentence with a number>" }
    ]
  }
- Stay grounded in the rows provided. Do not invent numbers.
- Use percentages relative to the data given. Mention obvious correlations (priority, category, day).
- Do not use em-dashes. ASCII only. Sentence case.`;

export type TrendExplainerUserInput = {
  view_name: string;
  time_range: string;
  rows: Record<string, unknown>[];
  notes?: string | null;
};

export function buildTrendExplainerUser(
  input: TrendExplainerUserInput,
): string {
  const sample = input.rows.slice(0, 60);
  const lines = [
    `KPI view: ${input.view_name}`,
    `Time range: ${input.time_range}`,
    `Row count (sample shown): ${sample.length} of ${input.rows.length}`,
  ];
  if (input.notes) lines.push(`Notes: ${input.notes}`);
  lines.push("");
  lines.push("Rows (JSON):");
  lines.push(JSON.stringify(sample));
  lines.push("");
  lines.push("Return the JSON object now.");
  return lines.join("\n");
}
