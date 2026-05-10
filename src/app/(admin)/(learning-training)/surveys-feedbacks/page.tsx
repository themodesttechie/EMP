import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import {
  getPendingForRespondent,
  getSubmittedHistoryForRespondent,
  listSurveys,
} from "@/lib/surveys/queries";
import SurveysFeedbacksView from "@/components/surveys/SurveysFeedbacksView";

export const metadata: Metadata = { title: "Surveys & feedbacks | ifBash" };

export default async function SurveysFeedbacksPage() {
  const profile = await requireProfile();
  const [pending, history, surveys] = await Promise.all([
    getPendingForRespondent(profile.id),
    getSubmittedHistoryForRespondent(profile.id),
    listSurveys({ active_only: true }),
  ]);

  const surveyMap: Record<string, (typeof surveys)[number]> = {};
  for (const s of surveys) surveyMap[s.id] = s;

  return (
    <SurveysFeedbacksView
      pending={pending}
      history={history}
      surveys={surveyMap}
    />
  );
}
