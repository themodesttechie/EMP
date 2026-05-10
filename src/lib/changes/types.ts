export type ChangeType = "standard" | "normal" | "emergency";

export type ChangeState =
  | "draft"
  | "cab_review"
  | "approved"
  | "scheduled"
  | "in_progress"
  | "done"
  | "rolled_back"
  | "cancelled";

export type ChangeApprovalRole = "cab_member" | "manager" | "security";

export type ChangeApprovalState = "pending" | "approved" | "rejected" | "abstained";

export type ChangeTaskState = "todo" | "in_progress" | "done" | "blocked";

export type ChangeAiClassification = {
  risk_score: number | null;
  risk_reasoning: string | null;
  risk_factors: string[];
  template_match: {
    slug: string;
    confidence: number;
    auto_approve_recommended: boolean;
  } | null;
  model: string;
  at: string;
};

export type Change = {
  id: string;
  tenant_id: string;
  number: string;
  title: string;
  description: string | null;
  type: ChangeType;
  risk_score: number | null;
  state: ChangeState;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  requester_id: string;
  implementer_id: string | null;
  affected_ci_ids: string[];
  rollback_plan: string | null;
  template_id: string | null;
  ai_classification: ChangeAiClassification | null;
  created_at: string;
  updated_at: string;
};

export type ChangeApproval = {
  id: string;
  tenant_id: string;
  change_id: string;
  approver_id: string;
  role: ChangeApprovalRole;
  state: ChangeApprovalState;
  decided_at: string | null;
  comment: string | null;
  created_at: string;
};

export type ChangeTask = {
  id: string;
  tenant_id: string;
  change_id: string;
  sequence: number;
  title: string;
  description: string | null;
  owner_id: string | null;
  state: ChangeTaskState;
  est_minutes: number | null;
  actual_minutes: number | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ChangeTicketLink = {
  id: string;
  tenant_id: string;
  change_id: string;
  ticket_id: string;
  link_kind: "caused_by" | "related" | "resolves";
  created_by: string | null;
  created_at: string;
};

export type ChangeTemplate = {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  description: string | null;
  default_tasks: Array<{ sequence: number; title: string; est_minutes?: number; description?: string }>;
  auto_approve: boolean;
  risk_score_ceiling: number;
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
};

export const CHANGE_TYPES: ChangeType[] = ["standard", "normal", "emergency"];

export const CHANGE_STATES: ChangeState[] = [
  "draft",
  "cab_review",
  "approved",
  "scheduled",
  "in_progress",
  "done",
  "rolled_back",
  "cancelled",
];

export const CHANGE_TASK_STATES: ChangeTaskState[] = [
  "todo",
  "in_progress",
  "done",
  "blocked",
];

export const CHANGE_APPROVAL_ROLES: ChangeApprovalRole[] = [
  "cab_member",
  "manager",
  "security",
];

export const CHANGE_APPROVAL_STATES: ChangeApprovalState[] = [
  "pending",
  "approved",
  "rejected",
  "abstained",
];
