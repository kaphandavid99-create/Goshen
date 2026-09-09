import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/server/account/notifications";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { wholesaleApplicationSchema } from "@/validators/wholesale";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to apply for a wholesale account.", 401);
  }

  if (user.wholesaleStatus === "APPROVED") {
    return jsonError("Your wholesale account is already approved.", 409);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = wholesaleApplicationSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Check the highlighted fields.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = {
    businessName: parsed.data.businessName,
    businessType: parsed.data.businessType,
    phone: parsed.data.phone,
    location: parsed.data.location,
    note: parsed.data.note?.trim() || null,
    status: "PENDING" as const,
    reviewedAt: null,
  };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.wholesaleApplication.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...data },
        update: data,
      });
      await tx.user.update({
        where: { id: user.id },
        data: { wholesaleStatus: "PENDING" },
      });
      await createNotification(tx, {
        userId: user.id,
        title: "Wholesale application received",
        body: "The shop will review your details and get back to you shortly.",
        href: "/wholesale",
      });
    });

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return jsonError("Unable to submit the application. Try again.", 503);
  }
}
