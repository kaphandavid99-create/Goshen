import "server-only";

import { prisma } from "@/lib/db/prisma";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import type { HeroBilingualText, HeroContent } from "@/types/hero";

export type { HeroContent, HeroImage } from "@/types/hero";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80";

/**
 * Localized fallback used when the admin hasn't configured a hero yet. Editable
 * hero content in the DB is displayed as entered (it isn't translated here).
 */
function heroDefaults(locale: Awaited<ReturnType<typeof getLocale>>): HeroContent {
  const d = getDictionary(locale).home.heroDefaults;
  return {
    kicker: d.kicker,
    headline: d.headline,
    rotatingLines: [...d.rotatingLines],
    lead: d.lead,
    primaryCtaLabel: d.primaryCtaLabel,
    primaryCtaHref: "/shop",
    secondaryCtaLabel: d.secondaryCtaLabel,
    secondaryCtaHref: "/shop?deals=1",
    images: [{ id: "default", url: HERO_IMAGE_URL, alt: d.imageAlt }],
  };
}

/** English defaults, for non-request contexts (validators, tests). */
export const HERO_DEFAULTS: HeroContent = heroDefaults("en");

function toStringList(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const lines = value.filter(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0,
  );
  return lines.length > 0 ? lines : fallback;
}

export async function getHeroContent(): Promise<HeroContent> {
  const locale = await getLocale();
  const defaults = heroDefaults(locale);
  const defaultsEn = locale === "en" ? defaults : heroDefaults("en");

  try {
    const [settings, images] = await Promise.all([
      prisma.heroSettings.findUnique({ where: { id: "hero" } }),
      prisma.heroImage.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    const gallery = images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
    }));

    // English column (falling back to the English default), always resolved
    // first — French fields fall back to it rather than to generic default
    // copy, so an admin's custom English text still shows until it's
    // actually translated.
    const en = {
      kicker: settings?.kicker || defaultsEn.kicker,
      headline: settings?.headline || defaultsEn.headline,
      rotatingLines: toStringList(settings?.rotatingLines, defaultsEn.rotatingLines),
      lead: settings?.lead || defaultsEn.lead,
      primaryCtaLabel: settings?.primaryCtaLabel || defaultsEn.primaryCtaLabel,
      primaryCtaHref: settings?.primaryCtaHref || defaultsEn.primaryCtaHref,
      secondaryCtaLabel: settings?.secondaryCtaLabel || defaultsEn.secondaryCtaLabel,
      secondaryCtaHref: settings?.secondaryCtaHref || defaultsEn.secondaryCtaHref,
    };

    if (locale !== "fr") {
      return { ...en, images: gallery.length > 0 ? gallery : defaultsEn.images };
    }

    return {
      kicker: settings?.kickerFr || en.kicker,
      headline: settings?.headlineFr || en.headline,
      rotatingLines: toStringList(settings?.rotatingLinesFr, en.rotatingLines),
      lead: settings?.leadFr || en.lead,
      primaryCtaLabel: settings?.primaryCtaLabelFr || en.primaryCtaLabel,
      primaryCtaHref: en.primaryCtaHref,
      secondaryCtaLabel: settings?.secondaryCtaLabelFr || en.secondaryCtaLabel,
      secondaryCtaHref: en.secondaryCtaHref,
      images: gallery.length > 0 ? gallery : defaults.images,
    };
  } catch {
    return defaults;
  }
}

/** Both languages at once, for the admin hero editor. */
export async function getHeroBilingualText(): Promise<HeroBilingualText> {
  const defaultsEn = heroDefaults("en");

  const settings = await prisma.heroSettings.findUnique({ where: { id: "hero" } });

  return {
    kicker: settings?.kicker || defaultsEn.kicker,
    headline: settings?.headline || defaultsEn.headline,
    rotatingLines: toStringList(settings?.rotatingLines, defaultsEn.rotatingLines),
    lead: settings?.lead || defaultsEn.lead,
    primaryCtaLabel: settings?.primaryCtaLabel || defaultsEn.primaryCtaLabel,
    primaryCtaHref: settings?.primaryCtaHref || defaultsEn.primaryCtaHref,
    secondaryCtaLabel: settings?.secondaryCtaLabel || defaultsEn.secondaryCtaLabel,
    secondaryCtaHref: settings?.secondaryCtaHref || defaultsEn.secondaryCtaHref,
    kickerFr: settings?.kickerFr ?? "",
    headlineFr: settings?.headlineFr ?? "",
    rotatingLinesFr: toStringList(settings?.rotatingLinesFr, []),
    leadFr: settings?.leadFr ?? "",
    primaryCtaLabelFr: settings?.primaryCtaLabelFr ?? "",
    secondaryCtaLabelFr: settings?.secondaryCtaLabelFr ?? "",
  };
}
