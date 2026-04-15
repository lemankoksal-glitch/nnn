/**
 * Model adapter interface + implementations.
 *
 * The adapter pattern decouples the route from a specific LLM provider.
 * Swap adapters by changing the ANTHROPIC_API_KEY env var or extending the
 * createAdapter factory.
 *
 * Environment variables (set in .env.local — never commit):
 *   ANTHROPIC_API_KEY   →  Activates AnthropicAdapter (claude-haiku-4-5-20251001)
 *   (unset)             →  Falls back to MockAdapter (no HTTP, deterministic)
 */

// ─── Interface ────────────────────────────────────────────────────────────────

export interface ModelMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ModelCompletionInput {
  /** System-level instruction */
  system: string;
  /** Conversation turns */
  messages: ModelMessage[];
  /** Max tokens to generate */
  maxTokens: number;
}

export interface ModelCompletionOutput {
  /** Raw text returned by the model */
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export interface ModelAdapter {
  /** Human-readable model identifier surfaced in ChatResponse.model */
  readonly name: string;
  complete(input: ModelCompletionInput): Promise<ModelCompletionOutput>;
}

// ─── Anthropic adapter ────────────────────────────────────────────────────────

/**
 * Uses the Anthropic Messages API (claude-haiku-4-5-20251001).
 * Requires ANTHROPIC_API_KEY and @anthropic-ai/sdk to be installed.
 */
export class AnthropicAdapter implements ModelAdapter {
  readonly name = "claude-haiku-4-5-20251001";

  async complete(input: ModelCompletionInput): Promise<ModelCompletionOutput> {
    // Dynamic import keeps this adapter tree-shakeable when unused
    // and avoids build errors when the SDK is not installed.
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: input.maxTokens,
      system: input.system,
      messages: input.messages,
    });

    const first = response.content[0];
    const text = first.type === "text" ? first.text : "";

    return {
      text,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    };
  }
}

// ─── Mock adapter ─────────────────────────────────────────────────────────────

/**
 * Deterministic no-op adapter used when ANTHROPIC_API_KEY is not set.
 * Returns `null` for every message slot, signalling the route to keep the
 * brain's original canned text unchanged.
 */
export class MockAdapter implements ModelAdapter {
  readonly name = "mock";

  async complete(input: ModelCompletionInput): Promise<ModelCompletionOutput> {
    // Parse how many messages the caller wants enriched, return nulls for all
    try {
      const userContent = input.messages[input.messages.length - 1]?.content ?? "{}";
      const payload = JSON.parse(userContent) as { messages?: unknown[] };
      const count = Array.isArray(payload.messages) ? payload.messages.length : 0;
      const nulls = Array.from<null>({ length: count }).fill(null);
      return { text: JSON.stringify(nulls), inputTokens: 0, outputTokens: 0 };
    } catch {
      return { text: "[]", inputTokens: 0, outputTokens: 0 };
    }
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Returns the best available adapter.
 * Priority: AnthropicAdapter (if key set) → MockAdapter
 */
export function createAdapter(): ModelAdapter {
  if (process.env.ANTHROPIC_API_KEY) {
    return new AnthropicAdapter();
  }
  return new MockAdapter();
}
