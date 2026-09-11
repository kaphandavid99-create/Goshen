import "server-only";

import { env } from "@/lib/env";

/**
 * Speech-to-text for the shop assistant, so customers who struggle to type
 * or spell can speak their question instead. Uses Groq's OpenAI-compatible
 * Whisper endpoint — same account and API key as the chat model.
 */

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

/** A few minutes of speech is plenty for a shop question; keeps abuse cheap. */
export const MAX_AUDIO_BYTES = 15 * 1024 * 1024;

export async function transcribeAudio(file: File, locale?: string): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name || "voice-message.webm");
  form.append("model", env.transcribeModel);
  form.append("response_format", "json");
  if (locale === "fr" || locale === "en") {
    form.append("language", locale);
  }

  const response = await fetch(GROQ_TRANSCRIBE_URL, {
    method: "POST",
    headers: { authorization: `Bearer ${env.groqApiKey}` },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`groq transcription ${response.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await response.json()) as { text?: string };
  return (data.text ?? "").trim();
}
