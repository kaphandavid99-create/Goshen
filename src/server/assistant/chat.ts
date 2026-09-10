import "server-only";

import { env, isAssistantConfigured } from "@/lib/env";
import { SYSTEM_PROMPT } from "@/server/assistant/prompt";
import { assistantTools, runTool, type ToolContext } from "@/server/assistant/tools";
import { answerWithRules, genericFallback } from "@/server/assistant/rules";
import {
  streamChatCompletion,
  type GroqMessage,
  type GroqToolCall,
} from "@/server/assistant/groq";
import { saveTurn, type ChatTurn, type ThreadOwner } from "@/server/assistant/threads";

const MAX_ROUNDS = 6;
const MAX_OUTPUT_TOKENS = 1024;

type StreamInput = {
  userMessage: string;
  history: ChatTurn[];
  ctx: ToolContext;
  threadId: string | null;
  owner: ThreadOwner;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function streamAssistantReply(input: StreamInput): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      /** Chunk a ready-made answer so the widget shows a natural typing feel. */
      const streamText = async (text: string) => {
        const pieces = text.split(/(\s+)/);
        let buffer = "";
        for (const piece of pieces) {
          buffer += piece;
          if (buffer.length >= 12) {
            send({ type: "text", delta: buffer });
            buffer = "";
            await sleep(15);
          }
        }
        if (buffer) send({ type: "text", delta: buffer });
      };

      const finish = async (
        assistantText: string,
        toolTrace: { name: string; input: unknown }[],
      ) => {
        const savedThreadId = await saveTurn({
          threadId: input.threadId,
          owner: input.owner,
          userText: input.userMessage,
          assistantText,
          toolTrace,
        });
        send({ type: "done", threadId: savedThreadId ?? input.threadId });
        controller.close();
      };

      /**
       * Backup path — used when the model is not configured, errors before it has
       * streamed any text, or returns nothing usable. The deterministic rules
       * engine handles the common asks for free; `genericFallback` covers the rest.
       */
      const runBackup = async () => {
        let ruleAnswer = null;
        try {
          ruleAnswer = await answerWithRules(input.userMessage, input.ctx);
        } catch (error) {
          console.error("[assistant] rules error", error);
        }

        if (ruleAnswer) {
          for (const call of ruleAnswer.toolTrace) {
            send({ type: "tool", name: call.name });
          }
          await streamText(ruleAnswer.text);
          await finish(ruleAnswer.text, ruleAnswer.toolTrace);
          return;
        }

        const text = genericFallback();
        await streamText(text);
        await finish(text, []);
      };

      if (!isAssistantConfigured()) {
        await runBackup();
        return;
      }

      const messages: GroqMessage[] = [
        { role: "system", content: SYSTEM_PROMPT },
        ...input.history.map(
          (turn): GroqMessage =>
            turn.role === "model"
              ? { role: "assistant", content: turn.text }
              : { role: "user", content: turn.text },
        ),
        { role: "user", content: input.userMessage },
      ];

      const answerParts: string[] = [];
      const toolTrace: { name: string; input: unknown }[] = [];
      let sentText = false;

      try {
        for (let round = 0; round < MAX_ROUNDS; round += 1) {
          const stream = streamChatCompletion({
            model: env.assistantModel,
            messages,
            tools: assistantTools,
            temperature: 0.4,
            max_tokens: MAX_OUTPUT_TOKENS,
          });

          let roundText = "";
          // Tool-call fragments arrive spread across chunks, keyed by index.
          const partial: { id: string; name: string; args: string }[] = [];

          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta;
            if (!delta) continue;

            if (delta.content) {
              roundText += delta.content;
              sentText = true;
              send({ type: "text", delta: delta.content });
            }

            for (const call of delta.tool_calls ?? []) {
              const slot = (partial[call.index] ??= { id: "", name: "", args: "" });
              if (call.id) slot.id = call.id;
              if (call.function?.name) slot.name += call.function.name;
              if (call.function?.arguments) slot.args += call.function.arguments;
            }
          }

          if (roundText.trim()) answerParts.push(roundText.trim());

          const calls = partial.filter((c) => c && c.name);
          const toolCalls: GroqToolCall[] = calls.map((c) => ({
            id: c.id,
            type: "function",
            function: { name: c.name, arguments: c.args || "{}" },
          }));

          messages.push({
            role: "assistant",
            content: roundText || null,
            ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
          });

          if (!toolCalls.length) break;

          for (const call of calls) {
            send({ type: "tool", name: call.name });
            let args: Record<string, unknown> = {};
            try {
              args = call.args ? (JSON.parse(call.args) as Record<string, unknown>) : {};
            } catch {
              // Model emitted invalid JSON args — run the tool with none.
            }
            const output = await runTool(call.name, args, input.ctx);
            toolTrace.push({ name: call.name, input: args });
            messages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(output),
            });
          }
        }

        const assistantText = answerParts.join("\n\n");

        if (!assistantText) {
          // The model produced no usable text. If nothing has reached the client
          // yet, hand off to the backup engine; otherwise close politely.
          if (!sentText) {
            await runBackup();
          } else {
            const text =
              "Sorry, I couldn't finish that thought. Try rephrasing, or contact the shop on WhatsApp.";
            await streamText(text);
            await finish(text, toolTrace);
          }
          return;
        }

        await finish(assistantText, toolTrace);
      } catch (error) {
        console.error("[assistant] groq error", error);

        // Clean failure before any text was streamed — fall back silently.
        if (!sentText) {
          await runBackup();
          return;
        }

        send({
          type: "error",
          message:
            "The assistant hit a problem. Please try again in a moment, or contact the shop on WhatsApp.",
        });
        if (answerParts.length) {
          await saveTurn({
            threadId: input.threadId,
            owner: input.owner,
            userText: input.userMessage,
            assistantText: answerParts.join("\n\n"),
            toolTrace,
          }).catch(() => null);
        }
        controller.close();
      }
    },
  });
}
