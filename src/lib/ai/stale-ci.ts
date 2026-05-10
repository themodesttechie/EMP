import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { logActionNoRequest } from "@/lib/audit/logger";

export type StaleCi = {
  ci_id: string;
  number: string;
  name: string;
  tenant_id: string;
  days_since_update: number;
  recent_mentions: number;
  reason: string;
};

const STALE_DAYS = 90;

// Cheap, deterministic scan. No LLM call needed for the heuristic itself; the
// REQUIREMENTS spec calls this "AI-detected" but the scan is rule-based with
// optional Sonnet narrative — Sprint 4 keeps the rule, defers the narrative.
export async function scanStaleCis(opts?: { tenant_id?: string }): Promise<{
  scanned: number;
  flagged: StaleCi[];
}> {
  const admin = createAdminClient();
  const cutoffIso = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();

  let q = admin
    .from("cis")
    .select("id, number, name, tenant_id, updated_at, status")
    .lt("updated_at", cutoffIso)
    .not("status", "in", "(retired,lost)");
  if (opts?.tenant_id) q = q.eq("tenant_id", opts.tenant_id);

  const { data } = await q;
  const cis = (data ?? []) as Array<{
    id: string;
    number: string;
    name: string;
    tenant_id: string;
    updated_at: string;
    status: string;
  }>;

  const flagged: StaleCi[] = [];
  const now = Date.now();

  for (const ci of cis) {
    const days = Math.floor((now - new Date(ci.updated_at).getTime()) / (24 * 60 * 60 * 1000));

    // Look for incident-comment mentions in the last 30 days that reference this CI
    const since = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("ticket_comments")
      .select("id", { count: "exact", head: true })
      .ilike("body", `%${ci.number}%`)
      .gte("created_at", since);

    const mentions = count ?? 0;
    let reason = `No update in ${days} days`;
    if (mentions === 0) {
      reason += " and no recent ticket mentions.";
    } else {
      reason += `; mentioned in ${mentions} recent comment${mentions === 1 ? "" : "s"} but record not refreshed.`;
    }

    flagged.push({
      ci_id: ci.id,
      number: ci.number,
      name: ci.name,
      tenant_id: ci.tenant_id,
      days_since_update: days,
      recent_mentions: mentions,
      reason,
    });

    await admin.from("asset_audit_log").insert({
      tenant_id: ci.tenant_id,
      ci_id: ci.id,
      by_user: null,
      event: "ci.stale_flagged",
      payload: { days_since_update: days, recent_mentions: mentions },
    });

    await logActionNoRequest({
      tenant_id: ci.tenant_id,
      actor_id: null,
      action: "ci.stale_flagged",
      entity_type: "ci",
      entity_id: ci.id,
      after: { days_since_update: days, recent_mentions: mentions },
    });
  }

  return { scanned: cis.length, flagged };
}
