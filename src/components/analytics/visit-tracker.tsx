"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Fires a page-view beacon on first load and every client-side navigation,
 * so the admin dashboard can show how many people are visiting the shop.
 * The admin area itself is never tracked. Best-effort: failures are silent
 * and never affect the page.
 */
export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    try {
      const body = JSON.stringify({ path: pathname });
      const sent =
        typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function"
          ? navigator.sendBeacon("/api/track/visit", new Blob([body], { type: "application/json" }))
          : false;

      if (!sent) {
        void fetch("/api/track/visit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => undefined);
      }
    } catch {
      /* best-effort */
    }
  }, [pathname]);

  return null;
}
