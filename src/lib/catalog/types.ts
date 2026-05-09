import type { AppRole } from "@/lib/auth";

export type CatalogCategory = {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
};

export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox";

export type FormField = {
  key: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
};

export type ApproverStep =
  | { kind: "manager"; label?: string; optional?: boolean }
  | { kind: "role"; role: AppRole; label?: string; optional?: boolean }
  | { kind: "user"; user_id: string; label?: string; optional?: boolean };

export type CatalogItem = {
  id: string;
  tenant_id: string;
  category_id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  icon: string | null;
  form_schema: FormField[];
  approval_chain: ApproverStep[];
  fulfilment_role: AppRole;
  sla_hours: number | null;
  is_active: boolean;
};

export type CatalogItemWithCategory = CatalogItem & {
  category: Pick<CatalogCategory, "id" | "slug" | "name" | "icon">;
};

export type RequestStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "fulfilled"
  | "cancelled";

export type ApprovalDecision = "pending" | "approved" | "rejected";
export type ApproverKind = "manager" | "role" | "user";

export type ServiceRequest = {
  id: string;
  tenant_id: string;
  code: string;
  catalog_item_id: string;
  requester_id: string;
  item_name_snapshot: string;
  category_name_snapshot: string;
  form_data: Record<string, unknown>;
  status: RequestStatus;
  current_stage: number;
  total_stages: number;
  assignee_id: string | null;
  due_at: string | null;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type RequestApproval = {
  id: string;
  tenant_id: string;
  request_id: string;
  stage: number;
  approver_kind: ApproverKind;
  approver_id: string | null;
  required_role: AppRole | null;
  decision: ApprovalDecision;
  decided_by: string | null;
  decided_at: string | null;
  comment: string | null;
  created_at: string;
};

export type RequestComment = {
  id: string;
  tenant_id: string;
  request_id: string;
  author_id: string | null;
  kind: "comment" | "system";
  body: string;
  is_internal: boolean;
  created_at: string;
};
