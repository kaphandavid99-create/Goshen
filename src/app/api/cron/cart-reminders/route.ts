import { isCronRequestAuthorized } from "@/lib/env";
import { jsonError } from "@/server/auth/request";
import { runCartReminders } from "@/server/orders/cart-reminders";

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return jsonError("Unauthorized.", 401);
  }

  const result = await runCartReminders();
  return Response.json(result);
}
