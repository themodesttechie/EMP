import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export async function uniqueArticleSlug(
  tenant_id: string,
  base: string,
): Promise<string> {
  const admin = createAdminClient();
  const root = slugify(base) || "article";
  let candidate = root;
  let n = 1;
  while (true) {
    const { data } = await admin
      .from("kb_articles")
      .select("id")
      .eq("tenant_id", tenant_id)
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
    if (n > 200) return `${root}-${Date.now()}`;
  }
}
