import { isCronRequestAuthorized } from "@/lib/env";
import { jsonError } from "@/server/auth/request";
import { runPointsReminders } from "@/server/account/points-reminder";

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return jsonError("Unauthorized.", 401);
  }

  const result = await runPointsReminders();
  return Response.json(result);
}
