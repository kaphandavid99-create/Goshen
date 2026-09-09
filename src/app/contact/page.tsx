import type { Metadata } from "next";
import { ContactForm } from "@/app/contact/contact-form";
import { PageIntro } from "@/components/layout/page-intro";
import { StoreMap } from "@/components/layout/store-map";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { STORE } from "@/lib/constants";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.contact };
}

export default async function ContactPage() {
  const t = await getDict();

  return (
    <main className="page-wrap max-w-3xl flex-1 py-12">
      <PageIntro kicker={t.contact.kicker} title={t.contact.title}>
        {t.contact.intro}
      </PageIntro>

      <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
        <StaggerItem className="card p-6 text-sm">
          <p className="font-semibold text-primary">{t.contact.visitTitle}</p>
          <p className="mt-2 leading-6 text-muted-foreground">{STORE.location}</p>
          <p className="mt-1 leading-6 text-muted-foreground">{STORE.hours}</p>
          <a href="#find-us" className="btn-ghost mt-2 inline-block">
            {t.contact.seeOnMap}
          </a>
        </StaggerItem>
        <StaggerItem className="card p-6 text-sm">
          <p className="font-semibold text-primary">{t.contact.callWhatsappTitle}</p>
          <p className="mt-2">
            <a href={STORE.phoneHref} className="btn-ghost">
              {STORE.phoneDisplay}
            </a>
          </p>
          <p className="mt-2">
            <a href={STORE.whatsappHref} className="btn-ghost">
              {t.contact.chatOnWhatsapp}
            </a>
          </p>
        </StaggerItem>
      </Stagger>

      <Reveal className="mt-8">
        <StoreMap />
      </Reveal>

      <Reveal className="card mt-8 p-6">
        <h2 className="section-title">{t.contact.sendMessage}</h2>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          {t.contact.sendMessageHint}
        </p>
        <ContactForm />
      </Reveal>
    </main>
  );
}
