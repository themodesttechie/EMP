import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { embedArticle } from "./embed";

const BATCH_SIZE = 10;
const PER_CALL_DELAY_MS = 200;

export type EmbedAllResult = {
  attempted: number;
  succeeded: number;
  failed: number;
  errors: string[];
};

export async function embedAllPending(): Promise<EmbedAllResult> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("kb_articles")
    .select("id")
    .is("embedding", null)
    .in("state", ["draft", "in_review", "published"])
    .limit(BATCH_SIZE);
  if (error) {
    return { attempted: 0, succeeded: 0, failed: 0, errors: [error.message] };
  }

  const rows = (data ?? []) as Array<{ id: string }>;
  const result: EmbedAllResult = {
    attempted: rows.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  for (const row of rows) {
    const r = await embedArticle(row.id);
    if (r.ok) result.succeeded += 1;
    else {
      result.failed += 1;
      if (r.reason) result.errors.push(`${row.id}:${r.reason}`);
    }
    await new Promise((res) => setTimeout(res, PER_CALL_DELAY_MS));
  }
  return result;
}
