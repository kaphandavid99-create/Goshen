import "server-only";

import { env } from "@/lib/env";

/**
 * Minimal client for Groq's OpenAI-compatible Chat Completions API. Only the
 * streaming path the assistant needs is implemented; no SDK dependency.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export type GroqTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

export type GroqToolCall = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
};

export type GroqMessage =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: GroqToolCall[] }
  | { role: "tool"; tool_call_id: string; content: string };

type StreamDelta = {
  content?: string | null;
  tool_calls?: {
    index: number;
    id?: string;
    function?: { name?: string; arguments?: string };
  }[];
};

export type GroqStreamChunk = {
  choices?: { delta?: StreamDelta; finish_reason?: string | null }[];
};

export type GroqRequest = {
  model: string;
  messages: GroqMessage[];
  tools?: GroqTool[];
  temperature?: number;
  max_tokens?: number;
};

/** Stream a chat completion, yielding raw SSE chunks. Throws on a non-2xx response. */
export async function* streamChatCompletion(
  request: GroqRequest,
  signal?: AbortSignal,
): AsyncGenerator<GroqStreamChunk> {
  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${env.groqApiKey}`,
    },
    body: JSON.stringify({ ...request, stream: true }),
    signal,
  });

  if (!response.ok || !response.body) {
    const detail = await response.text().catch(() => "");
    throw new Error(`groq ${response.status}: ${detail.slice(0, 300)}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE frames are separated by a blank line; each carries one or more
    // `data:` lines. Keep the trailing partial frame in the buffer.
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";

    for (const frame of frames) {
      for (const line of frame.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("data:")) continue;
        const data = trimmed.slice(5).trim();
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data) as GroqStreamChunk;
        } catch {
          // keep-alive comment or a split frame — ignore.
        }
      }
    }
  }
}
