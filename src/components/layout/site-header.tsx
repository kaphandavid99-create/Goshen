import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/components/account/avatar";
import { NotificationBadge } from "@/components/account/notification-badge";
import { PushAutoPrompt } from "@/components/account/push-auto-prompt";
import { BrandLogo } from "@/components/brand/logo";
import { CartSync } from "@/components/cart/cart-sync";
import { HeaderCart } from "@/components/layout/header-cart";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { NavLink } from "@/components/layout/nav-link";
import { SearchBar } from "@/components/layout/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconUser } from "@/components/icons";
import { NAV_LINKS } from "@/lib/constants";
import { getDict } from "@/lib/i18n/server";
import { countUnreadNotifications } from "@/server/account/hub";
import { getCurrentUser } from "@/server/auth/current-user";

// Desktop top nav only — Bundles stays reachable from the mobile menu and
// the footer, it's just dropped from this row to keep it short on desktop.
const DESKTOP_NAV_LINKS = NAV_LINKS.filter((link) => link.key !== "bundles");

export async function SiteHeader() {
  const [user, t] = await Promise.all([getCurrentUser(), getDict()]);
  const unread = user ? await countUnreadNotifications(user.id).catch(() => 0) : 0;

  return (
    <>
      {user ? (
        <>
          <PushAutoPrompt />
          <CartSync />
        </>
      ) : null}
      <header className="sticky top-0 z-50">
        <div className="relative border-b border-border bg-card">
          <div className="page-wrap flex items-center gap-4 py-3.5 lg:gap-8">
            {/* Left: hamburger on mobile, full logo on desktop */}
            <div className="flex flex-1 items-center justify-start lg:flex-none">
              <MobileNav />
              <span className="installed-desktop-hide hidden lg:block">
                <BrandLogo />
              </span>
            </div>

            {/* Center: compact logo, mobile only — always shown, even in an
                installed desktop app narrowed to mobile width, since it's
                the only brand mark left once the desktop logo is hidden. */}
            <div className="lg:hidden">
              <BrandLogo compact />
            </div>

            <Suspense
              fallback={
                <nav aria-label={t.nav.primary} className="hidden items-center gap-4 xl:gap-7 lg:flex">
                  {DESKTOP_NAV_LINKS.map((link) => (
                    <Link key={link.key} href={link.href} className="nav-link">
                      {t.nav[link.key]}
                    </Link>
                  ))}
                </nav>
              }
            >
              <nav aria-label={t.nav.primary} className="hidden items-center gap-4 xl:gap-7 lg:flex">
                {DESKTOP_NAV_LINKS.map((link) => (
                  <NavLink key={link.key} href={link.href} className="nav-link">
                    {t.nav[link.key]}
                  </NavLink>
                ))}
              </nav>
            </Suspense>

            {/* Right: search + cart on mobile; + theme + account on desktop */}
            <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
              <SearchBar />
              <LanguageToggle className="hidden lg:inline-flex" />
              <ThemeToggle className="hidden lg:inline-flex" />
              <Link
                href={user ? "/account" : "/login"}
                className="hidden items-center gap-2.5 lg:flex"
              >
                <span className="relative">
                  {user ? (
                    <Avatar name={user.name} url={user.avatarUrl} size={32} />
                  ) : (
                    <IconUser className="size-5 text-primary" />
                  )}
                  {user ? <NotificationBadge initialCount={unread} /> : null}
                </span>
                <span className="leading-tight">
                  <span className="block text-[11px] text-muted-foreground">
                    {user ? t.header.signedIn : t.header.account}
                  </span>
                  <span className="text-sm font-semibold text-primary">
                    {user ? t.nav.dashboard : t.header.signIn}
                  </span>
                </span>
              </Link>
              <HeaderCart />
            </div>
          </div>
        </div>
      </header>

      <MobileTabBar signedIn={Boolean(user)} unreadNotifications={unread} />
    </>
  );
}
