"use client";

import { useEffect, useState } from "react";
import { IconArrowRight, IconClose } from "@/components/icons";
import { useT } from "@/lib/i18n/context";

const DISMISS_KEY = "goshen.install.dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const t = useT();
  const c = t.pwa.install;
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [visible, setVisible] = useState(false);

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

    const ios =
      /ipad|iphone|ipod/i.test(window.navigator.userAgent) &&
      !("MSStream" in window);
    setIsIOS(ios);
    if (ios) {
      setVisible(true);
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setVisible(false));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // ignore — a private window just won't remember
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <div className="card mt-6 flex items-start gap-3 p-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-primary">{c.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {isIOS ? c.iosHint : c.blurb}
        </p>
        {!isIOS && deferred ? (
          <button
            type="button"
            onClick={install}
            className="btn btn-rose mt-3 inline-flex items-center gap-2"
          >
            {c.action}
            <IconArrowRight className="size-4" />
          </button>
        ) : null}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={c.dismiss}
        className="btn-ghost shrink-0 p-1"
      >
        <IconClose className="size-4" />
      </button>
    </div>
  );
}
