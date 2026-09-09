import "server-only";

import { prisma } from "@/lib/db/prisma";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import type { HeroContent } from "@/types/hero";

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

export async function getHeroContent(): Promise<HeroContent> {
  const locale = await getLocale();
  const defaults = heroDefaults(locale);

  const toStringList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return defaults.rotatingLines;
    const lines = value.filter(
      (entry): entry is string =>
        typeof entry === "string" && entry.trim().length > 0,
    );
    return lines.length > 0 ? lines : defaults.rotatingLines;
  };

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

    return {
      kicker: settings?.kicker || defaults.kicker,
      headline: settings?.headline || defaults.headline,
      rotatingLines: toStringList(settings?.rotatingLines),
      lead: settings?.lead || defaults.lead,
      primaryCtaLabel: settings?.primaryCtaLabel || defaults.primaryCtaLabel,
      primaryCtaHref: settings?.primaryCtaHref || defaults.primaryCtaHref,
      secondaryCtaLabel:
        settings?.secondaryCtaLabel || defaults.secondaryCtaLabel,
      secondaryCtaHref:
        settings?.secondaryCtaHref || defaults.secondaryCtaHref,
      images: gallery.length > 0 ? gallery : defaults.images,
    };
  } catch {
    return defaults;
  }
}
