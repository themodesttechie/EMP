import "server-only";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/server";
import {
  estimateCostUsd,
  TENANT_MONTHLY_CAP_USD,
  TENANT_MONTHLY_WARN_RATIO,
} from "./models";

export type AIFlow =
  | "triage"
  | "summary"
  | "deflect"
  | "auto_resolve"
  | "rca"
  | "risk_score"
  | "kb_authoring"
  | "sentiment"
  | "breach_predict"
  | "trend_explain"
  | "translate"
  | "kudos_categorize"
  | "other";

export type AIOutcome =
  | "success"
  | "error"
  | "timeout"
  | "rate_limited"
  | "blocked_cap";

export type AIRunInput<T> = {
  tenant_id: string;
  actor_id: string | null;
  flow: AIFlow;
  model: string;
  prompt: string;
  related_entity_type?: string;
  related_entity_id?: string;
  // The actual call. Returns parsed result + token counts.
  fn: () => Promise<{
    result: T;
    tokens_in: number;
    tokens_out: number;
    cache_read_tokens?: number;
    cache_write_tokens?: number;
  }>;
};

export type AIRunResult<T> =
  | { ok: true; data: T; cost_usd: number; warned: boolean }
  | { ok: false; reason: AIOutcome; error?: string };

function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 32);
}

export async function getMonthlySpendUsd(tenant_id: string): Promise<number> {
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("tenant_ai_spend_mtd", {
    p_tenant: tenant_id,
  });
  if (error) {
    console.error("[ai] spend lookup failed:", error.message);
    return 0;
  }
  return Number(data ?? 0);
}

export async function runAI<T>(input: AIRunInput<T>): Promise<AIRunResult<T>> {
  const admin = createAdminClient();
  const promptHash = hashPrompt(input.prompt);

  // Cap check before spending tokens
  const spend = await getMonthlySpendUsd(input.tenant_id);
  const warned = spend >= TENANT_MONTHLY_CAP_USD * TENANT_MONTHLY_WARN_RATIO;
  if (spend >= TENANT_MONTHLY_CAP_USD) {
    await admin.from("ai_actions").insert({
      tenant_id: input.tenant_id,
      actor_id: input.actor_id,
      flow: input.flow,
      model: input.model,
      prompt_hash: promptHash,
      tokens_in: 0,
      tokens_out: 0,
      cost_usd: 0,
      outcome: "blocked_cap",
      error_reason: `Monthly cap of $${TENANT_MONTHLY_CAP_USD} reached`,
      related_entity_type: input.related_entity_type ?? null,
      related_entity_id: input.related_entity_id ?? null,
    });
    return { ok: false, reason: "blocked_cap" };
  }

  const start = Date.now();
  try {
    const r = await input.fn();
    const latency = Date.now() - start;
    const cost = estimateCostUsd({
      model: input.model,
      tokens_in: r.tokens_in,
      tokens_out: r.tokens_out,
      cache_read_tokens: r.cache_read_tokens,
      cache_write_tokens: r.cache_write_tokens,
    });

    await admin.from("ai_actions").insert({
      tenant_id: input.tenant_id,
      actor_id: input.actor_id,
      flow: input.flow,
      model: input.model,
      prompt_hash: promptHash,
      tokens_in: r.tokens_in,
      tokens_out: r.tokens_out,
      cost_usd: cost,
      latency_ms: latency,
      outcome: "success",
      result_json: r.result as unknown as Record<string, unknown>,
      related_entity_type: input.related_entity_type ?? null,
      related_entity_id: input.related_entity_id ?? null,
    });

    return { ok: true, data: r.result, cost_usd: cost, warned };
  } catch (err) {
    const latency = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    const outcome: AIOutcome = /rate.?limit/i.test(message)
      ? "rate_limited"
      : /timeout/i.test(message)
        ? "timeout"
        : "error";

    await admin.from("ai_actions").insert({
      tenant_id: input.tenant_id,
      actor_id: input.actor_id,
      flow: input.flow,
      model: input.model,
      prompt_hash: promptHash,
      tokens_in: 0,
      tokens_out: 0,
      cost_usd: 0,
      latency_ms: latency,
      outcome,
      error_reason: message.slice(0, 500),
      related_entity_type: input.related_entity_type ?? null,
      related_entity_id: input.related_entity_id ?? null,
    });

    return { ok: false, reason: outcome, error: message };
  }
}
