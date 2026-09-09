"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AssistantWidget } from "@/components/assistant/assistant-widget";

export function StoreChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      {children}
      {footer}
      {/* Reserve scroll space so the fixed mobile tab bar never covers the footer. */}
      <div
        aria-hidden
        className="h-[calc(4.25rem+env(safe-area-inset-bottom))] shrink-0 lg:hidden"
      />
      <AssistantWidget />
    </>
  );
}
