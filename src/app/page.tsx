import { HomeHero } from "@/components/home/home-hero";
import {
  PromoSidebar,
  RewardsBar,
  ShopByCategory,
  TodaysDeals,
} from "@/components/home/home-sections";
import { HomeTestimonials } from "@/components/home/home-testimonials";
import { InfoRibbon } from "@/components/home/info-ribbon";
import { listCategories, listProducts } from "@/server/catalog/queries";
import { getHeroContent } from "@/server/site/hero";
import { listWishlistProductIds } from "@/server/account/hub";
import { getCurrentUser } from "@/server/auth/current-user";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [hero, categories, products, savedIds] = await Promise.all([
    getHeroContent(),
    listCategories(),
    listProducts(),
    user ? listWishlistProductIds(user.id).catch(() => [] as string[]) : Promise.resolve([] as string[]),
  ]);

  return (
    <main className="min-w-0 flex-1 pb-12 sm:pb-16">
      <HomeHero content={hero} />
      <InfoRibbon />
      <section className="page-wrap grid grid-cols-1 gap-8 py-4 sm:py-6 lg:grid-cols-12 lg:gap-8 lg:py-8">
        <div className="min-w-0 lg:col-span-8">
          <ShopByCategory categories={categories} products={products} />
        </div>
        <div className="min-w-0 lg:col-span-4 lg:row-span-2">
          <PromoSidebar />
        </div>
        <div className="min-w-0 lg:col-span-8">
          <TodaysDeals products={products} savedIds={savedIds} />
        </div>
      </section>
      <HomeTestimonials />
      <RewardsBar />
    </main>
  );
}
