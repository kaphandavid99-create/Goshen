import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BookingForm } from "@/app/shop/nipz/booking-form";
import { CakeGallery } from "@/app/shop/nipz/cake-gallery";
import { IconCake, IconCheck, IconClock, IconPhone, IconPin } from "@/components/icons";
import { NIPZ, STORE } from "@/lib/constants";
import { getDict } from "@/lib/i18n/server";
import { listCakeItems } from "@/server/cakes/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: NIPZ.name, description: t.nipz.metaDescription };
}

export default async function NipzPage() {
  const [items, t] = await Promise.all([listCakeItems(), getDict()]);
  const collage = [
    ...items.filter((item) => item.featured),
    ...items.filter((item) => !item.featured),
  ].slice(0, 3);

  return (
    <main className="nipz page-wrap flex-1 py-10 sm:py-12">
      <Link href="/shop" className="btn-ghost text-sm">
        {t.nipz.backToShop}
      </Link>

      <section className="nipz-hero mt-4">
        <div className="nipz-hero-grid">
          <div>
            <p className="nipz-eyebrow">
              <IconCake className="size-4" />
              {t.nipz.eyebrow}
            </p>
            <h1 className="nipz-title">
              {t.nipz.title} <em>{t.nipz.titleEm}</em>
            </h1>
            <p className="nipz-lead">{t.nipz.lead}</p>
            <div className="nipz-hero-actions">
              <a href="#book" className="btn btn-rose">
                {t.nipz.bookACake}
              </a>
              <a href="#gallery" className="btn btn-outline">
                {t.nipz.browseGallery}
              </a>
              <a
                href={NIPZ.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                {t.nipz.whatsappBakery}
              </a>
            </div>
          </div>

          {collage.length > 0 ? (
            <div className="nipz-hero-collage">
              {collage.map((item, index) => (
                <figure key={item.id}>
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 900px) 22vw, 45vw"
                  />
                </figure>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="nipz-stat-row">
        <div className="nipz-stat">
          <p className="nipz-stat-value">{t.nipz.stats.madeToOrder}</p>
          <p className="nipz-stat-label">{t.nipz.stats.madeToOrderLabel}</p>
        </div>
        <div className="nipz-stat">
          <p className="nipz-stat-value">{t.nipz.stats.daysNotice(NIPZ.bookingLeadDays)}</p>
          <p className="nipz-stat-label">{t.nipz.stats.daysNoticeLabel}</p>
        </div>
        <div className="nipz-stat">
          <p className="nipz-stat-value">{t.nipz.stats.pickupOrDelivery}</p>
          <p className="nipz-stat-label">{t.nipz.stats.pickupOrDeliveryLabel}</p>
        </div>
      </section>

      <section id="gallery" className="mt-14 scroll-mt-24">
        <p className="kicker">{t.nipz.galleryKicker}</p>
        <h2 className="page-title text-[length:clamp(1.5rem,5vw,2.25rem)]">
          {t.nipz.galleryTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {t.nipz.galleryIntro}
        </p>
        <div className="mt-8">
          <CakeGallery items={items} />
        </div>
      </section>

      <section className="mt-16">
        <p className="kicker">{t.nipz.stepsKicker}</p>
        <h2 className="page-title text-[length:clamp(1.5rem,5vw,2.25rem)]">
          {t.nipz.stepsTitle}
        </h2>
        <div className="nipz-steps mt-8">
          {t.nipz.steps.map((step) => (
            <div key={step.title} className="nipz-step">
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="book" className="mt-16 scroll-mt-24">
        <div className="nipz-book">
          <div className="nipz-book-grid">
            <aside className="nipz-book-aside">
              <p className="nipz-eyebrow">
                <IconCake className="size-4" />
                {t.nipz.bookEyebrow}
              </p>
              <h2 className="nipz-title text-[length:clamp(1.6rem,5vw,2.1rem)]">
                {t.nipz.bookTitle}
              </h2>
              <ul className="mt-6 space-y-3">
                {t.nipz.bookChecks.map((check) => (
                  <li key={check} className="nipz-check">
                    <IconCheck className="size-4" />
                    {check}
                  </li>
                ))}
              </ul>

              <div className="mt-8 space-y-3 border-t border-border pt-6 text-sm">
                <p className="flex items-center gap-2 text-muted-foreground">
                  <IconPin className="size-4 text-primary" />
                  {STORE.location}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <IconClock className="size-4 text-primary" />
                  {STORE.hours}
                </p>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <IconPhone className="size-4 text-primary" />
                  <a href={NIPZ.whatsappHref} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                    {NIPZ.phoneDisplay}
                  </a>
                </p>
              </div>
            </aside>

            <div className="nipz-book-form">
              <BookingForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
