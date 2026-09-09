import { DEFAULT_LOCALE, LOCALE_BCP47, type Locale } from "@/lib/i18n/config";

export function formatPrice(amount: number, locale: Locale = DEFAULT_LOCALE) {
  return `${new Intl.NumberFormat(LOCALE_BCP47[locale] ?? "en").format(amount)} FCFA`;
}

export function dealCompareAt(price: number, featured: boolean) {
  if (!featured) {
    return null;
  }

  return Math.round(price / 0.8);
}

export function dealPercent(featured: boolean) {
  return featured ? 20 : null;
}
