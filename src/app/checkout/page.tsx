import type { Metadata } from "next";
import { CheckoutForm } from "@/app/checkout/checkout-form";
import { PageIntro } from "@/components/layout/page-intro";
import { isMomoConfigured } from "@/lib/env";
import { getDict } from "@/lib/i18n/server";
import { listAddresses, getAccountProfile } from "@/server/account/hub";
import { getUserPoints } from "@/server/account/referrals";
import { requireUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.checkout };
}

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const [points, profile, addresses, t] = await Promise.all([
    getUserPoints(user.id),
    getAccountProfile(user.id),
    listAddresses(user.id).catch(() => []),
    getDict(),
  ]);

  return (
    <main className="page-wrap max-w-5xl flex-1 py-12">
      <PageIntro kicker={t.checkout.kicker} title={t.checkout.title}>
        {t.checkout.intro}
      </PageIntro>
      <CheckoutForm
        defaultName={profile?.name ?? user.name}
        defaultPhone={profile?.phone ?? ""}
        points={points}
        addresses={addresses}
        momoAvailable={isMomoConfigured()}
      />
    </main>
  );
}
