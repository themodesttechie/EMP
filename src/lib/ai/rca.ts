import "server-only";
import { callClaude, getAnthropic } from "./client";
import { MODEL_SONNET } from "./models";
import { RCA_SYSTEM, buildRcaUser, type RcaUserInput } from "./prompts/rca";
import { runAI } from "./actions-logger";
import { createAdminClient } from "@/lib/supabase/server";

export type RcaResult = {
  root_cause: string;
  confidence: number;
  reasoning: string;
  supporting_incidents: string[];
};

const FALLBACK: RcaResult = {
  root_cause: "",
  confidence: 0,
  reasoning: "no_ai_available",
  supporting_incidents: [],
};

function parseRca(text: string): RcaResult {
  const cleaned = text.replace(/^```json|```$/g, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    return {
      root_cause: typeof obj.root_cause === "string" ? obj.root_cause : "",
      confidence:
        typeof obj.confidence === "number"
          ? Math.max(0, Math.min(1, obj.confidence))
          : 0,
      reasoning: typeof obj.reasoning === "string" ? obj.reasoning : "",
      supporting_incidents: Array.isArray(obj.supporting_incidents)
        ? obj.supporting_incidents.filter((x: unknown): x is string => typeof x === "string")
        : [],
    };
  } catch {
    return FALLBACK;
  }
}

export async function proposeRootCause(opts: {
  tenant_id: string;
  actor_id: string | null;
  problem_id: string;
}): Promise<RcaResult & { degraded: boolean }> {
  const c = getAnthropic();
  if (!c.ok) return { ...FALLBACK, degraded: true };

  const admin = createAdminClient();

  // Fetch problem
  const { data: problemRow } = await admin
    .from("problems")
    .select("id, number, title, description")
    .eq("id", opts.problem_id)
    .maybeSingle();
  const problem = problemRow as
    | { id: string; number: string; title: string; description: string | null }
    | null;
  if (!problem) return { ...FALLBACK, degraded: true };

  // Fetch linked incident IDs
  const { data: linkRows } = await admin
    .from("problem_incident_links")
    .select("ticket_id")
    .eq("problem_id", opts.problem_id);
  const ticketIds = ((linkRows ?? []) as Array<{ ticket_id: string }>).map(
    (r) => r.ticket_id,
  );

  // Fetch incidents + comments (capped to keep token cost bounded)
  type IncRow = {
    id: string;
    number: string;
    title: string;
    description: string | null;
  };
  let incidents: IncRow[] = [];
  if (ticketIds.length > 0) {
    const { data } = await admin
      .from("tickets")
      .select("id, number, title, description")
      .in("id", ticketIds)
      .limit(15);
    incidents = (data ?? []) as IncRow[];
  }

  const incidentsForPrompt: RcaUserInput["incidents"] = [];
  for (const inc of incidents) {
    const { data: comments } = await admin
      .from("ticket_comments")
      .select("body, created_at, author:profiles(full_name, email)")
      .eq("ticket_id", inc.id)
      .order("created_at")
      .limit(20);
    type CRow = {
      body: string;
      created_at: string;
      author?:
        | { full_name?: string | null; email?: string }
        | { full_name?: string | null; email?: string }[]
        | null;
    };
    const flat = ((comments ?? []) as CRow[]).map((c) => {
      const a = Array.isArray(c.author) ? c.author[0] : c.author;
      return {
        author: a?.full_name || a?.email || "system",
        body: c.body,
        created_at: c.created_at,
      };
    });
    incidentsForPrompt.push({
      number: inc.number,
      title: inc.title,
      description: inc.description,
      comments: flat,
    });
  }

  const userPrompt = buildRcaUser({
    problem_number: problem.number,
    problem_title: problem.title,
    problem_description: problem.description,
    incidents: incidentsForPrompt,
  });

  const r = await runAI<RcaResult>({
    tenant_id: opts.tenant_id,
    actor_id: opts.actor_id,
    flow: "rca",
    model: MODEL_SONNET,
    prompt: RCA_SYSTEM + "\n" + userPrompt,
    related_entity_type: "problem",
    related_entity_id: opts.problem_id,
    fn: async () => {
      const call = await callClaude({
        model: MODEL_SONNET,
        system: RCA_SYSTEM,
        user: userPrompt,
        cache_system: true,
        max_tokens: 800,
        temperature: 0.2,
      });
      return {
        result: parseRca(call.text),
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
