export const APP_NAME = "Goshen";

export const BRAND_COLORS = {
  green: "#003D29",
  cream: "#FDF8F1",
  orange: "#E67E22",
} as const;

const MAP_QUERY = "Goshen shop, New Bell, Bamenda, Cameroon";

export const STORE = {
  location: "New Bell, Bamenda",
  hours: "7:00 AM – 9:00 PM",
  phoneDisplay: "+237 675 619 166",
  phoneHref: "tel:+237675619166",
  whatsappHref: "https://wa.me/237675619166",
  mapQuery: MAP_QUERY,
  mapEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=15&output=embed`,
  mapLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`,
  directionsHref: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(MAP_QUERY)}`,
};

export const NIPZ = {
  name: "Nipz Pretty Cakes & Pastries",
  shortName: "Nipz Pretty Cakes",
  tagline: "Custom cakes, pastries & dessert tables — baked fresh in New Bell, Bamenda.",
  href: "/shop/nipz",
  bookingLeadDays: 3,
  // The bakery takes all bookings on its own WhatsApp line.
  phoneDisplay: "+237 671 283 634",
  phoneHref: "tel:+237671283634",
  whatsappHref: "https://wa.me/237671283634",
  categories: ["Cakes", "Cupcakes", "Pastries", "Dessert tables"] as const,
  occasions: [
    "Birthday",
    "Wedding",
    "Anniversary",
    "Baby shower",
    "Graduation",
    "Corporate / event",
    "Just because",
  ] as const,
};

export const FREE_DELIVERY_FROM = 15_000;
export const DELIVERY_FEE = 1_000;

/** Category whose products can carry drink flavours. */
export const DRINKS_CATEGORY_SLUG = "drinks-and-beverages";

/** Category that holds bundle products (kind = BUNDLE). */
export const BUNDLES_CATEGORY_SLUG = "bundles";

/** The flavours a drink can be offered in. Admin picks which apply per product. */
export const DRINK_FLAVORS = [
  "Ananas",
  "Orange",
  "Cocktail",
  "Grenadine",
  "Coca-Cola",
  "Bubble Up",
  "Bitter Lemon",
] as const;

export type DrinkFlavor = (typeof DRINK_FLAVORS)[number];

/** Minimum total value (FCFA) for a wholesale order to be placed. */
export const WHOLESALE_MIN_ORDER_CENTS = 50_000;

export const WHOLESALE = {
  href: "/wholesale",
  applyHref: "/wholesale/apply",
  minOrderCents: WHOLESALE_MIN_ORDER_CENTS,
  businessTypes: [
    "Retailer / shop",
    "Restaurant / bar",
    "School / institution",
    "Reseller / distributor",
    "Other",
  ] as const,
};
export const POINTS_PER_100_FCFA = 1;
export const WELCOME_POINTS = 50;
export const REFERRAL_POINTS = 100;
export const REVIEW_POINTS = 5;
export const MIN_REDEEM_POINTS = 100;
export const MIN_REDEEM_SUBTOTAL = 1_000;
export const POINT_VALUE_FCFA = 1;

export function deliveryFeeFor(subtotal: number) {
  return subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
}

/**
 * `key` maps to `dictionary.nav[key]` for the localized label.
 * Keep a plain English `label` too for non-localized contexts (metadata, logs).
 */
export const NAV_LINKS = [
  { href: "/", key: "home", label: "Home" },
  { href: "/shop", key: "shop", label: "Shop" },
  { href: "/bundles", key: "bundles", label: "Bundles" },
  { href: "/shop?deals=1", key: "deals", label: "Deals" },
  { href: "/wholesale", key: "wholesale", label: "Wholesale" },
  { href: "/rewards", key: "rewards", label: "Rewards" },
  { href: "/about", key: "about", label: "About Us" },
  { href: "/contact", key: "contact", label: "Contact" },
] as const;

/**
 * The persistent icon nav shown at the bottom of the screen on mobile. Anything
 * listed here is filtered out of the hamburger menu so the two never overlap.
 * `icon` keys map to components in `mobile-tab-bar.tsx`.
 */
export const MOBILE_NAV_TABS = [
  { href: "/", key: "home", label: "Home", icon: "home" },
  { href: "/rewards", key: "rewards", label: "Rewards", icon: "star" },
  { href: "/shop", key: "shop", label: "Shop", icon: "grid" },
  { href: "/contact", key: "contact", label: "Contact", icon: "phone" },
  { href: "/account", key: "dashboard", label: "Dashboard", icon: "user" },
] as const;
