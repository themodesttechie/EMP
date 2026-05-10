import "server-only";
import { createClient } from "@/lib/supabase/server";

export type Kudos = {
  id: string;
  tenant_id: string;
  from_user_id: string;
  to_user_id: string;
  message: string;
  public: boolean;
  ai_categorized_value: string | null;
  at: string;
};

export type KudosWithProfiles = Kudos & {
  from_user: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null;
  to_user: { id: string; full_name: string | null; email: string; avatar_url: string | null } | null;
};

const SELECT =
  "id, tenant_id, from_user_id, to_user_id, message, public, ai_categorized_value, at, from_user:profiles!kudos_from_user_id_fkey(id, full_name, email, avatar_url), to_user:profiles!kudos_to_user_id_fkey(id, full_name, email, avatar_url)";

function flatten(rows: unknown[]): KudosWithProfiles[] {
  return (rows as Array<Record<string, unknown>>).map((r) => {
    const fu = Array.isArray(r.from_user) ? r.from_user[0] : r.from_user;
    const tu = Array.isArray(r.to_user) ? r.to_user[0] : r.to_user;
    return {
      ...(r as unknown as Kudos),
      from_user: (fu as KudosWithProfiles["from_user"]) ?? null,
      to_user: (tu as KudosWithProfiles["to_user"]) ?? null,
    };
  });
}

export async function listPublicFeed(opts?: {
  category?: string;
  from_user_id?: string;
  to_user_id?: string;
  limit?: number;
}): Promise<KudosWithProfiles[]> {
  const supabase = await createClient();
  let q = supabase
    .from("kudos")
    .select(SELECT)
    .eq("public", true)
    .order("at", { ascending: false })
    .limit(opts?.limit ?? 100);
  if (opts?.category) q = q.eq("ai_categorized_value", opts.category);
  if (opts?.from_user_id) q = q.eq("from_user_id", opts.from_user_id);
  if (opts?.to_user_id) q = q.eq("to_user_id", opts.to_user_id);
  const { data } = await q;
  return flatten(data ?? []);
}

export async function listToUser(userId: string, limit = 50): Promise<KudosWithProfiles[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kudos")
    .select(SELECT)
    .eq("to_user_id", userId)
    .order("at", { ascending: false })
    .limit(limit);
  return flatten(data ?? []);
}

export async function listFromUser(userId: string, limit = 50): Promise<KudosWithProfiles[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kudos")
    .select(SELECT)
    .eq("from_user_id", userId)
    .order("at", { ascending: false })
    .limit(limit);
  return flatten(data ?? []);
}

export const KUDOS_CATEGORIES = [
  "teamwork",
  "innovation",
  "customer_focus",
  "leadership",
  "technical_excellence",
  "reliability",
  "other",
] as const;

export type KudosCategory = (typeof KUDOS_CATEGORIES)[number];
