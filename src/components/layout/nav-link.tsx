"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSyncExternalStore, type MouseEvent, type ReactNode } from "react";

function subscribeHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

function useLocationHash() {
  return useSyncExternalStore(
    subscribeHash,
    () => window.location.hash,
    () => "",
  );
}

function isActive(pathname: string, search: string, href: string, hash: string) {
  const url = new URL(href, "http://local.invalid");
  const deals = new URLSearchParams(search).get("deals") === "1";
  const onCategories = hash === "#categories";

  if (url.searchParams.get("deals") === "1") {
    return pathname === "/shop" && deals;
  }

  if (url.hash === "#categories") {
    return pathname === "/shop" && !deals && onCategories;
  }

  if (url.pathname === "/shop") {
    return (
      (pathname === "/shop" || pathname.startsWith("/shop/")) &&
      !deals &&
      !onCategories
    );
  }

  if (url.pathname === "/") {
    return pathname === "/";
  }

  return pathname === url.pathname || pathname.startsWith(`${url.pathname}/`);
}

function setPageHash(href: string) {
  window.history.replaceState(null, "", href);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

export function NavLink({
  href,
  children,
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hash = useLocationHash();
  const active = isActive(pathname, searchParams.toString(), href, hash);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const url = new URL(href, "http://local.invalid");
    const nextHash = url.hash;

    if (pathname === url.pathname && !url.search) {
      if (nextHash) {
        const target = document.getElementById(nextHash.slice(1));
        if (target) {
          event.preventDefault();
          setPageHash(href);
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else if (window.location.hash) {
        setPageHash(url.pathname);
      }
    }

    onClick?.();
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
