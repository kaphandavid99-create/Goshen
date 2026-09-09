import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/server/account/notifications";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { wholesaleReviewSchema } from "@/validators/wholesale";

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
  const parsed = wholesaleReviewSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Choose approve or reject.", 400);
  }

  const application = await prisma.wholesaleApplication.findUnique({
    where: { id },
    select: { id: true, userId: true, businessName: true },
  });
  if (!application) {
    return jsonError("Application not found.", 404);
  }

  const { status } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.wholesaleApplication.update({
        where: { id },
        data: { status, reviewedAt: new Date() },
      });
      await tx.user.update({
        where: { id: application.userId },
        data: { wholesaleStatus: status },
      });
      await createNotification(tx, {
        userId: application.userId,
        title:
          status === "APPROVED"
            ? "Wholesale account approved"
            : "Wholesale application update",
        body:
          status === "APPROVED"
            ? "You can now shop wholesale pricing at /wholesale."
            : "Your wholesale application was not approved this time. Contact the shop for details.",
        href: "/wholesale",
      });
    });

    return Response.json({ ok: true });
  } catch {
    return jsonError("Unable to update the application.", 503);
  }
}
