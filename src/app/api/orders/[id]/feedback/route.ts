import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { submitOrderFeedback } from "@/server/feedback/submit";
import { orderFeedbackSchema } from "@/validators/feedback";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to leave feedback.", 401);
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = orderFeedbackSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, parsed.error.flatten().fieldErrors);
  }

  try {
    await submitOrderFeedback(user.id, id, parsed.data);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return jsonError("Order not found.", 404);
    }
    if (error instanceof Error && error.message === "NOT_RECEIVED") {
      return jsonError("Confirm that you received the order first.", 409);
    }
    return jsonError("Unable to save your feedback.", 503);
  }
}
