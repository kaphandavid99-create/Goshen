/**
 * Bilingual (English / French) configuration for the Goshen storefront.
 *
 * The active locale is stored in a cookie (no URL change) so every existing
 * link keeps working. The header language toggle writes the cookie and calls
 * `router.refresh()` so server components re-render in the new language.
 */

export const LOCALES = ["en", "fr"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie that holds the visitor's language choice. Read on the server, written on the client. */
export const LOCALE_COOKIE = "goshen_lang";

/** One year, in seconds — how long the language choice is remembered. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Normalise anything (cookie value, `Accept-Language`, …) to a supported locale. */
export function resolveLocale(value: string | null | undefined): Locale {
  if (!value) return DEFAULT_LOCALE;
  const lower = value.toLowerCase();
  if (isLocale(lower)) return lower;
  // Accept-Language style: "fr-CM,fr;q=0.9,en;q=0.8"
  for (const part of lower.split(",")) {
    const tag = part.trim().split(";")[0]?.slice(0, 2);
    if (isLocale(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/** BCP-47 tag used for `<html lang>` and `Intl.*` formatters. */
export const LOCALE_BCP47: Record<Locale, string> = {
  en: "en",
  fr: "fr",
};
