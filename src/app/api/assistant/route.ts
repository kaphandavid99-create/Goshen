import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { clientIp, jsonError } from "@/server/auth/request";
import { streamAssistantReply } from "@/server/assistant/chat";
import { resolveOwner } from "@/server/assistant/identity";
import { checkRateLimit } from "@/server/assistant/rate-limit";
import { loadThread } from "@/server/assistant/threads";
import { assistantMessageSchema } from "@/validators/assistant";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = assistantMessageSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Type a shorter message.", 400);
  }

  const user = await getCurrentUser();
  const owner = await resolveOwner(true);

  const rateKey =
    user?.id ?? owner.anonId ?? clientIp(request) ?? "anonymous";
  const limit = checkRateLimit(rateKey);
  if (!limit.ok) {
    return jsonError(
      "You're sending messages quickly. Give it a minute and try again.",
      429,
    );
  }

  const { threadId, history } = await loadThread(parsed.data.threadId, owner);

  const stream = streamAssistantReply({
    userMessage: parsed.data.message,
    history,
    ctx: { userId: user?.id ?? null },
    threadId,
    owner,
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store, no-transform",
    },
  });
}
