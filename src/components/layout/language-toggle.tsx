"use client";

import { LOCALES } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/**
 * Compact EN / FR switch. Writes the language cookie and refreshes server
 * components (see `LanguageProvider`). No URL change — every existing link
 * keeps working.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-border bg-card p-0.5 text-[11px] font-semibold",
        className,
      )}
      role="group"
      aria-label={t.language.label}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            aria-label={t.language.switchTo(
              code === "fr" ? t.language.french : t.language.english,
            )}
            className={cn(
              "rounded-full px-2 py-1 uppercase tracking-wide transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-primary",
            )}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
