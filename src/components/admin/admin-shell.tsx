"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  IconBox,
  IconCake,
  IconClipboard,
  IconClose,
  IconGrid,
  IconHome,
  IconMenu,
  IconStar,
  IconTag,
  IconUsers,
} from "@/components/icons";
import type { PublicUser } from "@/types";

const LINKS = [
  { href: "/admin", label: "Overview", icon: IconGrid },
  { href: "/admin/orders", label: "Orders", icon: IconClipboard },
  { href: "/admin/products", label: "Products", icon: IconBox },
  { href: "/admin/wholesale", label: "Wholesale", icon: IconTag },
  { href: "/admin/cakes", label: "Cakes & bookings", icon: IconCake },
  { href: "/admin/hero", label: "Homepage", icon: IconHome },
  { href: "/admin/customers", label: "Customers", icon: IconUsers },
  { href: "/admin/feedback", label: "Feedback", icon: IconStar },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  user,
  children,
}: {
  user: PublicUser;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-full bg-background">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`admin-sidebar ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-5">
          <Link href="/admin" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            <span className="admin-logo-mark">
              <Image
                src="/logo.png"
                alt=""
                width={80}
                height={80}
                priority
              />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold tracking-tight text-[var(--sidebar-foreground)]">
                Goshen
              </span>
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sidebar-foreground)]/70">
                Operations
              </span>
            </span>
          </Link>
          <button
            type="button"
            className="shrink-0 text-[var(--sidebar-foreground)] lg:hidden"
            onClick={() => setOpen(false)}
          >
            <IconClose className="size-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 px-3">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active ? "page" : undefined}
                className="admin-nav-link"
              >
                <link.icon className="size-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3 border-t border-[var(--sidebar-border)] px-5 py-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-[var(--sidebar-foreground)]">{user.name}</p>
            <ThemeToggle className="text-[var(--sidebar-foreground)] hover:bg-white/10 hover:text-[var(--sidebar-foreground)]" />
          </div>
          <p className="text-xs text-[var(--sidebar-foreground)]/70">{user.role}</p>
          <Link href="/" className="block text-sm text-[var(--sidebar-foreground)] underline underline-offset-4">
            View shop
          </Link>
          <LogoutButton className="btn w-full border border-[var(--sidebar-border)] bg-transparent text-[var(--sidebar-foreground)] hover:opacity-90" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:px-8">
          <button
            type="button"
            className="flex size-10 items-center justify-center text-primary lg:hidden"
            onClick={() => setOpen(true)}
          >
            <IconMenu className="size-6" />
            <span className="sr-only">Open menu</span>
          </button>
          <p className="text-sm text-muted-foreground">
            Goshen desk · New Bell, Bamenda
          </p>
          <p className="text-sm font-medium text-primary">{user.email}</p>
        </header>
        <div className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
