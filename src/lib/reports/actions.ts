"use server";

import { requireProfile } from "@/lib/auth";
import { explainTrend } from "@/lib/ai/trend-explainer";
import { getViewRows, type ViewSlug, VIEW_LABELS } from "./queries";

const VALID_VIEWS = new Set<ViewSlug>([
  "v_ticket_volume_daily",
  "v_ticket_resolution_time",
  "v_first_contact_resolution",
  "v_sla_compliance",
  "v_auto_resolve_rate",
  "v_deflection_rate",
  "v_ai_cost_per_resolved",
  "v_csat_trend",
]);

export type ExplainTrendActionResult =
  | {
      ok: true;
      narrative: string;
      top_factors: { label: string; weight: number; evidence: string }[];
      degraded: boolean;
    }
  | { ok: false; error: string };

export async function explainTrendAction(
  view: string,
  timeRange = "last 30 days",
): Promise<ExplainTrendActionResult> {
  const profile = await requireProfile();
  if (!["admin", "owner", "manager"].includes(profile.role)) {
    return { ok: false, error: "Not authorised." };
  }
  if (!VALID_VIEWS.has(view as ViewSlug)) {
    return { ok: false, error: "Unknown view." };
  }
  const slug = view as ViewSlug;

  const rows = await getViewRows(slug);
  if (rows.length === 0) {
    return {
      ok: true,
      narrative: "No data available in this time range yet.",
      top_factors: [],
      degraded: false,
    };
  }

  const result = await explainTrend({
    tenant_id: profile.tenant_id,
    actor_id: profile.id,
    view_name: VIEW_LABELS[slug],
    time_range: timeRange,
    rows,
  });

  return {
    ok: true,
    narrative: result.narrative,
    top_factors: result.top_factors,
    degraded: result.degraded,
  };
}
