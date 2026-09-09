import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { WholesaleCheckoutForm } from "@/components/wholesale/wholesale-checkout-form";
import { getDict } from "@/lib/i18n/server";
import { getAccountProfile } from "@/server/account/hub";
import { requireApprovedWholesale } from "@/server/wholesale/access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.wholesale.checkoutTitle };
}

export default async function WholesaleCheckoutPage() {
  const user = await requireApprovedWholesale("/wholesale/checkout");
  const [profile, t] = await Promise.all([
    getAccountProfile(user.id).catch(() => null),
    getDict(),
  ]);

  return (
    <main className="page-wrap max-w-5xl flex-1 py-12">
      <PageIntro kicker={t.wholesale.kicker} title={t.wholesale.checkoutTitle}>
        {t.wholesale.checkoutIntro}
      </PageIntro>
      <WholesaleCheckoutForm
        defaultName={profile?.name ?? user.name}
        defaultPhone={profile?.phone ?? ""}
      />
    </main>
  );
}
