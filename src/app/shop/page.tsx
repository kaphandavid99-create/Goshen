import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconCake } from "@/components/icons";
import { PageIntro } from "@/components/layout/page-intro";
import { CategoryFilter } from "@/components/shop/category-filter";
import { ProductCard } from "@/components/shop/product-card";
import { NIPZ } from "@/lib/constants";
import { getDict } from "@/lib/i18n/server";
import { listWishlistProductIds } from "@/server/account/hub";
import { getCurrentUser } from "@/server/auth/current-user";
import { listCategories, listProducts } from "@/server/catalog/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.shop };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; deals?: string }>;
}) {
  const { category, q, deals } = await searchParams;
  const showDeals = deals === "1";
  const [user, t] = await Promise.all([getCurrentUser(), getDict()]);
  const [categories, products, savedIds] = await Promise.all([
    listCategories(),
    listProducts(category, q),
    user ? listWishlistProductIds(user.id).catch(() => [] as string[]) : Promise.resolve([] as string[]),
  ]);
  const saved = new Set(savedIds);
  const visible = showDeals
    ? products.filter((product) => product.featured)
    : products;

  return (
    <main className="page-wrap flex-1 py-12">
      <PageIntro
        kicker={showDeals ? t.shop.kickerFeatured : t.shop.kickerCatalog}
        title={showDeals ? t.shop.titleDeals : t.shop.titleShop}
      >
        {showDeals ? t.shop.introDeals : t.shop.introShop}
      </PageIntro>

      <CategoryFilter
        categories={categories}
        active={category}
        q={q}
        deals={showDeals}
      />

      {!showDeals && !q ? (
        <Link
          href={NIPZ.href}
          className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-border bg-gradient-to-r from-[var(--nipz-rose-soft)] to-card px-5 py-4 transition hover:border-[var(--nipz-rose)]"
        >
          <span className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-card text-[var(--nipz-rose)] shadow-sm">
              <IconCake className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-primary">
                {NIPZ.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {t.shop.nipzBannerDesc}
              </span>
            </span>
          </span>
          <IconArrowRight className="size-5 shrink-0 text-[var(--nipz-rose)]" />
        </Link>
      ) : null}

      {q ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t.shop.resultsFor}{" "}
          <span className="font-medium text-foreground">“{q}”</span>
        </p>
      ) : null}

      {visible.length === 0 ? (
        <p className="mt-12 text-muted-foreground">{t.shop.noProducts}</p>
      ) : (
        <div className="shop-grid mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              saved={saved.has(product.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
