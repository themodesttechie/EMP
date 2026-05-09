import type { AppRole } from "@/lib/auth";

export type TicketState =
  | "new"
  | "triage"
  | "in_progress"
  | "pending_user"
  | "resolved"
  | "closed"
  | "cancelled";

export type TicketPriority = "P1" | "P2" | "P3" | "P4";

export type TicketSource = "portal" | "email" | "api" | "agent" | "chat";

export type TicketCategory = {
  id: string;
  tenant_id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  default_priority: TicketPriority;
  default_assignment_role: AppRole | null;
  is_active: boolean;
};

export type TicketAiClassification = {
  category_slug: string | null;
  category_id?: string | null;
  priority: TicketPriority;
  confidence: number;
  reasoning: string;
  accepted_by_agent?: boolean | null;
  model: string;
  at: string;
};

export type Ticket = {
  id: string;
  tenant_id: string;
  number: string;
  requester_id: string;
  assignee_id: string | null;
  category_id: string | null;
  priority: TicketPriority;
  state: TicketState;
  source: TicketSource;
  title: string;
  description: string | null;
  ai_classification: TicketAiClassification | null;
  response_due_at: string | null;
  resolution_due_at: string | null;
  responded_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  sla_breached: boolean;
  sla_warned_at: string | null;
  email_message_id: string | null;
  email_in_reply_to: string | null;
  created_at: string;
  updated_at: string;
};

export type TicketComment = {
  id: string;
  tenant_id: string;
  ticket_id: string;
  author_id: string | null;
  kind: "comment" | "system" | "ai";
  body: string;
  is_internal: boolean;
  created_at: string;
};

export type TicketAttachment = {
  id: string;
  tenant_id: string;
  ticket_id: string;
  uploaded_by: string | null;
  storage_path: string;
  filename: string;
  mime: string | null;
  size_bytes: number;
  created_at: string;
};

export type TicketStateHistoryRow = {
  id: string;
  tenant_id: string;
  ticket_id: string;
  from_state: TicketState | null;
  to_state: TicketState;
  by_user: string | null;
  reason: string | null;
  payload: Record<string, unknown> | null;
  at: string;
};

export const TICKET_STATES: TicketState[] = [
  "new",
  "triage",
  "in_progress",
  "pending_user",
  "resolved",
  "closed",
  "cancelled",
];

export const TICKET_PRIORITIES: TicketPriority[] = ["P1", "P2", "P3", "P4"];
