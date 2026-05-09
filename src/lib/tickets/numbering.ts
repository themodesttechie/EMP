import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

export async function nextTicketNumber(tenant_id: string): Promise<string> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("allocate_ticket_number", {
    p_tenant: tenant_id,
  });
  if (error || !data) {
    throw new Error(error?.message || "ticket_number_allocation_failed");
  }
  return data as string;
}
