import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { createCakeBooking } from "@/server/cakes/create-booking";
import { cakeBookingSchema } from "@/validators/cakes";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = cakeBookingSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Check the highlighted fields.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const user = await getCurrentUser();

  try {
    const booking = await createCakeBooking(user?.id ?? null, parsed.data);
    return Response.json(
      { booking: { reference: booking.reference } },
      { status: 201 },
    );
  } catch {
    return jsonError(
      "Unable to save the booking right now. Try WhatsApp or call the shop.",
      503,
    );
  }
}
