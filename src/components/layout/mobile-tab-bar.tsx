"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FC, SVGProps } from "react";
import {
  IconGrid,
  IconHome,
  IconPhone,
  IconStar,
  IconUser,
} from "@/components/icons";
import { MOBILE_NAV_TABS } from "@/lib/constants";
import { useT } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type IconKey = (typeof MOBILE_NAV_TABS)[number]["icon"];

const ICONS: Record<IconKey, FC<SVGProps<SVGSVGElement>>> = {
  home: IconHome,
  star: IconStar,
  grid: IconGrid,
  phone: IconPhone,
  user: IconUser,
};

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/account") {
    return pathname.startsWith("/account") || pathname.startsWith("/login");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileTabBar({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  const t = useT();

  return (
    <nav
      aria-label={t.nav.primary}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {MOBILE_NAV_TABS.map((tab) => {
          const Icon = ICONS[tab.icon];
          const href =
            tab.href === "/account" ? (signedIn ? "/account" : "/login") : tab.href;
          const active = isActive(pathname, tab.href);

          return (
            <li key={tab.href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className="group flex flex-col items-center justify-center gap-1 py-2"
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground group-hover:text-primary",
                  )}
                >
                  <Icon
                    className="size-[22px]"
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                </span>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none tracking-wide transition-colors",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {t.nav[tab.key]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
