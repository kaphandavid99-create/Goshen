"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/shop/product-card";
import { primaryMedia } from "@/components/shop/product-media";
import { IconArrowRight, IconCheck, IconGift, IconLeaf, IconShield, IconTag, IconTruck, IconUsers } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  MAX_REDEEM_POINTS_PER_ORDER,
  MIN_REDEEM_POINTS,
  MIN_REDEEM_SUBTOTAL,
  REFERRAL_POINTS,
  REFERRAL_SIGNUP_POINTS,
} from "@/lib/constants";
import { useLocale, useT } from "@/lib/i18n/context";
import { formatPrice } from "@/lib/money";
import { isNewArrival } from "@/lib/new-arrivals";
import type { CatalogCategory, CatalogProduct } from "@/types/catalog";
import type { CakeItem } from "@/types/cakes";

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

export function NewArrivals({
  products,
  savedIds = [],
}: {
  products: CatalogProduct[];
  savedIds?: string[];
}) {
  const t = useT();
  const saved = new Set(savedIds);
  const arrivals = products
    .filter((product) => isNewArrival(product.createdAt))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 8);

  if (arrivals.length === 0) {
    return null;
  }

  return (
    <Reveal>
      <section id="new-arrivals" className="page-wrap scroll-mt-28 py-6 sm:py-10">
        <div className="mb-4 flex flex-wrap items-center gap-2 sm:mb-5 sm:gap-3">
          <h2 className="section-title">{t.home.newArrivals}</h2>
          <span className="badge">{t.home.justLanded}</span>
        </div>
        <div className="shop-grid grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {arrivals.map((product, index) => (
            <div key={product.id} className={index >= 4 ? "hidden sm:block" : undefined}>
              <ProductCard product={product} saved={saved.has(product.id)} />
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center sm:mt-6">
          <Link href="/shop?new=1" className="btn btn-outline">
            {t.home.viewAllNewArrivals}
          </Link>
        </div>
      </section>
    </Reveal>
  );
}

export function NipzTeaser({ items }: { items: CakeItem[] }) {
  const t = useT();
  const locale = useLocale();
  // Signature items first, so the three shown are the ones most worth showing off.
  const shown = [...items]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 3);

  if (shown.length === 0) {
    return null;
  }

  function priceParts(item: CakeItem): { note: string | null; amount: string } {
    if (item.priceCents != null) {
      return { note: item.priceNote || null, amount: formatPrice(item.priceCents, locale) };
    }
    return { note: null, amount: item.priceNote || t.nipz.priceOnRequest };
  }

  return (
    <Reveal>
      <section id="nipz" className="page-wrap scroll-mt-28 py-6 sm:py-10">
        <div className="mb-4 sm:mb-5">
          <p className="kicker nipz-teaser-kicker">{t.home.nipzTeaser.kicker}</p>
          <h2 className="section-title">{t.home.nipzTeaser.title}</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {t.home.nipzTeaser.body}
          </p>
        </div>
        <div className="nipz-gallery">
          {shown.map((item) => {
            const price = priceParts(item);
            return (
              <Link key={item.id} href="/shop/nipz" className="nipz-cake-card">
                <div className="nipz-cake-media">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="(min-width: 960px) 30vw, (min-width: 560px) 45vw, 90vw"
                    className="object-cover"
                  />
                  {item.featured ? (
                    <span className="nipz-cake-badge">{t.nipz.signature}</span>
                  ) : null}
                </div>
                <div className="nipz-cake-body">
                  <p className="nipz-cake-cat">{item.category}</p>
                  <h3 className="nipz-cake-name">{item.name}</h3>
                  <div className="nipz-cake-foot">
                    <span className="nipz-cake-price">
                      {price.note ? <span>{price.note}</span> : null}
                      {price.amount}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="mt-5 flex justify-center sm:mt-6">
          <Link href="/shop/nipz" className="btn btn-rose">
            {t.home.nipzTeaser.cta}
            <IconArrowRight className="size-4" />
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
          {t.home.referFriendBody(REFERRAL_SIGNUP_POINTS, REFERRAL_POINTS)}
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
  const locale = useLocale();
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
            body={t.home.perks.redeemBody(
              MIN_REDEEM_POINTS,
              MAX_REDEEM_POINTS_PER_ORDER,
              formatPrice(MIN_REDEEM_SUBTOTAL, locale),
            )}
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

export function WhyShopWithGoshen() {
  const t = useT();
  const benefits = [
    {
      icon: IconTruck,
      title: t.home.whyShop?.fastDelivery || "Fast & Reliable Delivery",
      description: t.home.whyShop?.fastDeliveryDesc || "Same-day and next-day delivery options available for your convenience",
      backgroundImage: "/one.jpeg",
    },
    {
      icon: IconLeaf,
      title: t.home.whyShop?.premium || "Premium Quality Products",
      description: t.home.whyShop?.premiumDesc || "Carefully selected and curated items to meet the highest standards",
      backgroundImage: "/two.jpeg",
    },
    {
      icon: IconShield,
      title: t.home.whyShop?.secure || "Secure & Trusted",
      description: t.home.whyShop?.secureDesc || "100% secure transactions with buyer protection on every purchase",
      backgroundImage: "/three.jpeg",
    },
    {
      icon: IconUsers,
      title: t.home.whyShop?.community || "Loyal Community",
      description: t.home.whyShop?.communityDesc || "Join thousands of satisfied customers and earn rewards on every order",
      backgroundImage: "/four.jpeg",
    },
    {
      icon: IconCheck,
      title: t.home.whyShop?.support || "Expert Support",
      description: t.home.whyShop?.supportDesc || "Dedicated customer service team ready to help you 24/7",
      backgroundImage: "/five.jpeg",
    },
  ];

  return (
    <Reveal>
      <section className="page-wrap py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <p className="kicker">{t.home.whyShop?.kicker || "Why Choose Us"}</p>
          <h2 className="section-title mt-1">{t.home.whyShop?.title || "Why You Should Shop With Goshen"}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t.home.whyShop?.description || "Discover what makes Goshen your favorite destination for quality products and exceptional service"}
          </p>
        </div>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.map((benefit, index) => (
            <StaggerItem key={index} className="h-full">
              <WhyShopCard
                icon={benefit.icon}
                title={benefit.title}
                description={benefit.description}
                backgroundImage={benefit.backgroundImage}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </Reveal>
  );
}

function WhyShopCard({
  icon: Icon,
  title,
  description,
  backgroundImage,
}: {
  icon: typeof IconTruck;
  title: string;
  description: string;
  backgroundImage: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border/50 transition-all duration-500 hover:border-accent/50 hover:shadow-[0_16px_40px_rgb(0_0_0/0.12)] dark:hover:shadow-[0_16px_40px_rgb(0_0_0/0.4)]"
      whileHover={reduce ? undefined : { y: -6, scale: 1.02 }}
    >
      <div
        className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5 origin-left scale-x-0 bg-accent transition-transform duration-500 group-hover:scale-x-100"
      />
      <span
        aria-hidden
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="relative z-10 flex h-full flex-col p-7 sm:p-8">
        <span className="mb-6 inline-flex w-fit rounded-2xl bg-accent/25 p-4 text-accent transition-all duration-300 group-hover:bg-accent/35 backdrop-blur-md">
          <Icon className="size-8" />
        </span>

        <h3 className="text-lg font-bold tracking-tight text-white leading-snug drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-white drop-shadow-md" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{description}</p>
      </div>

      <span
        aria-hidden
        className="absolute -left-4 -bottom-4 h-24 w-24 rounded-full bg-white/5 transition-all duration-500 group-hover:scale-150"
      />
    </motion.div>
  );
}
