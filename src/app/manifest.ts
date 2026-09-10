import type { MetadataRoute } from "next";
import { APP_NAME, BRAND_COLORS } from "@/lib/constants";

// Makes the shop installable to a phone home screen ("Add to Home Screen").
// The icon is the 500x500 public/logo.png served at any size the OS asks for.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${APP_NAME} — New Bell, Bamenda`,
    short_name: APP_NAME,
    description:
      "Groceries, household and personal care, plus Nipz Pretty Cakes — order from Goshen in New Bell, Bamenda.",
    id: "/",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: BRAND_COLORS.cream,
    theme_color: BRAND_COLORS.green,
    categories: ["shopping", "food"],
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      { name: "Shop", url: "/shop" },
      { name: "Cart", url: "/cart" },
      { name: "My orders", url: "/account/orders" },
    ],
  };
}
