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

/** Both languages at once, for the admin editor (which edits them side by side). */
export type HeroBilingualText = {
  kicker: string;
  headline: string;
  rotatingLines: string[];
  lead: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  kickerFr: string;
  headlineFr: string;
  rotatingLinesFr: string[];
  leadFr: string;
  primaryCtaLabelFr: string;
  secondaryCtaLabelFr: string;
};
