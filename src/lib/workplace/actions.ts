"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { logAction } from "@/lib/audit/logger";
import { translateAnnouncement } from "@/lib/ai/translate";
import { categorizeKudos } from "@/lib/ai/kudos-categorize";
import type { AnnouncementAudience } from "./announcements";

export type ActionResult<T = unknown> = { ok?: boolean; error?: string; data?: T };

function s(v: FormDataEntryValue | null, max: number): string {
  return String(v ?? "").trim().slice(0, max);
}

function parseLocaleList(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((l) => l.trim().toLowerCase())
    .filter((l) => /^[a-z]{2}(-[a-z]{2})?$/.test(l))
    .slice(0, 10);
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export async function createAnnouncementAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  if (!["admin", "owner"].includes(profile.role)) return { error: "Not authorised." };

  const title = s(formData.get("title"), 200);
  const body_md = s(formData.get("body_md"), 16000);
  const category = s(formData.get("category"), 40) || "general";
  const pinned = formData.get("pinned") === "on";
  const expiresAtRaw = s(formData.get("expires_at"), 40) || null;
  const audienceMode = s(formData.get("audience_mode"), 24) || "all";
  const targetLocales = parseLocaleList(s(formData.get("target_locales"), 200));

  if (!title) return { error: "Title is required." };

  let audience: AnnouncementAudience = { all: true };
  if (audienceMode === "scoped") {
    const departments = s(formData.get("audience_departments"), 600)
      .split(",").map((x) => x.trim()).filter(Boolean);
    const roles = s(formData.get("audience_roles"), 200)
      .split(",").map((x) => x.trim()).filter(Boolean) as ("owner" | "admin" | "agent" | "manager" | "employee")[];
    const user_ids = s(formData.get("audience_user_ids"), 4000)
      .split(",").map((x) => x.trim()).filter(Boolean);
    audience = { departments, roles, user_ids };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      tenant_id: profile.tenant_id,
      title,
      body_md,
      category,
      pinned,
      audience,
      expires_at: expiresAtRaw ? new Date(expiresAtRaw).toISOString() : null,
      published_at: new Date().toISOString(),
      author_id: profile.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message || "Failed to create." };
  const annId = (data as { id: string }).id;

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "announcement.create",
    entity_type: "announcement",
    entity_id: annId,
    after: { title, category, pinned, audience_mode: audienceMode, locales: targetLocales },
  });

  // Fire-and-forget translate. Failure should not block creation.
  if (targetLocales.length > 0) {
    try {
      await translateAnnouncement({
        tenant_id: profile.tenant_id,
        actor_id: profile.id,
        announcement_id: annId,
        target_locales: targetLocales,
      });
    } catch (e) {
      console.error("[announcement.translate] failed:", e);
    }
  }

  revalidatePath("/announcements");
  revalidatePath("/company-news");
  redirect("/announcements");
}

export async function dismissAnnouncementAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["admin", "owner"].includes(profile.role)) return { error: "Not authorised." };
  const id = s(formData.get("id"), 64);
  if (!id) return { error: "Id required." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("announcements")
    .update({ expires_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "announcement.dismiss",
    entity_type: "announcement",
    entity_id: id,
  });
  revalidatePath("/announcements");
  return { ok: true };
}

export async function markAnnouncementReadAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const id = s(formData.get("id"), 64);
  if (!id) return { error: "Id required." };

  const supabase = await createClient();
  await supabase
    .from("announcement_reads")
    .upsert({ announcement_id: id, user_id: profile.id, read_at: new Date().toISOString() });
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Kudos
// ---------------------------------------------------------------------------

export async function giveKudosAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  const toUserId = s(formData.get("to_user_id"), 64);
  const message = s(formData.get("message"), 500);
  const isPublic = formData.get("public") !== "off";

  if (!toUserId) return { error: "Pick a recipient." };
  if (!message) return { error: "Message cannot be empty." };
  if (toUserId === profile.id) return { error: "You cannot kudos yourself." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kudos")
    .insert({
      tenant_id: profile.tenant_id,
      from_user_id: profile.id,
      to_user_id: toUserId,
      message,
      public: isPublic,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message || "Failed to send." };
  const id = (data as { id: string }).id;

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kudos.give",
    entity_type: "kudos",
    entity_id: id,
    after: { to_user_id: toUserId, public: isPublic, len: message.length },
  });

  // Async categorize. Best-effort.
  try {
    const cat = await categorizeKudos({
      tenant_id: profile.tenant_id,
      actor_id: profile.id,
      message,
    });
    if (cat.value) {
      const admin = createAdminClient();
      await admin.from("kudos").update({ ai_categorized_value: cat.value }).eq("id", id);
    }
  } catch (e) {
    console.error("[kudos.categorize] failed:", e);
  }

  revalidatePath("/appreciate");
  revalidatePath("/appreciate/feed");
  return { ok: true, data: { id } };
}

export async function deleteKudosAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const id = s(formData.get("id"), 64);
  if (!id) return { error: "Id required." };

  const supabase = await createClient();
  const { error } = await supabase.from("kudos").delete().eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "kudos.delete",
    entity_type: "kudos",
    entity_id: id,
  });
  revalidatePath("/appreciate/feed");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// FAQs
// ---------------------------------------------------------------------------

export async function createFaqAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const profile = await requireProfile();
  if (!["admin", "owner"].includes(profile.role)) return { error: "Not authorised." };

  const slug = s(formData.get("slug"), 80).toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 80);
  const question = s(formData.get("question"), 300);
  const answer_md = s(formData.get("answer_md"), 8000);
  const category = s(formData.get("category"), 40) || "general";
  const sort_order = Number(s(formData.get("sort_order"), 6)) || 100;

  if (!slug || !question) return { error: "Slug and question are required." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("faqs")
    .insert({
      tenant_id: profile.tenant_id,
      slug,
      question,
      answer_md,
      category,
      sort_order,
      published: true,
    })
    .select("id")
    .single();
  if (error || !data) return { error: error?.message || "Failed to create FAQ." };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "faq.create",
    entity_type: "faq",
    entity_id: (data as { id: string }).id,
    after: { slug, category },
  });
  revalidatePath("/faq");
  return { ok: true, data: { id: (data as { id: string }).id } };
}

export async function updateFaqAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  if (!["admin", "owner"].includes(profile.role)) return { error: "Not authorised." };
  const id = s(formData.get("id"), 64);
  if (!id) return { error: "Id required." };

  const updates: Record<string, unknown> = {};
  const question = s(formData.get("question"), 300);
  const answer_md = s(formData.get("answer_md"), 8000);
  const category = s(formData.get("category"), 40);
  const published = formData.get("published");
  if (question) updates.question = question;
  if (answer_md) updates.answer_md = answer_md;
  if (category) updates.category = category;
  if (published !== null) updates.published = published === "on";

  const supabase = await createClient();
  const { error } = await supabase.from("faqs").update(updates).eq("id", id);
  if (error) return { error: error.message };

  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    action: "faq.update",
    entity_type: "faq",
    entity_id: id,
    after: updates,
  });
  revalidatePath("/faq");
  return { ok: true };
}

export async function voteFaqAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  await requireProfile();
  const id = s(formData.get("id"), 64);
  const direction = s(formData.get("direction"), 12);
  if (!id || !["up", "down"].includes(direction)) return { error: "Invalid vote." };

  const admin = createAdminClient();
  const col = direction === "up" ? "helpful_count" : "unhelpful_count";
  const { data: cur } = await admin.from("faqs").select(`id, ${col}`).eq("id", id).maybeSingle();
  if (!cur) return { error: "FAQ not found." };
  const next = ((cur as Record<string, number>)[col] ?? 0) + 1;
  const { error } = await admin.from("faqs").update({ [col]: next }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/faq");
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Anonymous feedback
// ---------------------------------------------------------------------------

export async function submitFeedbackAction(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireProfile();
  const body = s(formData.get("body"), 4000);
  const categoryRaw = s(formData.get("category"), 32);
  const allowedCats = ["suggestion", "complaint", "praise", "bug"] as const;
  type Cat = (typeof allowedCats)[number];
  const category: Cat = (allowedCats as readonly string[]).includes(categoryRaw) ? (categoryRaw as Cat) : "suggestion";

  if (!body) return { error: "Feedback cannot be empty." };

  // Use admin to deliberately strip submitter. Anonymity guarantee: no profile FK.
  const admin = createAdminClient();
  const { error } = await admin.from("anonymous_feedback").insert({
    tenant_id: profile.tenant_id,
    body,
    category,
  });
  if (error) return { error: error.message };

  // Audit logs the act of submission, but NOT the body — preserves anonymity at the body level.
  await logAction({
    tenant_id: profile.tenant_id,
    actor_id: null,
    action: "feedback.submit",
    entity_type: "anonymous_feedback",
    entity_id: "anon",
    after: { category, len: body.length },
  });

  revalidatePath("/feedback");
  return { ok: true };
}
