import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { listResponses, listSurveys } from "@/lib/surveys/queries";
import SurveysAdminView from "@/components/surveys/SurveysAdminView";

export const metadata: Metadata = { title: "Surveys admin | ifBash" };

export default async function SurveysAdminPage() {
  const profile = await requireProfile();
  if (!["admin", "owner"].includes(profile.role)) redirect("/");

  const [surveys, responses] = await Promise.all([
    listSurveys(),
    listResponses({ submitted_only: true }),
  ]);

  return <SurveysAdminView surveys={surveys} responses={responses} />;
}
