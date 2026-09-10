"use client";

import { useCallback, useEffect, useState } from "react";
import { IconBell, IconCheck } from "@/components/icons";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useT } from "@/lib/i18n/context";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

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

type State = "loading" | "unsupported" | "blocked" | "off" | "on";

export function PushManager() {
  const t = useT();
  const p = t.account.push;
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tested, setTested] = useState(false);

  const syncToServer = useCallback(async (sub: PushSubscription) => {
    const json = sub.toJSON();
    await fetch("/api/account/push", {
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (
        typeof window === "undefined" ||
        !("serviceWorker" in navigator) ||
        !("PushManager" in window) ||
        !("Notification" in window) ||
        !VAPID_PUBLIC_KEY
      ) {
        if (!cancelled) setState("unsupported");
        return;
      }

      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        const existing = await registration.pushManager.getSubscription();
        if (cancelled) return;

        if (Notification.permission === "denied") {
          setState("blocked");
          return;
        }
        if (existing) {
          // Keep the server row fresh (endpoints rotate).
          await syncToServer(existing).catch(() => undefined);
          if (!cancelled) setState("on");
          return;
        }
        setState("off");
      } catch {
        if (!cancelled) setState("unsupported");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [syncToServer]);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "off");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      await syncToServer(sub);
      setState("on");
    } catch {
      setError(p.error);
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/account/push", {
          method: "DELETE",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": await readCsrf(),
          },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
      setTested(false);
    } catch {
      setError(p.error);
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/push", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
      });
      if (!response.ok) throw new Error("failed");
      setTested(true);
    } catch {
      setError(p.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card mt-6 p-5">
      <div className="flex items-start gap-3">
        <IconBell className="mt-0.5 size-5 text-primary" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-primary">{p.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{p.blurb}</p>

          {state === "loading" ? (
            <p className="mt-3 text-sm text-muted-foreground">{p.loading}</p>
          ) : null}

          {state === "unsupported" ? (
            <p className="mt-3 text-sm text-muted-foreground">{p.unsupported}</p>
          ) : null}

          {state === "blocked" ? (
            <p className="mt-3 text-sm text-muted-foreground">{p.blocked}</p>
          ) : null}

          {state === "off" ? (
            <button
              type="button"
              onClick={enable}
              disabled={busy}
              className="btn btn-rose mt-3 disabled:opacity-60"
            >
              {busy ? p.working : p.enable}
            </button>
          ) : null}

          {state === "on" ? (
            <div className="mt-3 space-y-3">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                <IconCheck className="size-4" />
                {p.on}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={sendTest}
                  disabled={busy}
                  className="btn btn-outline disabled:opacity-60"
                >
                  {p.test}
                </button>
                <button
                  type="button"
                  onClick={disable}
                  disabled={busy}
                  className="btn-ghost text-sm disabled:opacity-60"
                >
                  {p.disable}
                </button>
              </div>
              {tested ? (
                <p className="text-xs text-muted-foreground">{p.testSent}</p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <p className="mt-3 text-sm text-red-600">{error}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
