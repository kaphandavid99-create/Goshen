import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { cakeBookingStatusSchema } from "@/validators/cakes";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return jsonError("Staff access required.", 403);
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = cakeBookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Pick a valid status.", 400);
  }

  try {
    const booking = await prisma.cakeBooking.update({
      where: { id },
      data: { status: parsed.data.status },
    });
    return Response.json({ booking: { id: booking.id, status: booking.status } });
  } catch {
    return jsonError("Booking not found.", 404);
  }
}
