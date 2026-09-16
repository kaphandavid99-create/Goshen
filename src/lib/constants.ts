export const APP_NAME = "Goshen";

/** ISO date the Terms of Service / Privacy Policy text was last revised. */
export const LEGAL_LAST_UPDATED = "2026-09-15";

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

/** Number of grid photos shown in the Nipz page hero collage. */
export const NIPZ_MAX_IMAGES = 3;

export const NIPZ = {
  name: "Nipz Pretty Cakes & Pastries",
  shortName: "Nipz Pretty Cakes",
  tagline: "Custom cakes, pastries & dessert tables — baked fresh in New Bell, Bamenda.",
  href: "/shop/nipz",
  bookingLeadDays: 3,
  // The bakery takes all bookings on its own WhatsApp line.
  phoneDisplay: "+237 671 283 634",
  phoneHref: "tel:+237671283634",
  whatsapp: "237671283634",
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

export const DELIVERY_FEE = 1_000;

/** Category whose products can carry drink flavours. */
export const DRINKS_CATEGORY_SLUG = "drinks-and-beverages";

/** Category that holds bundle products (kind = BUNDLE). */
export const BUNDLES_CATEGORY_SLUG = "bundles";

/** The flavours a drink can be offered in. Admin picks which apply per product. */
export const DRINK_FLAVORS = [
  "Ananas",
  "Orange",
  "Apple",
  "Cocktail",
  "Grenadine",
  "Coca-Cola",
  "Bubble Up",
  "Bitter Lemon",
] as const;

export type DrinkFlavor = (typeof DRINK_FLAVORS)[number];

/** Minimum total value (FCFA) for a wholesale order to be placed. */
export const WHOLESALE_MIN_ORDER_CENTS = 10_000;

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
// Typed as `number` (not the `1.5` literal) so call sites can compare it
// against other point-rate values without a "these literals can never be
// equal" type error if the rate ever changes.
export const POINTS_PER_100_FCFA: number = 1.5;
export const WELCOME_POINTS = 100;
/** Points the referrer earns as soon as the person they referred creates an account. */
export const REFERRAL_SIGNUP_POINTS = 100;
/** Points the referrer earns when the person they referred places their first order. */
export const REFERRAL_POINTS = 100;
export const REVIEW_POINTS = 10;
export const MIN_REDEEM_POINTS = 500;
/** A single order can redeem at most this many points; any balance beyond it carries over. */
export const MAX_REDEEM_POINTS_PER_ORDER = 500;
export const MIN_REDEEM_SUBTOTAL = 1_000;
export const POINT_VALUE_FCFA = 1;

/** Days after an order is received before the repeat-purchase nudge fires. */
export const REPEAT_PURCHASE_DELAY_DAYS = 4;
/** Max products suggested per nudge, so the notification stays short. */
export const REPEAT_PURCHASE_MAX_SUGGESTIONS = 3;

/** Hours a cart can sit untouched before the cart-reminder cron nudges about it. */
export const CART_REMINDER_DELAY_HOURS = 1;
/** Days between "you have points to redeem" reminders for the same customer. */
export const POINTS_REMINDER_INTERVAL_DAYS = 7;

export function deliveryFeeFor() {
  return DELIVERY_FEE;
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
