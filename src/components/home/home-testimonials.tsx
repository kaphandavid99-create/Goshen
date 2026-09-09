import { Avatar } from "@/components/account/avatar";
import { IconStar } from "@/components/icons";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { LOCALE_BCP47, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { getI18n } from "@/lib/i18n/server";
import { listPublishedTestimonials } from "@/server/feedback/queries";

type Testimonial = Awaited<
  ReturnType<typeof listPublishedTestimonials>
>[number];

export async function HomeTestimonials() {
  const [testimonials, { locale, t }] = await Promise.all([
    listPublishedTestimonials(6),
    getI18n(),
  ]);

  if (testimonials.length === 0) {
    return null;
  }

  const average =
    testimonials.reduce((sum, item) => sum + item.rating, 0) /
    testimonials.length;

  return (
    <Reveal>
      <section className="page-wrap py-6 sm:py-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">{t.home.testimonials.kicker}</p>
            <h2 className="section-title mt-1">{t.home.testimonials.title}</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5">
            <IconStar className="size-4 text-accent" fill="currentColor" stroke="none" />
            <span className="text-sm font-semibold text-primary">
              {average.toFixed(1)}
            </span>
            <span className="text-xs text-muted-foreground">
              {t.home.testimonials.averageSuffix}
            </span>
          </div>
        </div>

        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((item) => (
            <StaggerItem key={item.id} className="h-full">
              <TestimonialCard testimonial={item} locale={locale} t={t} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </Reveal>
  );
}

function TestimonialCard({
  testimonial,
  locale,
  t,
}: {
  testimonial: Testimonial;
  locale: Locale;
  t: Dictionary;
}) {
  return (
    <figure className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_18px_40px_rgb(0_0_0/0.16)] dark:hover:shadow-[0_18px_40px_rgb(0_0_0/0.55)]">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-accent transition-transform duration-300 group-hover:scale-x-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-4 top-1 select-none font-serif text-[5rem] leading-none text-primary/[0.09]"
      >
        &ldquo;
      </span>

      <div className="relative flex items-center gap-0.5 text-accent">
        {[0, 1, 2, 3, 4].map((index) => (
          <IconStar
            key={index}
            className="size-4"
            fill={index < testimonial.rating ? "currentColor" : "none"}
            stroke={index < testimonial.rating ? "none" : "currentColor"}
          />
        ))}
        <span className="sr-only">
          {t.home.testimonials.starsOutOf5(testimonial.rating)}
        </span>
      </div>

      <blockquote className="relative mt-4 flex-1 text-[0.9375rem] leading-7 text-foreground">
        {testimonial.message}
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <Avatar
          name={testimonial.user.name}
          url={testimonial.user.avatarUrl}
          size={40}
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-primary">
            {firstName(testimonial.user.name)}
          </span>
          <span className="block text-xs text-muted-foreground">
            {t.home.testimonials.verifiedOn(monthYear(testimonial.createdAt, locale))}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

function monthYear(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(LOCALE_BCP47[locale] === "fr" ? "fr-FR" : "en-GB", {
    month: "short",
    year: "numeric",
  }).format(date);
}
