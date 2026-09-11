"use client";

import { useEffect, useState } from "react";

const POLL_MS = 45_000;

/**
 * Unread notification count, seeded from the server render and kept fresh
 * with a light poll + a refresh whenever the tab regains focus — the same
 * lightweight pattern used for payment-status polling elsewhere.
 */
export function useUnreadNotifications(initialCount: number) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      try {
        const res = await fetch("/api/account/notifications", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (!cancelled && typeof data.count === "number") setCount(data.count);
      } catch {
        /* best-effort */
      }
    }

    const id = setInterval(() => void refresh(), POLL_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return count;
}

/** Small count pill — drop inside a `relative` wrapper around a user icon. */
export function NotificationBadge({ initialCount }: { initialCount: number }) {
  const count = useUnreadNotifications(initialCount);
  if (count <= 0) return null;

  return (
    <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
      {count > 9 ? "9+" : count}
    </span>
  );
}
