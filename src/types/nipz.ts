export type NipzImage = {
  id: string;
  url: string;
  alt: string;
};

export type NipzContent = {
  /** Full business name — used for the shop banner, metadata and WhatsApp. */
  businessName: string;
  eyebrow: string;
  /** The page heading; `titleEm` is the accent-coloured tail (e.g. "& Pastries"). */
  title: string;
  titleEm: string;
  /** The intro / details paragraph under the heading. */
  lead: string;
  /** Digits-only international number for the "Order on WhatsApp" links. */
  whatsappNumber: string;
  /** The three grid images in the hero collage. */
  images: NipzImage[];
};
