import "server-only";

import {
  GoogleGenAI,
  type Content,
  type GenerateContentResponse,
  type Part,
} from "@google/genai";
import { env, isAssistantConfigured } from "@/lib/env";
import { SYSTEM_PROMPT } from "@/server/assistant/prompt";
import { assistantTools, runTool, type ToolContext } from "@/server/assistant/tools";
import { answerWithRules, genericFallback } from "@/server/assistant/rules";
import { saveTurn, type ChatTurn, type ThreadOwner } from "@/server/assistant/threads";

const MAX_ROUNDS = 6;
const MAX_OUTPUT_TOKENS = 1024;

let ai: GoogleGenAI | null = null;
function client() {
  if (!ai) ai = new GoogleGenAI({ apiKey: env.geminiApiKey });
  return ai;
}

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
       * Backup path — used when Gemini is not configured, errors before it has
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

      const contents: Content[] = [
        ...input.history.map((turn) => ({
          role: turn.role,
          parts: [{ text: turn.text }],
        })),
        { role: "user", parts: [{ text: input.userMessage }] },
      ];

      const answerParts: string[] = [];
      const toolTrace: { name: string; input: unknown }[] = [];
      let sentText = false;

      try {
        for (let round = 0; round < MAX_ROUNDS; round += 1) {
          const stream = await client().models.generateContentStream({
            model: env.assistantModel,
            contents,
            config: {
              systemInstruction: SYSTEM_PROMPT,
              tools: [{ functionDeclarations: assistantTools }],
              temperature: 0.4,
              maxOutputTokens: MAX_OUTPUT_TOKENS,
              thinkingConfig: { thinkingBudget: 0 },
            },
          });

          let roundText = "";
          const calls: { name: string; args: Record<string, unknown> }[] = [];

          for await (const chunk of stream as AsyncGenerator<GenerateContentResponse>) {
            const delta = chunk.text;
            if (delta) {
              roundText += delta;
              sentText = true;
              send({ type: "text", delta });
            }
            for (const call of chunk.functionCalls ?? []) {
              if (call.name) calls.push({ name: call.name, args: call.args ?? {} });
            }
          }

          if (roundText.trim()) answerParts.push(roundText.trim());

          const modelParts: Part[] = [];
          if (roundText) modelParts.push({ text: roundText });
          for (const call of calls) {
            modelParts.push({ functionCall: { name: call.name, args: call.args } });
          }
          contents.push({ role: "model", parts: modelParts });

          if (!calls.length) break;

          const responseParts: Part[] = [];
          for (const call of calls) {
            send({ type: "tool", name: call.name });
            const output = await runTool(call.name, call.args, input.ctx);
            toolTrace.push({ name: call.name, input: call.args });
            responseParts.push({
              functionResponse: {
                name: call.name,
                response: { result: output },
              },
            });
          }
          contents.push({ role: "user", parts: responseParts });
        }

        const assistantText = answerParts.join("\n\n");

        if (!assistantText) {
          // Gemini produced no usable text. If nothing has reached the client
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
        console.error("[assistant] gemini error", error);

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
