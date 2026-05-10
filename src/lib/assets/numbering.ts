import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

export async function nextCiNumber(tenant_id: string): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("allocate_ci_number", {
    p_tenant: tenant_id,
  });
  if (error || !data) {
    throw new Error(error?.message || "ci_number_allocation_failed");
  }
  return data as string;
}
