import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { heroContentSchema } from "@/validators/hero";

export async function PATCH(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
    return jsonError("Staff access required.", 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = heroContentSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError(
      "Check the hero fields.",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const { rotatingLines, ...text } = parsed.data;

  try {
    await prisma.heroSettings.upsert({
      where: { id: "hero" },
      update: { ...text, rotatingLines },
      create: { id: "hero", ...text, rotatingLines },
    });
    return Response.json({ ok: true });
  } catch {
    return jsonError("Unable to save the hero content.", 503);
  }
}
