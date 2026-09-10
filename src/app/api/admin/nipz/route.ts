import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { nipzContentSchema } from "@/validators/nipz";

export async function PATCH(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return jsonError("Staff access required.", 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = nipzContentSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Check the cakes-page fields.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const data = { ...parsed.data, titleEm: parsed.data.titleEm ?? "" };

  try {
    await prisma.nipzSettings.upsert({
      where: { id: "nipz" },
      update: data,
      create: { id: "nipz", ...data },
    });
    return Response.json({ ok: true });
  } catch {
    return jsonError("Unable to save the cakes-page content.", 503);
  }
}
