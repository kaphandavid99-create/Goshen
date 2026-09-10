"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IconArrowRight, IconClose } from "@/components/icons";
import { useT } from "@/lib/i18n/context";

const DISMISS_KEY = "goshen.install.dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Mode = "hidden" | "ios" | "prompt";

// Site-wide "add to home screen" nudge, anchored to the bottom of the screen.
// Shows for everyone (signed in or not) once the browser reports the app is
// installable, or on iOS Safari where there is no install event.
export function InstallBanner() {
  const t = useT();
  const c = t.pwa.install;
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);
  const [mode, setMode] = useState<Mode>("hidden");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      dismissed = false;
    }

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (dismissed || standalone) {
      return;
    }

    const isIOS =
      /ipad|iphone|ipod/i.test(window.navigator.userAgent) &&
      !("MSStream" in window);

    // Hold off a few seconds so it doesn't slam in on first paint.
    const iosTimer = isIOS
      ? setTimeout(() => setMode("ios"), 4000)
      : undefined;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      deferred.current = event as BeforeInstallPromptEvent;
      setMode("prompt");
    };
    const onInstalled = () => setMode("hidden");

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      if (iosTimer) clearTimeout(iosTimer);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (mode === "hidden") {
      return;
    }
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, [mode]);

  function dismiss() {
    setShown(false);
    setTimeout(() => setMode("hidden"), 200);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // a private window just won't remember
    }
  }

  async function install() {
    const event = deferred.current;
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    deferred.current = null;
    dismiss();
  }

  if (mode === "hidden") {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 px-3"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div
        role="dialog"
        aria-label={c.title}
        className={`mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg transition-all duration-200 sm:p-4 ${
          shown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
        }`}
      >
        <Image
          src="/logo.png"
          alt=""
          width={40}
          height={40}
          className="hidden shrink-0 rounded-lg sm:block"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-primary">{c.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {mode === "ios" ? c.iosHint : c.blurb}
          </p>
        </div>
        {mode === "prompt" ? (
          <button
            type="button"
            onClick={install}
            className="btn btn-rose inline-flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm"
          >
            {c.action}
            <IconArrowRight className="size-4" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={dismiss}
          aria-label={c.dismiss}
          className="btn-ghost shrink-0 p-1.5"
        >
          <IconClose className="size-4" />
        </button>
      </div>
    </div>
  );
}
