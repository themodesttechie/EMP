"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { logAction } from "@/lib/audit/logger";
import { logActionNoRequest } from "@/lib/audit/logger";
import { analyzeSentiment } from "@/lib/ai/sentiment";
import { createNotification } from "@/lib/notifications/actions";
import { getSurvey, getSurveyForTrigger } from "./queries";
import type {
  Survey,
  SurveyQuestion,
  SurveyRelatedType,
  SurveyTrigger,
} from "./types";

export type ActionResult<T = unknown> = {
  ok?: boolean;
  error?: string;
  data?: T;
};

const VALID_TYPES: SurveyQuestion["type"][] = ["rating", "text", "choice"];
const VALID_TRIGGERS: SurveyTrigger[] = [
  "post_incident_resolved",
  "post_change_done",
  "scheduled",
  "manual",
];

function sanitiseString(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function validateQuestions(input: unknown): SurveyQuestion[] {
  if (!Array.isArray(input)) return [];
  const out: SurveyQuestion[] = [];
  for (const q of input) {
    if (!q || typeof q !== "object") continue;
    const r = q as Record<string, unknown>;
    const type = VALID_TYPES.includes(r.type as SurveyQuestion["type"])
      ? (r.type as SurveyQuestion["type"])
      : null;
    const label = typeof r.label === "string" ? r.label.trim().slice(0, 200) : "";
    if (!type || !label) continue;
    const id =
      typeof r.id === "string" && r.id.trim().length > 0
        ? r.id.trim().slice(0, 64)
        : slugify(label) || `q_${out.length + 1}`;
    const required = !!r.required;
    const options =
      type === "choice" && Array.isArray(r.options)
        ? r.options
            .filter((o: unknown): o is string => typeof o === "string")
            .map((o) => o.trim().slice(0, 100))
            .filter((o) => o.length > 0)
            .slice(0, 12)
        : undefined;
    out.push({ id, type, label, required, options });
  }
  return out;
}

export async function createSurveyAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string; slug: string }>> {
  const profile = await requireProfile();
  if (!["admin", "owner"].includes(profile.role)) {
    return { error: "Not authorised." };
  }

  const name = sanitiseString(formData.get("name"), 120);
  const description = sanitiseString(formData.get("description"), 600) || null;
  const triggerRaw = sanitiseString(formData.get("trigger"), 32) as SurveyTrigger;
  const trigger: SurveyTrigger = VALID_TRIGGERS.includes(triggerRaw)
    ? triggerRaw
    : "manual";
  const slugIn = sanitiseString(formData.get("slug"), 64);
  const active = formData.get("active") !== "off";

  const questionsRaw = formData.get("questions_json");
  let parsedQuestions: unknown = [];
  if (typeof questionsRaw === "string" && questionsRaw.trim().length > 0) {
    try {
      parsedQuestions = JSON.parse(questionsRaw);
    } catch {
      return { error: "Questions JSON is not valid JSON." };
    }
  }
  const questions = validateQuestions(parsedQuestions);
  if (!name) return { error: "Name is required." };
  if (questions.length === 0) return { error: "Add at least one question." };

  const slug = slugify(slugIn || name);
  if (!slug) return { error: "Slug invalid." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("surveys")
    .insert({
      tenant_id: profile.tenant_id,
      slug,
      name,
      description,
      trigger,
      questions,
      active,
      created_by: profile.id,
    })
    .select("id, slug")
    .single();

  if (error || !data) return { error: error?.message || "Failed to create survey." };
  const row = data as { id: string; slug: string };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "survey.create",
    entity_type: "survey",
    entity_id: row.id,
    after: { slug, name, trigger, question_count: questions.length, active },
  });

  revalidatePath("/surveys/admin");
  return { ok: true, data: row };
}

export async function updateSurveyAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["admin", "owner"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const id = sanitiseString(formData.get("id"), 64);
  if (!id) return { error: "Survey id required." };

  const before = await getSurvey(id);
  if (!before) return { error: "Survey not found." };

  const updates: Record<string, unknown> = {};
  const name = sanitiseString(formData.get("name"), 120);
  if (name) updates.name = name;
  const description = formData.get("description");
  if (description !== null) {
    updates.description = sanitiseString(description, 600) || null;
  }
  const triggerRaw = sanitiseString(formData.get("trigger"), 32) as SurveyTrigger;
  if (triggerRaw && VALID_TRIGGERS.includes(triggerRaw)) updates.trigger = triggerRaw;
  if (formData.has("active")) {
    updates.active = formData.get("active") !== "off";
  }
  const questionsRaw = formData.get("questions_json");
  if (typeof questionsRaw === "string" && questionsRaw.trim().length > 0) {
    try {
      const parsed = JSON.parse(questionsRaw);
      const validated = validateQuestions(parsed);
      if (validated.length === 0) return { error: "At least one question required." };
      updates.questions = validated;
    } catch {
      return { error: "Questions JSON invalid." };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("surveys").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "survey.update",
    entity_type: "survey",
    entity_id: id,
    before: { name: before.name, trigger: before.trigger, active: before.active },
    after: updates,
  });

  revalidatePath("/surveys/admin");
  return { ok: true };
}

export type SendSurveyOpts = {
  related_type: SurveyRelatedType;
  related_id: string | null;
  recipient_id: string | null;
  tenant_id: string;
  trigger: SurveyTrigger;
  source?: string;
};

export async function sendSurveyForTrigger(
  opts: SendSurveyOpts,
): Promise<{ ok: boolean; response_id?: string; reason?: string }> {
  const survey = await getSurveyForTrigger(opts.tenant_id, opts.trigger);
  if (!survey) return { ok: false, reason: "no_survey" };

  const admin = createAdminClient();

  // Idempotency: skip if a response for this survey + related already exists
  if (opts.related_id) {
    const { data: existing } = await admin
      .from("survey_responses")
      .select("id")
      .eq("survey_id", survey.id)
      .eq("related_type", opts.related_type)
      .eq("related_id", opts.related_id)
      .limit(1)
      .maybeSingle();
    if (existing) return { ok: true, response_id: (existing as { id: string }).id, reason: "exists" };
  }

  const { data: ins, error } = await admin
    .from("survey_responses")
    .insert({
      tenant_id: opts.tenant_id,
      survey_id: survey.id,
      respondent_id: opts.recipient_id,
      related_type: opts.related_type,
      related_id: opts.related_id,
      score: null,
      answers: {},
    })
    .select("id")
    .single();

  if (error || !ins) return { ok: false, reason: error?.message };
  const response_id = (ins as { id: string }).id;

  if (opts.recipient_id) {
    const subject = `Quick feedback: ${survey.name}`;
    const body =
      `Please take 30 seconds to share your feedback on the recent ${opts.related_type === "ticket" ? "ticket" : "change"} we resolved for you.` +
      `\n\nOpen the survey from the Surveys & Feedbacks page.`;
    await createNotification({
      tenant_id: opts.tenant_id,
      recipient_id: opts.recipient_id,
      kind: "survey_invite",
      subject,
      body_md: body,
      related_type: "survey",
      related_id: response_id,
      channel: "in_app",
    });
  }

  await logActionNoRequest({
    tenant_id: opts.tenant_id,
    actor_id: null,
    action: "survey.send",
    entity_type: "survey_response",
    entity_id: response_id,
    after: {
      survey_id: survey.id,
      trigger: opts.trigger,
      related_type: opts.related_type,
      related_id: opts.related_id,
      source: opts.source ?? "trigger",
    },
  });

  return { ok: true, response_id };
}

export async function recordResponseAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  const responseId = sanitiseString(formData.get("response_id"), 64);
  if (!responseId) return { error: "Response id required." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("survey_responses")
    .select("id, survey_id, respondent_id, submitted_at, related_type, related_id, tenant_id")
    .eq("id", responseId)
    .maybeSingle();
  if (!existing) return { error: "Response not found." };
  const r = existing as {
    id: string;
    survey_id: string;
    respondent_id: string | null;
    submitted_at: string | null;
    related_type: SurveyRelatedType;
    related_id: string | null;
    tenant_id: string;
  };
  if (r.submitted_at) return { error: "Already submitted." };
  if (r.respondent_id && r.respondent_id !== profile.id) {
    return { error: "Not authorised." };
  }

  const survey = await getSurvey(r.survey_id);
  if (!survey) return { error: "Survey not found." };

  const answers: Record<string, string | number | string[]> = {};
  let scoreOverall: number | null = null;
  for (const q of survey.questions) {
    const raw = formData.get(`q_${q.id}`);
    if (q.type === "rating") {
      const num = Number(raw ?? "");
      if (!isNaN(num) && num >= 1 && num <= 5) {
        answers[q.id] = num;
        if (q.id === "overall" || scoreOverall === null) scoreOverall = num;
      } else if (q.required) {
        return { error: `Rating required for: ${q.label}` };
      }
    } else if (q.type === "text") {
      const s = sanitiseString(raw, 4000);
      if (s) answers[q.id] = s;
      else if (q.required) return { error: `Required: ${q.label}` };
    } else if (q.type === "choice") {
      const s = sanitiseString(raw, 200);
      if (s) {
        if (q.options && !q.options.includes(s)) {
          return { error: `Invalid option for: ${q.label}` };
        }
        answers[q.id] = s;
      } else if (q.required) return { error: `Required: ${q.label}` };
    }
  }

  const comments =
    sanitiseString(formData.get("comments"), 4000) ||
    [answers["worked_well"], answers["better"]]
      .filter((v): v is string => typeof v === "string" && v.length > 0)
      .join("\n\n");

  const now = new Date().toISOString();
  const { error: updErr } = await supabase
    .from("survey_responses")
    .update({
      respondent_id: r.respondent_id ?? profile.id,
      answers,
      score: scoreOverall,
      comments: comments || null,
      submitted_at: now,
    })
    .eq("id", responseId);
  if (updErr) return { error: updErr.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "survey.respond",
    entity_type: "survey_response",
    entity_id: responseId,
    after: {
      survey_id: survey.id,
      score: scoreOverall,
      has_comment: !!comments,
    },
  });

  // Fire and forget sentiment analysis
  if (comments && comments.trim().length > 0) {
    runSentimentAnalysis(responseId).catch((e) => {
      console.error("[sentiment] async failed:", e);
    });
  }

  revalidatePath("/surveys-feedbacks");
  return { ok: true, data: { id: responseId } };
}

export async function runSentimentAnalysis(responseId: string): Promise<void> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("survey_responses")
    .select(
      "id, tenant_id, respondent_id, comments, score, related_type, related_id, ai_sentiment",
    )
    .eq("id", responseId)
    .maybeSingle();
  if (!data) return;
  const r = data as {
    id: string;
    tenant_id: string;
    respondent_id: string | null;
    comments: string | null;
    score: number | null;
    related_type: SurveyRelatedType;
    related_id: string | null;
    ai_sentiment: string | null;
  };
  if (r.ai_sentiment) return;
  if (!r.comments || r.comments.trim().length === 0) {
    await admin
      .from("survey_responses")
      .update({
        ai_sentiment: "neutral",
        ai_themes: [],
        ai_confidence: 0,
        ai_processed_at: new Date().toISOString(),
      })
      .eq("id", responseId);
    return;
  }

  let context: string | null = null;
  if (r.related_type === "ticket" && r.related_id) {
    const { data: t } = await admin
      .from("tickets")
      .select("number, title")
      .eq("id", r.related_id)
      .maybeSingle();
    if (t) {
      const tt = t as { number: string; title: string };
      context = `${tt.number}: ${tt.title}`;
    }
  }

  const result = await analyzeSentiment({
    tenant_id: r.tenant_id,
    actor_id: r.respondent_id,
    related_entity_type: "survey_response",
    related_entity_id: responseId,
    input: { text: r.comments, score: r.score, context },
  });

  await admin
    .from("survey_responses")
    .update({
      ai_sentiment: result.sentiment,
      ai_themes: result.themes,
      ai_confidence: result.confidence,
      ai_processed_at: new Date().toISOString(),
    })
    .eq("id", responseId);
}

export async function manualSendSurveyAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ response_id: string }>> {
  const profile = await requireProfile();
  if (!["admin", "owner", "agent", "manager"].includes(profile.role)) {
    return { error: "Not authorised." };
  }
  const surveyId = sanitiseString(formData.get("survey_id"), 64);
  const recipientId = sanitiseString(formData.get("recipient_id"), 64) || null;
  const relatedType = (sanitiseString(
    formData.get("related_type"),
    16,
  ) as SurveyRelatedType) || "none";
  const relatedId = sanitiseString(formData.get("related_id"), 64) || null;

  if (!surveyId) return { error: "Survey id required." };
  const survey = await getSurvey(surveyId);
  if (!survey) return { error: "Survey not found." };

  const admin = createAdminClient();
  const { data: ins, error } = await admin
    .from("survey_responses")
    .insert({
      tenant_id: profile.tenant_id,
      survey_id: survey.id,
      respondent_id: recipientId,
      related_type: relatedType,
      related_id: relatedId,
    })
    .select("id")
    .single();
  if (error || !ins) return { error: error?.message };
  const response_id = (ins as { id: string }).id;

  if (recipientId) {
    await createNotification({
      tenant_id: profile.tenant_id,
      recipient_id: recipientId,
      kind: "survey_invite",
      subject: `Quick feedback: ${survey.name}`,
      body_md: `${profile.full_name || profile.email} would like your feedback. Please complete the **${survey.name}** survey when convenient.`,
      related_type: "survey",
      related_id: response_id,
      channel: "in_app",
    });
  }

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "survey.send_manual",
    entity_type: "survey_response",
    entity_id: response_id,
    after: { survey_id: survey.id, recipient_id: recipientId, related_type: relatedType, related_id: relatedId },
  });

  revalidatePath("/surveys/admin");
  return { ok: true, data: { response_id } };
}

export type { Survey };
