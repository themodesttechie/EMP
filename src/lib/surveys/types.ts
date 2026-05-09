export type SurveyTrigger =
  | "post_incident_resolved"
  | "post_change_done"
  | "scheduled"
  | "manual";

export type SurveyRelatedType = "ticket" | "change" | "none";

export type SurveySentiment = "positive" | "neutral" | "negative";

export type SurveyQuestionType = "rating" | "text" | "choice";

export type SurveyQuestion = {
  id: string;
  type: SurveyQuestionType;
  label: string;
  required: boolean;
  options?: string[];
};

export type Survey = {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  description: string | null;
  trigger: SurveyTrigger;
  questions: SurveyQuestion[];
  active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SurveyResponse = {
  id: string;
  tenant_id: string;
  survey_id: string;
  respondent_id: string | null;
  related_type: SurveyRelatedType;
  related_id: string | null;
  score: number | null;
  answers: Record<string, unknown>;
  comments: string | null;
  ai_sentiment: SurveySentiment | null;
  ai_themes: string[] | null;
  ai_confidence: number | null;
  ai_processed_at: string | null;
  submitted_at: string | null;
  created_at: string;
};

export type CsatWeekRow = {
  tenant_id: string;
  week: string;
  response_count: number;
  avg_score: number | null;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
};

export type ThemeFrequency = {
  theme: string;
  count: number;
};

export const SURVEY_QUESTION_TYPES: SurveyQuestionType[] = [
  "rating",
  "text",
  "choice",
];

export const SURVEY_TRIGGERS: SurveyTrigger[] = [
  "post_incident_resolved",
  "post_change_done",
  "scheduled",
  "manual",
];
