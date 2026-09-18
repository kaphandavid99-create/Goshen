"use client";

import { useEffect, useRef, useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { cartCount, useCartStore } from "@/stores/cart-store";

/**
 * Mirrors the signed-in customer's cart item count to the server (debounced),
 * purely so the cart-reminder cron can tell an idle cart from an active one —
 * see /api/account/cart-sync and server/orders/cart-reminders. Renders
 * nothing; mounted only for signed-in users (push reminders require an
 * account) alongside PushAutoPrompt in the site header.
 */
export function CartSync() {
  const items = useCartStore((state) => state.items);
  // `.persist` only exists once this module has evaluated in the browser —
  // its default storage lookup throws server-side, where there's no
  // `window`, so the SSR render must not touch it.
  const [hydrated, setHydrated] = useState(() =>
    typeof window === "undefined" ? false : useCartStore.persist.hasHydrated(),
  );
  const lastSynced = useRef<number | null>(null);

  useEffect(() => {
    if (hydrated) return;
    return useCartStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;

    const count = cartCount(items);
    if (lastSynced.current === count) return;

    const timer = setTimeout(() => {
      lastSynced.current = count;
      void syncCart(count);
    }, 1500);

    return () => clearTimeout(timer);
  }, [hydrated, items]);

  return null;
}

async function syncCart(itemCount: number) {
  try {
    const token = await readCsrf();

    if (itemCount < 1) {
      await fetch("/api/account/cart-sync", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "x-csrf-token": token },
      });
      return;
    }

    await fetch("/api/account/cart-sync", {
      method: "PUT",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": token,
      },
      body: JSON.stringify({ itemCount }),
    });
  } catch {
    // Best-effort — a failed sync just means a possibly-stale reminder later.
  }
}
