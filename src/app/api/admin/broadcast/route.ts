import { prisma } from "@/lib/db/prisma";
import { broadcastNotification } from "@/server/account/notifications";
import { logActivity } from "@/server/admin/activity";
import { assertCsrf } from "@/server/auth/csrf";
import { getCurrentUser } from "@/server/auth/current-user";
import { jsonError } from "@/server/auth/request";
import { adminBroadcastSchema } from "@/validators/admin";

// Only ADMIN (not STAFF) can blast every customer's phone at once.
export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return jsonError("Admin access required.", 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = adminBroadcastSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, parsed.error.flatten().fieldErrors);
  }

  const { title, body: message, href, audience } = parsed.data;

  try {
    const { recipientCount } = await broadcastNotification(prisma, {
      title,
      body: message,
      href: href || null,
      audience,
    });

    await logActivity(prisma, {
      actorId: user.id,
      action: "broadcast_sent",
      entityType: "Broadcast",
      summary: `Sent "${title}" to ${recipientCount} ${audience === "WHOLESALE_CUSTOMERS" ? "wholesale " : ""}customer(s).`,
    });

    return Response.json({ recipientCount });
  } catch (error) {
    console.error("broadcast notification failed", error);
    return jsonError("Unable to send the broadcast. Try again.", 503);
  }
}
