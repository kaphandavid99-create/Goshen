"use client";

import { useEffect, useState } from "react";
import { IconBell, IconCheck } from "@/components/icons";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useT } from "@/lib/i18n/context";
import { PushPermissionError, isPushSupported, subscribeToPush, syncPushSubscriptionToServer } from "@/lib/push/subscribe";

function describeError(err: unknown) {
  if (err instanceof Error && err.message) {
    return `${err.name}: ${err.message}`;
  }
  return String(err);
}

type State = "loading" | "unsupported" | "blocked" | "off" | "on";

export function PushManager() {
  const t = useT();
  const p = t.account.push;
  const [state, setState] = useState<State>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tested, setTested] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!isPushSupported()) {
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
          await syncPushSubscriptionToServer(existing).catch(() => undefined);
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
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      await subscribeToPush();
      setState("on");
    } catch (err) {
      if (err instanceof PushPermissionError) {
        setState(err.permission === "denied" ? "blocked" : "off");
        return;
      }
      setError(`${p.error} (${describeError(err)})`);
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
    } catch (err) {
      setError(`${p.error} (${describeError(err)})`);
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
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(data.error ?? `Server responded ${response.status}`);
      }
      setTested(true);
    } catch (err) {
      setError(`${p.error} (${describeError(err)})`);
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
