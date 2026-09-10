import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { normalizeFlavorList } from "@/lib/flavors";
import { getDict } from "@/lib/i18n/server";
import { listWishlist } from "@/server/account/hub";
import { requireUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.account.nav.wishlist };
}

export default async function AccountWishlistPage() {
  const user = await requireUser("/account/wishlist");
  const [items, t] = await Promise.all([
    listWishlist(user.id).catch(() => []),
    getDict(),
  ]);

  return (
    <section>
      <h2 className="section-title">{t.account.wishlist.title}</h2>
      {items.length === 0 ? (
        <p className="card mt-4 p-5 text-sm text-muted-foreground">
          {t.account.wishlist.empty}{" "}
          <Link href="/shop" className="btn-ghost">
            {t.account.wishlist.browse}
          </Link>
        </p>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              product={{
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                description: item.product.description,
                priceCents: item.product.priceCents,
                unit: item.product.unit,
                inStock: item.product.inStock,
                featured: item.product.featured,
                categoryId: item.product.categoryId,
                category: item.product.category,
                images: item.product.images,
                wholesalePriceCents: item.product.wholesalePriceCents,
                flavors: normalizeFlavorList(item.product.flavors),
                kind: item.product.kind,
              }}
              saved
            />
          ))}
        </div>
      )}
    </section>
  );
}
