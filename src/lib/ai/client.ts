import "server-only";
import Anthropic from "@anthropic-ai/sdk";

export type AIClientResult<T> =
  | { ok: true; client: T }
  | { ok: false; reason: "no_api_key" };

let _client: Anthropic | null = null;

export function getAnthropic(): AIClientResult<Anthropic> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { ok: false, reason: "no_api_key" };
  if (!_client) {
    _client = new Anthropic({ apiKey: key });
  }
  return { ok: true, client: _client };
}

export type ClaudeCallInput = {
  model: string;
  system: string;
  user: string;
  // Mark as cacheable so prompts > ~1024 tokens reuse the prefix
  cache_system?: boolean;
  max_tokens?: number;
  temperature?: number;
};

export type ClaudeCallResult = {
  text: string;
  tokens_in: number;
  tokens_out: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
  raw: unknown;
};

export async function callClaude(
  input: ClaudeCallInput,
): Promise<ClaudeCallResult> {
  const c = getAnthropic();
  if (!c.ok) throw new Error("anthropic_no_api_key");

  const systemBlocks = input.cache_system
    ? [
        {
          type: "text" as const,
          text: input.system,
          cache_control: { type: "ephemeral" as const },
        },
      ]
    : [{ type: "text" as const, text: input.system }];

  const resp = await c.client.messages.create({
    model: input.model,
    max_tokens: input.max_tokens ?? 1024,
    temperature: input.temperature ?? 0.2,
    system: systemBlocks,
    messages: [{ role: "user", content: input.user }],
  });

  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("\n")
    .trim();

  const u = resp.usage as {
    input_tokens: number;
    output_tokens: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
  };

  return {
    text,
    tokens_in: u.input_tokens,
    tokens_out: u.output_tokens,
    cache_read_tokens: u.cache_read_input_tokens,
    cache_write_tokens: u.cache_creation_input_tokens,
    raw: resp,
  };
}
