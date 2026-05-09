import "server-only";
import { createAdminClient } from "@/lib/supabase/server";

// Deflection candidate (KB stub via ticket_categories — pgvector lands Sprint 6).
export type DeflectionCandidate = {
  id: string;
  title: string;
  snippet: string;
  source: "category" | "kb";
};

export type DeflectionResult = {
  kb_articles: DeflectionCandidate[];
  confidence: number;
};

// Pull category descriptions whose name/description matches the draft text.
// Acceptable bridge while kb_articles + pgvector are not yet shipped.
export async function findDeflectionCandidates(opts: {
  tenant_id: string;
  draft_text: string;
  limit?: number;
}): Promise<DeflectionResult> {
  const text = (opts.draft_text || "").trim();
  if (text.length < 30) return { kb_articles: [], confidence: 0 };

  const admin = createAdminClient();
  // Crude ILIKE match across ticket_categories — kept simple deliberately so the
  // pgvector swap in Sprint 6 only touches the inside of this function.
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 3)
    .slice(0, 6);

  if (tokens.length === 0) return { kb_articles: [], confidence: 0 };

  const orFilter = tokens
    .map((t) => `name.ilike.%${t}%,description.ilike.%${t}%`)
    .join(",");

  const { data } = await admin
    .from("ticket_categories")
    .select("id, slug, name, description")
    .eq("tenant_id", opts.tenant_id)
    .eq("is_active", true)
    .or(orFilter)
    .limit(opts.limit ?? 3);

  const rows = (data ?? []) as Array<{
    id: string;
    slug: string;
    name: string;
    description: string | null;
  }>;

  if (rows.length === 0) return { kb_articles: [], confidence: 0 };

  return {
    kb_articles: rows.map((r) => ({
      id: r.id,
      title: r.name,
      snippet: r.description ?? "",
      source: "category" as const,
    })),
    // Until real KB ships, soft-cap confidence
    confidence: Math.min(0.5, 0.15 + rows.length * 0.1),
  };
}
