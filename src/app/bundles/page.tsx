import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { ProductCard } from "@/components/shop/product-card";
import { getDict } from "@/lib/i18n/server";
import { listWishlistProductIds } from "@/server/account/hub";
import { getCurrentUser } from "@/server/auth/current-user";
import { listBundles } from "@/server/catalog/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.bundles.title };
}

export default async function BundlesPage() {
  const [user, t] = await Promise.all([getCurrentUser(), getDict()]);
  const [bundles, savedIds] = await Promise.all([
    listBundles(),
    user
      ? listWishlistProductIds(user.id).catch(() => [] as string[])
      : Promise.resolve([] as string[]),
  ]);
  const saved = new Set(savedIds);

  return (
    <main className="page-wrap flex-1 py-12">
      <PageIntro kicker={t.bundles.kicker} title={t.bundles.title}>
        {t.bundles.intro}
      </PageIntro>

      {bundles.length === 0 ? (
        <p className="mt-12 text-muted-foreground">
          {t.bundles.empty}{" "}
          <Link href="/shop" className="text-foreground underline">
            {t.cart.continueShopping}
          </Link>
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {bundles.map((bundle) => (
            <ProductCard
              key={bundle.id}
              product={bundle}
              saved={saved.has(bundle.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
