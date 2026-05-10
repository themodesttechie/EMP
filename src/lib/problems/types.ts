import type { TicketPriority } from "@/lib/tickets/types";

export type ProblemState =
  | "new"
  | "investigating"
  | "known_error"
  | "resolved"
  | "closed";

export type AiProposedRootCause = {
  root_cause: string;
  confidence: number;
  reasoning: string;
  supporting_incidents: string[];
  model: string;
  at: string;
};

export type Problem = {
  id: string;
  tenant_id: string;
  number: string;
  title: string;
  description: string | null;
  root_cause: string | null;
  workaround: string | null;
  state: ProblemState;
  priority: TicketPriority;
  related_incidents_count: number;
  ai_proposed_root_cause: AiProposedRootCause | null;
  created_by: string | null;
  assigned_to: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProblemIncidentLink = {
  id: string;
  tenant_id: string;
  problem_id: string;
  ticket_id: string;
  linked_by: string | null;
  linked_at: string;
};

export type KnownError = {
  id: string;
  tenant_id: string;
  problem_id: string;
  kb_article_id: string | null;
  workaround_summary: string | null;
  created_by: string | null;
  created_at: string;
};

export const PROBLEM_STATES: ProblemState[] = [
  "new",
  "investigating",
  "known_error",
  "resolved",
  "closed",
];
