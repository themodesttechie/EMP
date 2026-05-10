import "server-only";
import { createClient } from "@/lib/supabase/server";

export type TicketVolumeRow = {
  tenant_id: string;
  day: string;
  category_id: string | null;
  category_slug: string | null;
  category_name: string | null;
  ticket_count: number;
};

export type ResolutionTimeRow = {
  tenant_id: string;
  category_id: string | null;
  category_slug: string | null;
  category_name: string | null;
  priority: "P1" | "P2" | "P3" | "P4";
  resolved_count: number;
  avg_minutes: number | null;
  median_minutes: number | null;
  p90_minutes: number | null;
};

export type FcrRow = {
  tenant_id: string;
  category_id: string | null;
  category_slug: string | null;
  category_name: string | null;
  resolved_count: number;
  fcr_count: number;
  fcr_pct: number;
};

export type SlaComplianceRow = {
  tenant_id: string;
  category_id: string | null;
  category_slug: string | null;
  category_name: string | null;
  priority: "P1" | "P2" | "P3" | "P4";
  total: number;
  met: number;
  compliance_pct: number;
};

export type AutoResolveRow = {
  tenant_id: string;
  total: number;
  auto_resolved: number;
  auto_resolve_pct: number;
};

export type DeflectionRow = {
  tenant_id: string;
  deflections: number;
  form_submits: number;
  deflection_pct: number;
};

export type AiCostRow = {
  tenant_id: string;
  ai_spend_usd: number;
  resolved_count: number;
  cost_per_resolved_usd: number;
};

export type CsatTrendRow = {
  tenant_id: string;
  week: string;
  response_count: number;
  avg_score: number | null;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
};

export type ViewSlug =
  | "v_ticket_volume_daily"
  | "v_ticket_resolution_time"
  | "v_first_contact_resolution"
  | "v_sla_compliance"
  | "v_auto_resolve_rate"
  | "v_deflection_rate"
  | "v_ai_cost_per_resolved"
  | "v_csat_trend";

export const VIEW_LABELS: Record<ViewSlug, string> = {
  v_ticket_volume_daily: "Ticket volume (daily)",
  v_ticket_resolution_time: "Resolution time (MTTR)",
  v_first_contact_resolution: "First contact resolution",
  v_sla_compliance: "SLA compliance",
  v_auto_resolve_rate: "Auto-resolve rate",
  v_deflection_rate: "Deflection rate",
  v_ai_cost_per_resolved: "AI cost per resolved ticket",
  v_csat_trend: "CSAT trend",
};

export async function getTicketVolume(): Promise<TicketVolumeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_ticket_volume_daily")
    .select("*")
    .order("day", { ascending: true });
  return (data ?? []) as TicketVolumeRow[];
}

export async function getResolutionTime(): Promise<ResolutionTimeRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_ticket_resolution_time")
    .select("*")
    .order("priority", { ascending: true });
  return (data ?? []) as ResolutionTimeRow[];
}

export async function getFcr(): Promise<FcrRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_first_contact_resolution")
    .select("*")
    .order("fcr_pct", { ascending: false });
  return (data ?? []) as FcrRow[];
}

export async function getSlaCompliance(): Promise<SlaComplianceRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_sla_compliance")
    .select("*")
    .order("priority", { ascending: true });
  return (data ?? []) as SlaComplianceRow[];
}

export async function getAutoResolve(): Promise<AutoResolveRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_auto_resolve_rate")
    .select("*")
    .limit(1)
    .maybeSingle();
  return (data ?? null) as AutoResolveRow | null;
}

export async function getDeflection(): Promise<DeflectionRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_deflection_rate")
    .select("*")
    .limit(1)
    .maybeSingle();
  return (data ?? null) as DeflectionRow | null;
}

export async function getAiCost(): Promise<AiCostRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_ai_cost_per_resolved")
    .select("*")
    .limit(1)
    .maybeSingle();
  return (data ?? null) as AiCostRow | null;
}

export async function getCsatTrendRows(): Promise<CsatTrendRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("v_csat_trend")
    .select("*")
    .order("week", { ascending: true });
  return (data ?? []) as CsatTrendRow[];
}

export async function getViewRows(
  view: ViewSlug,
): Promise<Record<string, unknown>[]> {
  const supabase = await createClient();
  const { data } = await supabase.from(view).select("*").limit(500);
  return (data ?? []) as Record<string, unknown>[];
}

export type KpiSummary = {
  mttr_minutes: number | null;
  fcr_pct: number | null;
  sla_compliance_pct: number | null;
  auto_resolve_pct: number;
  deflection_pct: number;
  csat_avg: number | null;
  ai_cost_per_resolved_usd: number;
};

export async function kpiSummary(): Promise<KpiSummary> {
  const [mttr, fcr, sla, autoR, defl, ai, csat] = await Promise.all([
    getResolutionTime(),
    getFcr(),
    getSlaCompliance(),
    getAutoResolve(),
    getDeflection(),
    getAiCost(),
    getCsatTrendRows(),
  ]);

  const mttrAvg =
    mttr.length === 0
      ? null
      : (() => {
          let total = 0;
          let count = 0;
          for (const r of mttr) {
            if (r.avg_minutes !== null && r.resolved_count > 0) {
              total += Number(r.avg_minutes) * r.resolved_count;
              count += r.resolved_count;
            }
          }
          return count === 0 ? null : Number((total / count).toFixed(2));
        })();

  const fcrAvg =
    fcr.length === 0
      ? null
      : (() => {
          let res = 0;
          let met = 0;
          for (const r of fcr) {
            res += r.resolved_count;
            met += r.fcr_count;
          }
          return res === 0 ? null : Number(((100 * met) / res).toFixed(2));
        })();

  const slaAvg =
    sla.length === 0
      ? null
      : (() => {
          let total = 0;
          let met = 0;
          for (const r of sla) {
            total += r.total;
            met += r.met;
          }
          return total === 0 ? null : Number(((100 * met) / total).toFixed(2));
        })();

  const csatAvg =
    csat.length === 0
      ? null
      : (() => {
          let total = 0;
          let n = 0;
          for (const w of csat) {
            if (w.avg_score !== null) {
              total += Number(w.avg_score) * w.response_count;
              n += w.response_count;
            }
          }
          return n === 0 ? null : Number((total / n).toFixed(2));
        })();

  return {
    mttr_minutes: mttrAvg,
    fcr_pct: fcrAvg,
    sla_compliance_pct: slaAvg,
    auto_resolve_pct: autoR ? Number(autoR.auto_resolve_pct) : 0,
    deflection_pct: defl ? Number(defl.deflection_pct) : 0,
    csat_avg: csatAvg,
    ai_cost_per_resolved_usd: ai ? Number(ai.cost_per_resolved_usd) : 0,
  };
}
