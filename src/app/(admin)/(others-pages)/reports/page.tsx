import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import {
  getCsatTrendRows,
  getResolutionTime,
  getSlaCompliance,
  getTicketVolume,
  kpiSummary,
} from "@/lib/reports/queries";
import ReportsDashboard from "@/components/reports/ReportsDashboard";

export const metadata: Metadata = { title: "Reports | ifBash" };

export default async function ReportsPage() {
  const profile = await requireProfile();
  if (!["admin", "owner", "manager"].includes(profile.role)) redirect("/");

  const [kpi, volume, mttr, sla, csat] = await Promise.all([
    kpiSummary(),
    getTicketVolume(),
    getResolutionTime(),
    getSlaCompliance(),
    getCsatTrendRows(),
  ]);

  return (
    <ReportsDashboard
      kpi={kpi}
      volume={volume}
      mttr={mttr}
      sla={sla}
      csat={csat}
    />
  );
}
