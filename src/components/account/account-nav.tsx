"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconBell,
  IconClipboard,
  IconGift,
  IconHeart,
  IconPin,
  IconUser,
} from "@/components/icons";
import { useT } from "@/lib/i18n/context";

const LINKS = [
  { href: "/account", key: "profile", icon: IconUser },
  { href: "/account/orders", key: "orders", icon: IconClipboard },
  { href: "/account/wishlist", key: "wishlist", icon: IconHeart },
  { href: "/account/rewards", key: "rewards", icon: IconGift },
  { href: "/account/notifications", key: "notifications", icon: IconBell },
  { href: "/account/addresses", key: "addresses", icon: IconPin },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/account") {
    return pathname === "/account";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Orders and Rewards surface the same unread-notification count as Notifications
// itself — a customer browsing either tab still needs to know something's
// waiting for them. Wishlist instead counts saved products, its own metric.
const BADGE_COUNTS: Partial<Record<(typeof LINKS)[number]["key"], "unread" | "wishlist">> = {
  orders: "unread",
  rewards: "unread",
  notifications: "unread",
  wishlist: "wishlist",
};

export function AccountNav({
  unread = 0,
  wishlistCount = 0,
}: {
  unread?: number;
  wishlistCount?: number;
}) {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav
      aria-label={t.account.navLabel}
      className="mt-6 flex gap-2 overflow-x-auto pb-1"
    >
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = link.icon;
        const source = BADGE_COUNTS[link.key];
        const count = source === "unread" ? unread : source === "wishlist" ? wishlistCount : 0;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${
              active
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            <Icon className="size-4" />
            {t.account.nav[link.key]}
            {count > 0 ? (
              <span
                className={`rounded-full px-1.5 text-xs ${
                  active ? "bg-primary-foreground text-primary" : "bg-accent text-accent-foreground"
                }`}
              >
                {count > 9 ? "9+" : count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
