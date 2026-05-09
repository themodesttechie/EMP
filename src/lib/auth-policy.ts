import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

export type TenantAuthPolicy = {
  slug: string;
  name: string;
  allow_password: boolean;
  allow_aad: boolean;
  require_aad: boolean;
  aad_tenant_id: string | null;
};

const DEFAULT_POLICY: TenantAuthPolicy = {
  slug: "ifbash",
  name: "ifBash",
  allow_password: true,
  allow_aad: false,
  require_aad: false,
  aad_tenant_id: null,
};

/**
 * Resolve auth policy for a tenant slug. Used by /signin server component to
 * decide which provider buttons to render. Goes through service role because
 * the caller is unauthenticated.
 */
export async function getTenantAuthPolicy(slug: string): Promise<TenantAuthPolicy> {
  if (!slug) return DEFAULT_POLICY;
  try {
    const admin = createAdminClient();
    const { data } = await admin.rpc("tenant_policy_for_slug", { p_slug: slug });
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { ...DEFAULT_POLICY, slug };
    return {
      slug: row.slug,
      name: row.name,
      allow_password: row.allow_password ?? true,
      allow_aad: row.allow_aad ?? false,
      require_aad: row.require_aad ?? false,
      aad_tenant_id: row.aad_tenant_id ?? null,
    };
  } catch {
    return { ...DEFAULT_POLICY, slug };
  }
}

export function defaultTenantSlug() {
  return process.env.DEFAULT_TENANT_SLUG || "ifbash";
}
