import "server-only";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { AppRole, Profile } from "@/lib/auth";

export type AnnouncementAudience =
  | { all: true }
  | {
      all?: false;
      departments?: string[];
      roles?: AppRole[];
      user_ids?: string[];
    };

export type Announcement = {
  id: string;
  tenant_id: string;
  title: string;
  body_md: string;
  body_translated: Record<string, string>;
  audience: AnnouncementAudience;
  category: string;
  pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
  author_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AnnouncementWithRead = Announcement & {
  read: boolean;
  body_for_user: string;
};

const COLS =
  "id, tenant_id, title, body_md, body_translated, audience, category, pinned, published_at, expires_at, author_id, created_at, updated_at";

export function resolveAudience(
  audience: AnnouncementAudience | null | undefined,
  user: Pick<Profile, "id" | "role" | "department">,
): boolean {
  if (!audience) return false;
  if ("all" in audience && audience.all) return true;
  const a = audience as Exclude<AnnouncementAudience, { all: true }>;
  if (a.user_ids?.length && a.user_ids.includes(user.id)) return true;
  if (a.roles?.length && a.roles.includes(user.role)) return true;
  if (a.departments?.length && user.department && a.departments.includes(user.department)) return true;
  return false;
}

export function bodyForLocale(
  ann: Pick<Announcement, "body_md" | "body_translated">,
  locale: string | null | undefined,
): string {
  const lc = (locale ?? "en").toLowerCase();
  if (lc === "en") return ann.body_md;
  const t = ann.body_translated?.[lc];
  return t && t.length > 0 ? t : ann.body_md;
}

export async function listForUser(
  user: Pick<Profile, "id" | "role" | "department" | "locale" | "tenant_id"> & { locale?: string | null },
  opts?: { category?: string; includeExpired?: boolean },
): Promise<AnnouncementWithRead[]> {
  const supabase = await createClient();
  let q = supabase
    .from("announcements")
    .select(COLS)
    .not("published_at", "is", null)
    .order("pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(200);

  if (opts?.category) q = q.eq("category", opts.category);
  if (!opts?.includeExpired) {
    q = q.or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
  }

  const { data: rows } = await q;
  const all = (rows ?? []) as Announcement[];
  const visible = all.filter((a) => resolveAudience(a.audience, user));

  if (visible.length === 0) return [];

  const { data: reads } = await supabase
    .from("announcement_reads")
    .select("announcement_id")
    .eq("user_id", user.id)
    .in(
      "announcement_id",
      visible.map((a) => a.id),
    );
  const readSet = new Set((reads ?? []).map((r: { announcement_id: string }) => r.announcement_id));

  return visible.map((a) => ({
    ...a,
    read: readSet.has(a.id),
    body_for_user: bodyForLocale(a, user.locale),
  }));
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("announcements").select(COLS).eq("id", id).maybeSingle();
  return (data as Announcement | null) ?? null;
}

export async function listPendingTranslations(): Promise<
  Array<{ id: string; tenant_id: string; body_md: string; body_translated: Record<string, string>; missing: string[] }>
> {
  const admin = createAdminClient();
  // Find published announcements with at least one missing locale relative to tenant defaults
  const { data } = await admin
    .from("announcements")
    .select("id, tenant_id, body_md, body_translated")
    .not("published_at", "is", null)
    .limit(200);
  const rows = (data ?? []) as Array<{
    id: string;
    tenant_id: string;
    body_md: string;
    body_translated: Record<string, string> | null;
  }>;

  const targetLocales = (process.env.WORKPLACE_TARGET_LOCALES || "hi,te")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  return rows
    .map((r) => {
      const have = r.body_translated ?? {};
      const missing = targetLocales.filter((l) => !have[l] || have[l].length === 0);
      return { ...r, body_translated: have, missing };
    })
    .filter((r) => r.missing.length > 0);
}
