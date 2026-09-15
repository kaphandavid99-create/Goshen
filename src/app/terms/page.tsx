import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { LEGAL_LAST_UPDATED } from "@/lib/constants";
import { formatDate } from "@/lib/dates";
import { getDict, getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.terms };
}

export default async function TermsPage() {
  const { locale, t } = await getI18n();
  const updated = formatDate(new Date(LEGAL_LAST_UPDATED), locale);

  return (
    <main className="page-wrap max-w-3xl flex-1 py-12">
      <PageIntro kicker={t.terms.kicker} title={t.terms.title}>
        {t.terms.intro}
      </PageIntro>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {t.terms.updatedLabel(updated)}
      </p>

      <Stagger className="mt-8 space-y-6">
        {t.terms.sections.map((section) => (
          <StaggerItem key={section.heading} className="card p-6">
            <h2 className="font-semibold text-primary">{section.heading}</h2>
            <div className="mt-2 space-y-3 text-sm leading-6 text-muted-foreground">
              {section.body.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-8 flex flex-wrap gap-4 text-sm" delay={0.08}>
        <Link href="/privacy" className="btn btn-outline">
          {t.privacy.title}
        </Link>
        <Link href="/contact" className="btn btn-ghost">
          {t.about.contactUs}
        </Link>
      </Reveal>
    </main>
  );
}
