import "server-only";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type {
  CsatWeekRow,
  Survey,
  SurveyResponse,
  SurveyTrigger,
  ThemeFrequency,
} from "./types";

const SURVEY_COLS =
  "id, tenant_id, slug, name, description, trigger, questions, active, created_by, created_at, updated_at";

const RESPONSE_COLS =
  "id, tenant_id, survey_id, respondent_id, related_type, related_id, score, answers, comments, ai_sentiment, ai_themes, ai_confidence, ai_processed_at, submitted_at, created_at";

export async function listSurveys(opts?: {
  active_only?: boolean;
}): Promise<Survey[]> {
  const supabase = await createClient();
  let q = supabase.from("surveys").select(SURVEY_COLS).order("created_at", {
    ascending: false,
  });
  if (opts?.active_only) q = q.eq("active", true);
  const { data } = await q;
  return (data ?? []) as Survey[];
}

export async function getSurvey(id: string): Promise<Survey | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("surveys")
    .select(SURVEY_COLS)
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as Survey | null;
}

export async function getSurveyBySlug(
  tenant_id: string,
  slug: string,
): Promise<Survey | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("surveys")
    .select(SURVEY_COLS)
    .eq("tenant_id", tenant_id)
    .eq("slug", slug)
    .maybeSingle();
  return (data ?? null) as Survey | null;
}

export async function getSurveyForTrigger(
  tenant_id: string,
  trigger: SurveyTrigger,
): Promise<Survey | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("surveys")
    .select(SURVEY_COLS)
    .eq("tenant_id", tenant_id)
    .eq("trigger", trigger)
    .eq("active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data ?? null) as Survey | null;
}

export async function listResponses(filters?: {
  survey_id?: string;
  respondent_id?: string;
  sentiment?: string;
  since?: string;
  submitted_only?: boolean;
}): Promise<SurveyResponse[]> {
  const supabase = await createClient();
  let q = supabase
    .from("survey_responses")
    .select(RESPONSE_COLS)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(500);
  if (filters?.survey_id) q = q.eq("survey_id", filters.survey_id);
  if (filters?.respondent_id) q = q.eq("respondent_id", filters.respondent_id);
  if (filters?.sentiment) q = q.eq("ai_sentiment", filters.sentiment);
  if (filters?.since) q = q.gte("submitted_at", filters.since);
  if (filters?.submitted_only) q = q.not("submitted_at", "is", null);
  const { data } = await q;
  return (data ?? []) as SurveyResponse[];
}

export async function getResponse(id: string): Promise<SurveyResponse | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("survey_responses")
    .select(RESPONSE_COLS)
    .eq("id", id)
    .maybeSingle();
  return (data ?? null) as SurveyResponse | null;
}

export async function getPendingForRespondent(
  respondent_id: string,
): Promise<SurveyResponse[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("survey_responses")
    .select(RESPONSE_COLS)
    .eq("respondent_id", respondent_id)
    .is("submitted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as SurveyResponse[];
}

export async function getSubmittedHistoryForRespondent(
  respondent_id: string,
): Promise<SurveyResponse[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("survey_responses")
    .select(RESPONSE_COLS)
    .eq("respondent_id", respondent_id)
    .not("submitted_at", "is", null)
    .order("submitted_at", { ascending: false })
    .limit(100);
  return (data ?? []) as SurveyResponse[];
}

export async function getCsatTrend(weeks = 12): Promise<CsatWeekRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_csat_trend")
    .select("*")
    .order("week", { ascending: true })
    .limit(weeks);
  return (data ?? []) as CsatWeekRow[];
}

export async function getThemes(opts?: {
  since?: string;
  limit?: number;
}): Promise<ThemeFrequency[]> {
  const supabase = await createClient();
  let q = supabase
    .from("survey_responses")
    .select("ai_themes, submitted_at")
    .not("ai_themes", "is", null);
  if (opts?.since) q = q.gte("submitted_at", opts.since);
  q = q.order("submitted_at", { ascending: false }).limit(500);
  const { data } = await q;

  const counts = new Map<string, number>();
  for (const row of (data ?? []) as Array<{ ai_themes: string[] | null }>) {
    for (const t of row.ai_themes ?? []) {
      const norm = t.trim().toLowerCase();
      if (!norm) continue;
      counts.set(norm, (counts.get(norm) ?? 0) + 1);
    }
  }
  const out: ThemeFrequency[] = Array.from(counts, ([theme, count]) => ({
    theme,
    count,
  }));
  out.sort((a, b) => b.count - a.count);
  return out.slice(0, opts?.limit ?? 25);
}

export async function getResponseAggregates(survey_id: string): Promise<{
  total: number;
  submitted: number;
  avg_score: number | null;
  positive: number;
  neutral: number;
  negative: number;
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("survey_responses")
    .select("score, ai_sentiment, submitted_at")
    .eq("survey_id", survey_id);
  const rows = (data ?? []) as Array<{
    score: number | null;
    ai_sentiment: string | null;
    submitted_at: string | null;
  }>;
  const submitted = rows.filter((r) => r.submitted_at);
  const scored = submitted.filter((r) => typeof r.score === "number");
  const avg =
    scored.length === 0
      ? null
      : scored.reduce((a, r) => a + (r.score ?? 0), 0) / scored.length;
  return {
    total: rows.length,
    submitted: submitted.length,
    avg_score: avg,
    positive: submitted.filter((r) => r.ai_sentiment === "positive").length,
    neutral: submitted.filter((r) => r.ai_sentiment === "neutral").length,
    negative: submitted.filter((r) => r.ai_sentiment === "negative").length,
  };
}
