import { prisma } from "@/lib/db/prisma";
import { getCurrentUser, isStaffRole } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { adminTestimonialPatchSchema } from "@/validators/admin";

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
  const parsed = adminTestimonialPatchSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Choose whether to show this testimonial.", 400);
  }

  try {
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { published: parsed.data.published },
      select: { id: true, published: true },
    });
    return Response.json({ testimonial });
  } catch {
    return jsonError("Unable to update this testimonial.", 503);
  }
}