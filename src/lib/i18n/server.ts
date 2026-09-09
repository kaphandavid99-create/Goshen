import "server-only";

import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, resolveLocale, type Locale } from "./config";
import { getDictionary, type Dictionary } from "./dictionaries";

/**
 * Resolve the visitor's locale on the server: the language cookie wins, and we
 * fall back to the `Accept-Language` header, then the default locale.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (fromCookie) return resolveLocale(fromCookie);

  try {
    const headerStore = await headers();
    return resolveLocale(headerStore.get("accept-language"));
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** The dictionary for the current request's locale. Use in server components. */
export async function getDict(): Promise<Dictionary> {
  return getDictionary(await getLocale());
}

/** Both, when a component needs the locale tag too (e.g. for `Intl` formatting). */
export async function getI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: getDictionary(locale) };
}
