export type CiStatus =
  | "planned"
  | "in_stock"
  | "assigned"
  | "in_repair"
  | "retired"
  | "lost";

export type AssetCondition = "new" | "good" | "fair" | "damaged";

export type CiRelationshipType =
  | "depends_on"
  | "runs_on"
  | "connects_to"
  | "contains"
  | "used_by";

export type CiClass = {
  id: string;
  tenant_id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  attributes_schema: Record<string, unknown>;
  is_active: boolean;
};

export type Ci = {
  id: string;
  tenant_id: string;
  number: string;
  class_id: string | null;
  name: string;
  serial: string | null;
  asset_tag: string | null;
  status: CiStatus;
  location: string | null;
  attributes: Record<string, unknown>;
  purchased_at: string | null;
  warranty_until: string | null;
  cost_centre: string | null;
  owner_user_id: string | null;
  email_message_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type CiRelationship = {
  id: string;
  tenant_id: string;
  from_ci: string;
  to_ci: string;
  type: CiRelationshipType;
  inverse_type: CiRelationshipType | null;
  notes: string | null;
  created_at: string;
};

export type AssetAssignment = {
  id: string;
  tenant_id: string;
  ci_id: string;
  user_id: string;
  assigned_by: string | null;
  assigned_at: string;
  returned_at: string | null;
  returned_to: string | null;
  condition: AssetCondition;
  return_condition: AssetCondition | null;
  checkout_notes: string | null;
  return_notes: string | null;
  created_at: string;
};

export type AssetAuditEvent = {
  id: string;
  tenant_id: string;
  ci_id: string;
  event: string;
  by_user: string | null;
  payload: Record<string, unknown> | null;
  at: string;
};

export const CI_STATUSES: CiStatus[] = [
  "planned",
  "in_stock",
  "assigned",
  "in_repair",
  "retired",
  "lost",
];

export const ASSET_CONDITIONS: AssetCondition[] = ["new", "good", "fair", "damaged"];

export const CI_REL_TYPES: CiRelationshipType[] = [
  "depends_on",
  "runs_on",
  "connects_to",
  "contains",
  "used_by",
];

// Inverse mapping for symmetric traversal hints.
export const CI_REL_INVERSE: Record<CiRelationshipType, CiRelationshipType> = {
  depends_on: "used_by",
  runs_on: "contains",
  connects_to: "connects_to",
  contains: "runs_on",
  used_by: "depends_on",
};
