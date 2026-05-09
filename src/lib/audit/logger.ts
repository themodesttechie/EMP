import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";

export type AuditAction =
  | "ticket.create"
  | "ticket.assign"
  | "ticket.comment"
  | "ticket.state_change"
  | "ticket.escalate"
  | "ticket.link_problem"
  | "ticket.link_asset"
  | "ticket.attachment_upload"
  | "ticket.email_in"
  | "ticket.sla_breach"
  | "ticket.sla_warning"
  | "notification.send"
  | "ai.action"
  | string;

export type LogActionInput = {
  tenant_id: string;
  actor_id: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
};

export async function logAction(input: LogActionInput): Promise<void> {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      null;
    const userAgent = h.get("user-agent") || null;

    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      tenant_id: input.tenant_id,
      actor_id: input.actor_id,
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      before: input.before ?? null,
      after: input.after ?? null,
      ip,
      user_agent: userAgent,
    });
  } catch (err) {
    // Never block a domain mutation because audit failed.
    console.error("[audit] logAction failed:", err);
  }
}

// Variant for non-request contexts (cron, webhooks pre-headers).
export async function logActionNoRequest(input: LogActionInput & { ip?: string | null; user_agent?: string | null }): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("audit_log").insert({
      tenant_id: input.tenant_id,
      actor_id: input.actor_id,
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      before: input.before ?? null,
      after: input.after ?? null,
      ip: input.ip ?? null,
      user_agent: input.user_agent ?? null,
    });
  } catch (err) {
    console.error("[audit] logActionNoRequest failed:", err);
  }
}
