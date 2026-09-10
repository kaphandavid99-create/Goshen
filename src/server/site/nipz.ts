import "server-only";

import { NIPZ } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/server";
import type { NipzContent } from "@/types/nipz";

export type { NipzContent, NipzImage } from "@/types/nipz";

const DEFAULT_IMAGES = [
  "photo-1578985545062-69928b1d9587",
  "photo-1565958011703-44f9829ba187",
  "photo-1558961363-fa8fdf82db35",
].map((id, index) => ({
  id: `default-${index}`,
  url: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`,
  alt: NIPZ.name,
}));

/**
 * Editable content for /shop/nipz. Falls back to the i18n copy and stock photos
 * until the admin sets it in /admin/cakes.
 */
export async function getNipzContent(): Promise<NipzContent> {
  const t = getDictionary(await getLocale()).nipz;

  const defaults: NipzContent = {
    businessName: NIPZ.name,
    eyebrow: t.eyebrow,
    title: t.title,
    titleEm: t.titleEm,
    lead: t.lead,
    whatsappNumber: NIPZ.whatsapp,
    images: DEFAULT_IMAGES,
  };

  try {
    const [settings, images] = await Promise.all([
      prisma.nipzSettings.findUnique({ where: { id: "nipz" } }),
      prisma.nipzImage.findMany({ orderBy: { sortOrder: "asc" } }),
    ]);

    return {
      businessName: settings?.businessName || defaults.businessName,
      eyebrow: settings?.eyebrow || defaults.eyebrow,
      title: settings?.title || defaults.title,
      titleEm: settings?.titleEm ?? defaults.titleEm,
      lead: settings?.lead || defaults.lead,
      whatsappNumber: settings?.whatsappNumber || defaults.whatsappNumber,
      images:
        images.length > 0
          ? images.map((image) => ({
              id: image.id,
              url: image.url,
              alt: image.alt,
            }))
          : defaults.images,
    };
  } catch {
    return defaults;
  }
}
