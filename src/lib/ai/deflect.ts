import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { embedTextLogged, toPgVector } from "@/lib/embeddings/embed";

export type DeflectionCandidate = {
  id: string;
  title: string;
  snippet: string;
  source: "kb" | "category";
  slug?: string;
  similarity?: number;
};

export type DeflectionResult = {
  kb_articles: DeflectionCandidate[];
  confidence: number;
};

const DEFAULT_THRESHOLD = Number(
  process.env.KB_DEFLECTION_THRESHOLD || 0.75,
);
const MIN_TEXT_LEN = 30;
const MAX_RESULTS = 3;
const RPC_PREFETCH = 5;

function snippet(body: string, max = 200): string {
  const stripped = body
    .replace(/[#*_`>~]/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length > max ? stripped.slice(0, max).trimEnd() + "…" : stripped;
}

export async function findDeflectionCandidates(opts: {
  tenant_id: string;
  draft_text: string;
  limit?: number;
  threshold?: number;
}): Promise<DeflectionResult> {
  const text = (opts.draft_text || "").trim();
  if (text.length < MIN_TEXT_LEN) return { kb_articles: [], confidence: 0 };

  const threshold = opts.threshold ?? DEFAULT_THRESHOLD;

  const embed = await embedTextLogged({
    tenant_id: opts.tenant_id,
    actor_id: null,
    text,
    related_entity_type: "deflection",
  });
  if (!embed.ok) return { kb_articles: [], confidence: 0 };

  const admin = createAdminClient();
  const { data, error } = await admin.rpc("kb_search_published", {
    p_tenant: opts.tenant_id,
    p_query: toPgVector(embed.embedding),
    p_limit: RPC_PREFETCH,
  });
  if (error) {
    console.error("[ai] deflect kb_search_published failed:", error.message);
    return { kb_articles: [], confidence: 0 };
  }

  type Row = {
    id: string;
    slug: string;
    title: string;
    body: string;
    similarity: number;
  };
  const rows = ((data ?? []) as Row[])
    .map((r) => ({ ...r, similarity: Number(r.similarity) }))
    .filter((r) => r.similarity >= threshold)
    .slice(0, opts.limit ?? MAX_RESULTS);

  if (rows.length === 0) return { kb_articles: [], confidence: 0 };

  return {
    kb_articles: rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      snippet: snippet(r.body),
      source: "kb" as const,
      similarity: Number(r.similarity.toFixed(3)),
    })),
    confidence: Number(rows[0].similarity.toFixed(3)),
  };
}
