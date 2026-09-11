import { isAssistantConfigured } from "@/lib/env";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { clientIp, jsonError } from "@/server/auth/request";
import { resolveOwner } from "@/server/assistant/identity";
import { checkRateLimit } from "@/server/assistant/rate-limit";
import { MAX_AUDIO_BYTES, transcribeAudio } from "@/server/assistant/speech";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  if (!isAssistantConfigured()) {
    return jsonError("The assistant is unavailable right now.", 503);
  }

  const user = await getCurrentUser();
  const owner = await resolveOwner(true);
  const rateKey = `voice:${user?.id ?? owner.anonId ?? clientIp(request) ?? "anonymous"}`;
  const limit = checkRateLimit(rateKey);
  if (!limit.ok) {
    return jsonError(
      "You're sending messages quickly. Give it a minute and try again.",
      429,
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("audio");

  if (!(file instanceof File) || file.size === 0) {
    return jsonError("No audio was recorded.", 400);
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return jsonError("That recording is too long.", 400);
  }

  const locale = String(form?.get("locale") ?? "");

  try {
    const text = await transcribeAudio(file, locale);
    if (!text) {
      return jsonError("Couldn't hear anything in that recording.", 422);
    }
    return Response.json({ text });
  } catch (err) {
    console.error("assistant transcription failed", err);
    return jsonError("Couldn't understand that recording. Please try again.", 502);
  }
}
