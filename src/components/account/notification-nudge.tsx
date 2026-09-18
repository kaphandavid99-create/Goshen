"use client";

import { useEffect, useState } from "react";
import { IconBell } from "@/components/icons";
import { useT } from "@/lib/i18n/context";
import {
  PushPermissionError,
  isPushSupported,
  subscribeToPush,
} from "@/lib/push/subscribe";

type State = "checking" | "hidden" | "off" | "blocked";

/**
 * Dashboard banner nudging a signed-in customer to turn on notifications.
 * Hidden while we're checking, once alerts are already on, or when this
 * browser can't show them at all — it only speaks up when there's something
 * the customer can actually do. Disappears for good the moment they enable it.
 */
export function NotificationNudge() {
  const t = useT();
  const p = t.account.push;
  const [state, setState] = useState<State>("checking");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!isPushSupported()) {
        if (!cancelled) setState("hidden");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setState("blocked");
        return;
      }
      if (Notification.permission === "granted") {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
            updateViaCache: "none",
          });
          const existing = await registration.pushManager.getSubscription();
          if (!cancelled) setState(existing ? "hidden" : "off");
        } catch {
          if (!cancelled) setState("off");
        }
        return;
      }
      if (!cancelled) setState("off");
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setBusy(true);
    try {
      await subscribeToPush();
      setState("hidden");
    } catch (err) {
      if (err instanceof PushPermissionError) {
        setState(err.permission === "denied" ? "blocked" : "off");
        return;
      }
    } finally {
      setBusy(false);
    }
  }

  if (state === "checking" || state === "hidden") return null;

  return (
    <section className="card mb-6 p-5">
      <div className="flex items-start gap-3">
        <IconBell className="mt-0.5 size-5 text-primary" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-primary">{p.nudge.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{p.nudge.body}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {state === "blocked" ? p.blocked : p.nudge.steps}
          </p>
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
        </div>
      </div>
    </section>
  );
}
