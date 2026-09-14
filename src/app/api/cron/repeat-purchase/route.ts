import { isCronRequestAuthorized } from "@/lib/env";
import { jsonError } from "@/server/auth/request";
import { runRepeatPurchaseSuggestions } from "@/server/orders/repeat-purchase";

export async function GET(request: Request) {
  if (!isCronRequestAuthorized(request)) {
    return jsonError("Unauthorized.", 401);
  }

  const result = await runRepeatPurchaseSuggestions();
  return Response.json(result);
}
