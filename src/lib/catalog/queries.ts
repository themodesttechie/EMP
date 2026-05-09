import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  CatalogCategory,
  CatalogItem,
  CatalogItemWithCategory,
  RequestApproval,
  RequestComment,
  ServiceRequest,
} from "./types";

export async function listCategoriesWithItems() {
  const supabase = await createClient();
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase
      .from("catalog_categories")
      .select("id, tenant_id, slug, name, icon, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order"),
    supabase
      .from("catalog_items")
      .select(
        "id, tenant_id, category_id, slug, name, short_description, description, icon, form_schema, approval_chain, fulfilment_role, sla_hours, is_active",
      )
      .eq("is_active", true)
      .order("name"),
  ]);

  const cats = (categories ?? []) as CatalogCategory[];
  const its = (items ?? []) as CatalogItem[];

  return cats.map((cat) => ({
    ...cat,
    items: its.filter((i) => i.category_id === cat.id),
  }));
}

export async function getCatalogItemBySlug(
  slug: string,
): Promise<CatalogItemWithCategory | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("catalog_items")
    .select(
      "id, tenant_id, category_id, slug, name, short_description, description, icon, form_schema, approval_chain, fulfilment_role, sla_hours, is_active, category:catalog_categories!inner(id, slug, name, icon)",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return (data ?? null) as CatalogItemWithCategory | null;
}

export async function listMyRequests(filters?: {
  status?: ServiceRequest["status"][];
  categorySlug?: string;
}) {
  const supabase = await createClient();
  let q = supabase
    .from("requests")
    .select(
      "id, tenant_id, code, catalog_item_id, requester_id, item_name_snapshot, category_name_snapshot, form_data, status, current_stage, total_stages, assignee_id, due_at, submitted_at, completed_at, created_at, updated_at",
    )
    .order("created_at", { ascending: false });

  if (filters?.status?.length) {
    q = q.in("status", filters.status);
  }
  if (filters?.categorySlug) {
    q = q.ilike("category_name_snapshot", filters.categorySlug);
  }

  const { data } = await q;
  return (data ?? []) as ServiceRequest[];
}

export async function listPendingApprovalsForMe() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("request_approvals")
    .select(
      `id, tenant_id, request_id, stage, approver_kind, approver_id, required_role, decision, decided_by, decided_at, comment, created_at,
       request:requests!inner(id, code, item_name_snapshot, category_name_snapshot, requester_id, status, current_stage, total_stages, submitted_at, due_at)`,
    )
    .eq("decision", "pending")
    .order("created_at");

  // Supabase types !inner relations as arrays; flatten to a single object.
  const rows = (data ?? []) as unknown as Array<
    RequestApproval & {
      request:
        | Pick<
            ServiceRequest,
            | "id"
            | "code"
            | "item_name_snapshot"
            | "category_name_snapshot"
            | "requester_id"
            | "status"
            | "current_stage"
            | "total_stages"
            | "submitted_at"
            | "due_at"
          >
        | Pick<
            ServiceRequest,
            | "id"
            | "code"
            | "item_name_snapshot"
            | "category_name_snapshot"
            | "requester_id"
            | "status"
            | "current_stage"
            | "total_stages"
            | "submitted_at"
            | "due_at"
          >[];
    }
  >;
  return rows.map((row) => ({
    ...row,
    request: Array.isArray(row.request) ? row.request[0] : row.request,
  })) as Array<
    RequestApproval & {
      request: Pick<
        ServiceRequest,
        | "id"
        | "code"
        | "item_name_snapshot"
        | "category_name_snapshot"
        | "requester_id"
        | "status"
        | "current_stage"
        | "total_stages"
        | "submitted_at"
        | "due_at"
      >;
    }
  >;
}

export async function getRequestByCode(code: string) {
  const supabase = await createClient();

  const { data: req } = await supabase
    .from("requests")
    .select(
      "id, tenant_id, code, catalog_item_id, requester_id, item_name_snapshot, category_name_snapshot, form_data, status, current_stage, total_stages, assignee_id, due_at, submitted_at, completed_at, created_at, updated_at",
    )
    .eq("code", code)
    .maybeSingle();

  if (!req) return null;

  const [{ data: approvals }, { data: comments }, { data: requester }] =
    await Promise.all([
      supabase
        .from("request_approvals")
        .select(
          "id, tenant_id, request_id, stage, approver_kind, approver_id, required_role, decision, decided_by, decided_at, comment, created_at",
        )
        .eq("request_id", req.id)
        .order("stage"),
      supabase
        .from("request_comments")
        .select(
          "id, tenant_id, request_id, author_id, kind, body, is_internal, created_at",
        )
        .eq("request_id", req.id)
        .order("created_at"),
      supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, department, job_title")
        .eq("id", (req as ServiceRequest).requester_id)
        .maybeSingle(),
    ]);

  return {
    request: req as ServiceRequest,
    approvals: (approvals ?? []) as RequestApproval[],
    comments: (comments ?? []) as RequestComment[],
    requester: requester as
      | {
          id: string;
          full_name: string | null;
          email: string;
          avatar_url: string | null;
          department: string | null;
          job_title: string | null;
        }
      | null,
  };
}
