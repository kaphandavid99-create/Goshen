import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { STORE } from "@/lib/constants";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.about };
}

export default async function AboutPage() {
  const t = await getDict();

  return (
    <main className="page-wrap max-w-3xl flex-1 py-12">
      <PageIntro kicker={t.about.kicker} title={t.about.title}>
        {t.about.intro}
      </PageIntro>

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
        <StaggerItem className="card p-6">
          <h2 className="font-semibold text-primary">{t.about.whereTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{STORE.location}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{STORE.hours}</p>
        </StaggerItem>
        <StaggerItem className="card p-6">
          <h2 className="font-semibold text-primary">{t.about.howTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t.about.howBody}
          </p>
        </StaggerItem>
      </Stagger>

      <Reveal className="mt-8 flex flex-wrap gap-4 text-sm" delay={0.08}>
        <Link href="/shop" className="btn btn-primary">
          {t.about.browseShop}
        </Link>
        <Link href="/contact" className="btn btn-outline">
          {t.about.contactUs}
        </Link>
      </Reveal>
    </main>
  );
}
