// Goshen service worker — delivers Web Push alerts to the device even when no
// Goshen tab is open. Kept deliberately small; there is no offline caching here.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data && event.data.text() };
  }

  const title = payload.title || "Goshen";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/logo.png",
    badge: payload.badge || "/logo.png",
    tag: payload.tag || undefined,
    renotify: Boolean(payload.tag),
    vibrate: [90, 40, 90],
    data: { url: payload.url || "/account/notifications" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const url = new URL(client.url);
          if (url.origin === self.location.origin && "focus" in client) {
            client.focus();
            if ("navigate" in client) {
              client.navigate(target);
            }
            return;
          }
        }
        return self.clients.openWindow(target);
      }),
  );
});
