"use client";

import { Suspense, useState } from "react";
import { IconClose, IconMenu } from "@/components/icons";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { NavLink } from "@/components/layout/nav-link";
import { ThemeToggle } from "@/components/theme-toggle";
import { MOBILE_NAV_TABS, NAV_LINKS } from "@/lib/constants";
import { useT } from "@/lib/i18n/context";

// Links that live in the bottom tab bar are kept out of the hamburger menu.
const TAB_HREFS = new Set<string>(MOBILE_NAV_TABS.map((tab) => tab.href));
const MENU_LINKS = NAV_LINKS.filter((link) => !TAB_HREFS.has(link.href));

export function MobileNav() {
  const t = useT();
  return (
    <Suspense fallback={<MenuTrigger disabled label={t.common.menu} />}>
      <MobileNavMenu />
    </Suspense>
  );
}

function MobileNavMenu() {
  const [open, setOpen] = useState(false);
  const t = useT();

  return (
    <div className="lg:hidden">
      <MenuTrigger
        open={open}
        label={t.common.menu}
        onToggle={() => setOpen((value) => !value)}
      />
      {open ? (
        <nav
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 border-b border-border bg-card px-5 py-5"
        >
          <ul className="space-y-1">
            {MENU_LINKS.map((link) => (
              <li key={link.key}>
                <NavLink
                  href={link.href}
                  className="nav-link nav-link-mobile"
                  onClick={() => setOpen(false)}
                >
                  {t.nav[link.key]}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm font-medium text-muted-foreground">
            <span>{t.language.label}</span>
            <LanguageToggle />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm font-medium text-muted-foreground">
            <span>{t.nav.appearance}</span>
            <ThemeToggle />
          </div>
        </nav>
      ) : null}
    </div>
  );
}

function MenuTrigger({
  open = false,
  disabled = false,
  label = "Menu",
  onToggle,
}: {
  open?: boolean;
  disabled?: boolean;
  label?: string;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      className="flex size-10 items-center justify-center text-primary lg:hidden"
      aria-expanded={open}
      aria-controls="mobile-menu"
      disabled={disabled}
      onClick={onToggle}
    >
      {open ? <IconClose className="size-6" /> : <IconMenu className="size-6" />}
      <span className="sr-only">{label}</span>
    </button>
  );
}
