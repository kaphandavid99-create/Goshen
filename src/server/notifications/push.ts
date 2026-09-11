import "server-only";

import type WebPush from "web-push";
import { prisma } from "@/lib/db/prisma";
import { env, isPushConfigured } from "@/lib/env";

export async function hasPushSubscription(userId: string) {
  const count = await prisma.pushSubscription.count({ where: { userId } });
  return count > 0;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string | null;
  tag?: string | null;
};

let webpushModule: typeof WebPush | null = null;
let vapidReady = false;

// web-push pulls in Node-only deps; load it lazily so a problem loading it can
// only ever affect an actual send, never a route that merely imports this file.
async function getWebPush() {
  if (!isPushConfigured()) {
    return null;
  }
  if (!webpushModule) {
    webpushModule = (await import("web-push")).default;
  }
  if (!vapidReady) {
    webpushModule.setVapidDetails(
      env.vapidSubject,
      env.vapidPublicKey,
      env.vapidPrivateKey,
    );
    vapidReady = true;
  }
  return webpushModule;
}

// Fan a notification out to every device the user has subscribed. Best effort:
// failures never bubble up to the caller, and endpoints the push service has
// retired (404/410) are pruned so they don't pile up.
export async function sendPushToUser(userId: string, payload: PushPayload) {
  const webpush = await getWebPush();
  if (!webpush) {
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });
  if (subscriptions.length === 0) {
    return;
  }

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url ?? "/account/notifications",
    tag: payload.tag ?? undefined,
    icon: "/logo.png",
    badge: "/logo.png",
  });

  const stale: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
          { timeout: 4000 },
        );
      } catch (error) {
        const status =
          error && typeof error === "object" && "statusCode" in error
            ? (error as { statusCode?: number }).statusCode
            : undefined;
        if (status === 404 || status === 410) {
          stale.push(sub.endpoint);
        } else {
          console.error("push send failed", status ?? error);
        }
      }
    }),
  );

  if (stale.length > 0) {
    await prisma.pushSubscription
      .deleteMany({ where: { endpoint: { in: stale } } })
      .catch(() => undefined);
  }
}
