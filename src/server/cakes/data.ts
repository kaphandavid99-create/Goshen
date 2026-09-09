import type { CakeItem } from "@/types/cakes";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

/**
 * Shown on the Nipz page before any photos are uploaded from the admin desk,
 * so the page always looks finished. Once real items exist in the database
 * these are ignored.
 */
export const fallbackCakeItems: CakeItem[] = [
  {
    id: "sample-classic-celebration",
    name: "Classic Celebration Cake",
    description:
      "Two or three tiers of moist vanilla or chocolate sponge, smooth buttercream, and a finish in your colours.",
    category: "Cakes",
    priceCents: 18_000,
    priceNote: "from",
    imageUrl: img("photo-1578985545062-69928b1d9587"),
    cloudinaryPublicId: null,
    featured: true,
    available: true,
    sortOrder: 0,
  },
  {
    id: "sample-naked-berry",
    name: "Naked Berry Cake",
    description:
      "Lightly frosted sponge layered with fresh cream and seasonal berries — elegant for weddings and showers.",
    category: "Cakes",
    priceCents: 25_000,
    priceNote: "from",
    imageUrl: img("photo-1565958011703-44f9829ba187"),
    cloudinaryPublicId: null,
    featured: true,
    available: true,
    sortOrder: 1,
  },
  {
    id: "sample-cupcake-box",
    name: "Cupcake Box (12)",
    description:
      "A dozen swirled cupcakes in mixed flavours, boxed for gifting or a small gathering.",
    category: "Cupcakes",
    priceCents: 6_000,
    priceNote: null,
    imageUrl: img("photo-1558961363-fa8fdf82db35"),
    cloudinaryPublicId: null,
    featured: false,
    available: true,
    sortOrder: 2,
  },
  {
    id: "sample-macarons",
    name: "French Macarons",
    description: "Crisp, chewy shells with ganache and fruit fillings. Sold by the box of 12 or 24.",
    category: "Pastries",
    priceCents: 5_500,
    priceNote: "from",
    imageUrl: img("photo-1519869325930-281384150729"),
    cloudinaryPublicId: null,
    featured: false,
    available: true,
    sortOrder: 3,
  },
  {
    id: "sample-pastry-platter",
    name: "Breakfast Pastry Platter",
    description:
      "Croissants, palmiers, and cinnamon rolls baked the same morning — great for meetings and brunch.",
    category: "Pastries",
    priceCents: 9_000,
    priceNote: "from",
    imageUrl: img("photo-1486427944299-d1955d23e34d"),
    cloudinaryPublicId: null,
    featured: false,
    available: true,
    sortOrder: 4,
  },
  {
    id: "sample-dessert-table",
    name: "Dessert Table Spread",
    description:
      "A styled table of mini cakes, tarts, cake pops, and cupcakes, matched to your event theme.",
    category: "Dessert tables",
    priceCents: null,
    priceNote: "Quote on request",
    imageUrl: img("photo-1464349095431-e9a21285b5f3"),
    cloudinaryPublicId: null,
    featured: true,
    available: true,
    sortOrder: 5,
  },
];
