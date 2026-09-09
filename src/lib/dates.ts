import { DEFAULT_LOCALE, LOCALE_BCP47, type Locale } from "@/lib/i18n/config";

function tag(locale: Locale) {
  return LOCALE_BCP47[locale] === "fr" ? "fr-FR" : "en-GB";
}

export function formatDate(value: Date, locale: Locale = DEFAULT_LOCALE) {
  return new Intl.DateTimeFormat(tag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function formatDateTime(value: Date, locale: Locale = DEFAULT_LOCALE) {
  return new Intl.DateTimeFormat(tag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}
