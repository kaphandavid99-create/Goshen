import { readCsrf } from "@/lib/auth/csrf-client";

const VAPID_PUBLIC_KEY = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "")
  .trim()
  .replace(/^["']|["']$/g, "");

export class PushPermissionError extends Error {
  constructor(public permission: NotificationPermission) {
    super(`Notification permission was ${permission}`);
    this.name = "PushPermissionError";
  }
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    Boolean(VAPID_PUBLIC_KEY)
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function sameKey(a: ArrayBuffer | null | undefined, b: Uint8Array) {
  if (!a) return false;
  const view = new Uint8Array(a);
  return view.length === b.length && view.every((byte, i) => byte === b[i]);
}

export async function syncPushSubscriptionToServer(sub: PushSubscription) {
  const json = sub.toJSON();
  const response = await fetch("/api/account/push", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      "x-csrf-token": await readCsrf(),
    },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: {
        p256dh: json.keys?.p256dh ?? "",
        auth: json.keys?.auth ?? "",
      },
    }),
  });
  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(data.error ?? `Server responded ${response.status}`);
  }
}

/**
 * Request the browser's notification permission (if not already decided),
 * subscribe to push, and sync the subscription to the server. Throws
 * PushPermissionError if the customer denies/dismisses the browser prompt —
 * that's a decision only they can make, no site can override it.
 */
export async function subscribeToPush(): Promise<PushSubscription> {
  if (Notification.permission !== "granted") {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new PushPermissionError(permission);
    }
  }

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
    updateViaCache: "none",
  });
  await navigator.serviceWorker.ready;

  const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

  // Reuse an existing subscription, but drop it first if it was made with a
  // different VAPID key (otherwise subscribe() throws InvalidStateError).
  let sub = await registration.pushManager.getSubscription();
  if (sub && !sameKey(sub.options.applicationServerKey, applicationServerKey)) {
    await sub.unsubscribe();
    sub = null;
  }
  if (!sub) {
    sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });
  }

  await syncPushSubscriptionToServer(sub);
  return sub;
}
