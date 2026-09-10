"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { primaryMedia } from "@/components/shop/product-media";
import { IconGift, IconTag, IconTruck } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { useT } from "@/lib/i18n/context";
import type { CatalogCategory, CatalogProduct } from "@/types/catalog";

export function ShopByCategory({
  categories,
  products,
}: {
  categories: CatalogCategory[];
  products: CatalogProduct[];
}) {
  const t = useT();
  return (
    <Reveal>
      <section id="categories" className="scroll-mt-28">
        <div className="mb-4 flex items-end justify-between gap-3 sm:mb-5">
          <h2 className="section-title">{t.home.shopByCategory}</h2>
          <Link href="/shop" className="shrink-0 btn-ghost text-sm">
            {t.common.viewAll}
          </Link>
        </div>
        <Stagger className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categories.map((category) => {
            // Use the first product in the category that actually has a photo.
            const withPhoto = products.find(
              (product) =>
                product.categoryId === category.id && product.images.length > 0,
            );
            const image = withPhoto ? primaryMedia(withPhoto.images) : undefined;
            return (
              <StaggerItem key={category.id}>
                <CategoryCard
                  href={`/shop?category=${category.slug}`}
                  name={category.name}
                  image={image}
                />
              </StaggerItem>
            );
          })}
        </Stagger>
      </section>
    </Reveal>
  );
}

function CategoryCard({
  href,
  name,
  image,
}: {
  href: string;
  name: string;
  image?: { url: string };
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div whileHover={reduce ? undefined : { y: -4 }}>
      <Link href={href} className="category-card">
        <span className="category-card-image">
          {image ? (
            <Image
              src={image.url}
              alt={name}
              fill
              sizes="(min-width: 640px) 18vw, 45vw"
            />
          ) : null}
        </span>
        <span className="category-card-name">{name}</span>
      </Link>
    </motion.div>
  );
}

export function TodaysDeals({
  products,
  savedIds = [],
}: {
  products: CatalogProduct[];
  savedIds?: string[];
}) {
  const t = useT();
  const deals = products.filter((product) => product.featured).slice(0, 3);
  const saved = new Set(savedIds);

  if (deals.length === 0) {
    return null;
  }

  return (
    <Reveal>
      <section id="deals" className="scroll-mt-28">
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
          <h2 className="section-title">{t.home.todaysDeals}</h2>
          <span className="badge">{t.home.limitedTime}</span>
        </div>
        <div className="deals-grid">
          {deals.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              saved={saved.has(product.id)}
            />
          ))}
        </div>
        <div className="mt-5 flex justify-center sm:mt-6">
          <Link href="/shop?deals=1" className="btn btn-outline">
            {t.home.viewAllDeals}
          </Link>
        </div>
      </section>
    </Reveal>
  );
}

export function Bundles({
  bundles,
  savedIds = [],
}: {
  bundles: CatalogProduct[];
  savedIds?: string[];
}) {
  const t = useT();
  const saved = new Set(savedIds);
  const shown = bundles.slice(0, 3);

  if (shown.length === 0) {
    return null;
  }

  return (
    <Reveal>
      <section id="bundles" className="page-wrap scroll-mt-28 py-6 sm:py-10">
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
          <h2 className="section-title">{t.home.bundles.title}</h2>
        </div>
        <div className="deals-grid">
          {shown.map((bundle) => (
            <ProductCard
              key={bundle.id}
              product={bundle}
              saved={saved.has(bundle.id)}
            />
          ))}
        </div>
        <div className="mt-5 flex justify-center sm:mt-6">
          <Link href="/bundles" className="btn btn-outline">
            {t.home.bundles.seeAll}
          </Link>
        </div>
      </section>
    </Reveal>
  );
}

export function PromoSidebar() {
  const reduce = useReducedMotion();
  const t = useT();

  return (
    <aside className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-1">
      <motion.div
        className="rounded-2xl bg-[var(--footer)] p-5 text-[var(--footer-foreground)] sm:p-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={reduce ? { duration: 0 } : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
          {t.home.promoStayHome}
        </p>
        <p className="mt-3 text-sm leading-6 text-[var(--footer-foreground)]/80">
          {t.home.promoStayHomeBody}
        </p>
        <Link href="/shop" className="btn btn-accent mt-5 w-full sm:mt-6 sm:w-auto">
          <IconTruck className="size-4" />
          {t.home.orderForDelivery}
        </Link>
      </motion.div>
      <motion.div
        className="card p-5 sm:p-6"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }
        }
      >
        <span className="icon-well text-accent">
          <IconGift className="size-5" />
        </span>
        <p className="mt-4 text-lg font-bold text-primary">{t.home.referFriend}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {t.home.referFriendBody}
        </p>
        <Link href="/rewards" className="btn-ghost mt-4 inline-block text-sm">
          {t.home.getReferralLink}
        </Link>
      </motion.div>
    </aside>
  );
}

export function RewardsBar() {
  const t = useT();
  return (
    <Reveal>
      <section id="rewards" className="page-wrap scroll-mt-28 py-6 sm:py-10">
        <div className="card grid grid-cols-1 gap-5 px-4 py-5 sm:px-6 sm:py-7 lg:grid-cols-3 lg:gap-0">
          <Perk
            icon={IconGift}
            title={t.home.perks.earnTitle}
            body={t.home.perks.earnBody}
          />
          <Perk
            icon={IconTag}
            title={t.home.perks.redeemTitle}
            body={t.home.perks.redeemBody}
            divided
          />
          <Perk
            icon={IconTruck}
            title={t.home.perks.extrasTitle}
            body={t.home.perks.extrasBody}
            divided
          />
        </div>
      </section>
    </Reveal>
  );
}

function Perk({
  icon: Icon,
  title,
  body,
  divided = false,
}: {
  icon: typeof IconGift;
  title: string;
  body: string;
  divided?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 ${
        divided ? "border-t border-border pt-5 lg:border-l lg:border-t-0 lg:px-6 lg:pt-0" : "lg:pr-6"
      }`}
    >
      <span className="icon-well text-accent">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-primary">
          <Link href="/rewards" className="hover:underline">
            {title}
          </Link>
        </p>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
