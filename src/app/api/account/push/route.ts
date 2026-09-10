import { prisma } from "@/lib/db/prisma";
import { isPushConfigured } from "@/lib/env";
import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { pushSubscriptionSchema } from "@/validators/push";

export const runtime = "nodejs";

function serverError(error: unknown) {
  const detail =
    error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error("push route failed", error);
  return jsonError(detail, 500);
}

// Save (or refresh) the push endpoint for the current device.
export async function POST(request: Request) {
  try {
    if (!(await assertCsrf(request))) {
      return jsonError("Invalid or missing CSRF token.", 403);
    }
    if (!isPushConfigured()) {
      return jsonError("Push notifications are not set up on the server.", 503);
    }

    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Sign in to enable alerts.", 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const parsed = pushSubscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError("That push subscription looks malformed.", 422);
    }

    const { endpoint, keys } = parsed.data;
    const userAgent = request.headers.get("user-agent")?.slice(0, 400) ?? null;

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        userId: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
      update: {
        userId: user.id,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}

// Remove one device's endpoint (called on unsubscribe).
export async function DELETE(request: Request) {
  try {
    if (!(await assertCsrf(request))) {
      return jsonError("Invalid or missing CSRF token.", 403);
    }

    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Sign in to update alerts.", 401);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid request body.", 400);
    }

    const endpoint =
      body && typeof body === "object" && "endpoint" in body
        ? String((body as { endpoint: unknown }).endpoint)
        : "";
    if (!endpoint) {
      return jsonError("Missing endpoint.", 400);
    }

    await prisma.pushSubscription.deleteMany({
      where: { endpoint, userId: user.id },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}

// Send a test alert to the current user's devices.
export async function PUT(request: Request) {
  try {
    if (!(await assertCsrf(request))) {
      return jsonError("Invalid or missing CSRF token.", 403);
    }
    if (!isPushConfigured()) {
      return jsonError("Push notifications are not set up on the server.", 503);
    }

    const user = await getCurrentUser();
    if (!user) {
      return jsonError("Sign in to test alerts.", 401);
    }

    const { sendPushToUser } = await import("@/server/notifications/push");
    await sendPushToUser(user.id, {
      title: "Goshen alerts are on",
      body: "This is how order and reward updates will reach your phone.",
      url: "/account/notifications",
      tag: "push-test",
    });

    return Response.json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}
