"use client";

import { useEffect, useRef } from "react";
import { isPushSupported, subscribeToPush } from "@/lib/push/subscribe";

/**
 * Silently asks the browser for notification permission the first time a
 * signed-in account loads any page with that permission still undecided —
 * so alerts end up "on" without anyone having to find a settings toggle.
 * Renders nothing. If the browser prompt is denied or dismissed,
 * Notification.permission stops being "default" and this never asks again;
 * the customer can still flip it on later from /account/notifications.
 */
export function PushAutoPrompt() {
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    if (!isPushSupported()) return;
    if (Notification.permission !== "default") return;

    attempted.current = true;
    subscribeToPush().catch(() => {
      // Best effort — a declined or failed prompt just leaves push off.
    });
  }, []);

  return null;
}
