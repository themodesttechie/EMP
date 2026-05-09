import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { getViewRows, VIEW_LABELS, type ViewSlug } from "@/lib/reports/queries";
import ReportDrilldown from "@/components/reports/ReportDrilldown";

export const metadata: Metadata = { title: "Report drill-down | ifBash" };

const VALID_VIEWS: ViewSlug[] = [
  "v_ticket_volume_daily",
  "v_ticket_resolution_time",
  "v_first_contact_resolution",
  "v_sla_compliance",
  "v_auto_resolve_rate",
  "v_deflection_rate",
  "v_ai_cost_per_resolved",
  "v_csat_trend",
];

export default async function ReportDrilldownPage({
  params,
}: {
  params: Promise<{ view_slug: string }>;
}) {
  const profile = await requireProfile();
  if (!["admin", "owner", "manager"].includes(profile.role)) redirect("/");

  const { view_slug } = await params;
  if (!VALID_VIEWS.includes(view_slug as ViewSlug)) notFound();

  const slug = view_slug as ViewSlug;
  const rows = await getViewRows(slug);

  return (
    <ReportDrilldown
      slug={slug}
      title={VIEW_LABELS[slug]}
      rows={rows}
    />
  );
}
