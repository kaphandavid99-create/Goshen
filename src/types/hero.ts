export type HeroImage = {
  id: string;
  url: string;
  alt: string;
};

export type HeroContent = {
  kicker: string;
  headline: string;
  rotatingLines: string[];
  lead: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  images: HeroImage[];
};
