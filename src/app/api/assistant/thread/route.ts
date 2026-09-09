import { resolveOwner } from "@/server/assistant/identity";
import { listThreadMessages } from "@/server/assistant/threads";

export async function GET(request: Request) {
  const threadId =
    new URL(request.url).searchParams.get("threadId") ?? undefined;
  const owner = await resolveOwner(false);
  const messages = await listThreadMessages(threadId, owner);

  return Response.json(
    { messages },
    { headers: { "cache-control": "no-store" } },
  );
}
