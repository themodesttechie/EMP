import "server-only";
import OpenAI from "openai";

export const EMBEDDINGS_MODEL =
  process.env.EMBEDDINGS_MODEL || "text-embedding-3-small";
export const EMBEDDINGS_DIM = Number(process.env.EMBEDDINGS_DIM || 1536);

export type EmbeddingsClientResult =
  | { ok: true; client: OpenAI }
  | { ok: false; reason: "no_api_key" };

let _client: OpenAI | null = null;

export function getOpenAI(): EmbeddingsClientResult {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { ok: false, reason: "no_api_key" };
  if (!_client) {
    _client = new OpenAI({ apiKey: key });
  }
  return { ok: true, client: _client };
}
