import Link from "next/link";
import { Suspense } from "react";
import { Avatar } from "@/components/account/avatar";
import { BrandLogo } from "@/components/brand/logo";
import { HeaderCart } from "@/components/layout/header-cart";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { NavLink } from "@/components/layout/nav-link";
import { SearchBar } from "@/components/layout/search-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { IconPin, IconTruck, IconUser } from "@/components/icons";
import { NAV_LINKS, STORE } from "@/lib/constants";
import { getDict } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/auth/current-user";

export async function SiteHeader() {
  const [user, t] = await Promise.all([getCurrentUser(), getDict()]);

  return (
    <>
      <header className="sticky top-0 z-50">
        <div className="bg-[var(--footer)] text-[var(--footer-foreground)]">
          <div className="page-wrap flex items-center justify-between gap-3 py-2 text-[11px] tracking-wide sm:text-xs">
            <p className="flex min-w-0 items-center gap-2">
              <IconTruck className="size-3.5 shrink-0 text-accent" />
              <span className="truncate sm:hidden">{t.header.freeDeliveryShort}</span>
              <span className="hidden sm:inline">{t.header.freeDeliveryLong}</span>
            </p>
            <div className="hidden items-center gap-5 sm:flex">
              <span className="flex items-center gap-1.5">
                <IconPin className="size-3.5" />
                {STORE.location}
              </span>
              <Link href="/contact" className="hover:underline">
                {t.nav.support}
              </Link>
            </div>
          </div>
        </div>

        <div className="relative border-b border-border bg-card">
          <div className="page-wrap flex items-center gap-4 py-3.5 lg:gap-8">
            {/* Left: hamburger on mobile, full logo on desktop */}
            <div className="flex flex-1 items-center justify-start lg:flex-none">
              <MobileNav />
              <span className="hidden lg:block">
                <BrandLogo />
              </span>
            </div>

            {/* Center: compact logo, mobile only */}
            <div className="lg:hidden">
              <BrandLogo compact />
            </div>

            <Suspense
              fallback={
                <nav aria-label={t.nav.primary} className="hidden items-center gap-4 xl:gap-7 lg:flex">
                  {NAV_LINKS.map((link) => (
                    <Link key={link.key} href={link.href} className="nav-link">
                      {t.nav[link.key]}
                    </Link>
                  ))}
                </nav>
              }
            >
              <nav aria-label={t.nav.primary} className="hidden items-center gap-4 xl:gap-7 lg:flex">
                {NAV_LINKS.map((link) => (
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
                {user ? (
                  <Avatar name={user.name} url={user.avatarUrl} size={32} />
                ) : (
                  <IconUser className="size-5 text-primary" />
                )}
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

      <MobileTabBar signedIn={Boolean(user)} />
    </>
  );
}
