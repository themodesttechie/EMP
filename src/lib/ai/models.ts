// Pinned model IDs. Override via env if needed.
export const MODEL_SONNET =
  process.env.ANTHROPIC_MODEL_SONNET || "claude-sonnet-4-6";
export const MODEL_HAIKU =
  process.env.ANTHROPIC_MODEL_HAIKU || "claude-haiku-4-5-20251001";

// Per-million-token published rates (USD). Approximate; refresh periodically.
// Used only for the cost cap accounting in ai_actions.cost_usd.
type Rate = { input: number; output: number; cache_write?: number; cache_read?: number };

const RATES: Record<string, Rate> = {
  // Sonnet 4.6 reference pricing (per 1M tokens)
  "claude-sonnet-4-6": { input: 3, output: 15, cache_write: 3.75, cache_read: 0.3 },
  // Haiku 4.5 reference pricing (per 1M tokens)
  "claude-haiku-4-5-20251001": { input: 1, output: 5, cache_write: 1.25, cache_read: 0.1 },
};

export function estimateCostUsd(opts: {
  model: string;
  tokens_in: number;
  tokens_out: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
}): number {
  const r = RATES[opts.model];
  if (!r) {
    // Conservative fallback: charge as Sonnet when unknown
    const fb = RATES[MODEL_SONNET] ?? RATES["claude-sonnet-4-6"];
    return (
      (opts.tokens_in / 1_000_000) * fb.input +
      (opts.tokens_out / 1_000_000) * fb.output
    );
  }
  let cost =
    (opts.tokens_in / 1_000_000) * r.input +
    (opts.tokens_out / 1_000_000) * r.output;
  if (opts.cache_read_tokens && r.cache_read) {
    cost += (opts.cache_read_tokens / 1_000_000) * r.cache_read;
  }
  if (opts.cache_write_tokens && r.cache_write) {
    cost += (opts.cache_write_tokens / 1_000_000) * r.cache_write;
  }
  return Number(cost.toFixed(6));
}

export const TENANT_MONTHLY_CAP_USD = Number(
  process.env.AI_TENANT_MONTHLY_CAP_USD || 200,
);
export const TENANT_MONTHLY_WARN_RATIO = 0.8;
