"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown, ListFilter, Loader2 } from "lucide-react";
import { useT } from "@/lib/i18n/context";
import type { CatalogCategory } from "@/types/catalog";

/**
 * Shop category picker. Replaces the old wrap-around chip row with a single
 * dropdown — one tap on mobile, and the whole control fits on one line.
 * Selecting an option navigates the same URL the chips used, so search and
 * the deals view are preserved.
 */
export function CategoryFilter({
  categories,
  active,
  q,
  deals,
}: {
  categories: CatalogCategory[];
  active?: string;
  q?: string;
  deals?: boolean;
}) {
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function go(slug: string) {
    const params = new URLSearchParams();
    if (deals) params.set("deals", "1");
    if (slug) params.set("category", slug);
    if (q) params.set("q", q);
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `/shop?${query}` : "/shop", { scroll: false });
    });
  }

  return (
    <div id="categories" className="mt-8 flex scroll-mt-28 items-center gap-2">
      <div className="relative min-w-0 flex-1 sm:max-w-72 sm:flex-none">
        <ListFilter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <select
          aria-label={t.shop.categoriesLabel}
          value={active ?? ""}
          onChange={(event) => go(event.target.value)}
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-border bg-card py-0 pl-9 pr-10 text-sm font-medium leading-[2.75rem] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="" className="bg-card text-foreground">
            {t.shop.all}
          </option>
          {categories.map((category) => (
            <option
              key={category.id}
              value={category.slug}
              className="bg-card text-foreground"
            >
              {category.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {pending ? (
        <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
      ) : null}
    </div>
  );
}
