import type { Metadata } from "next";
import { CartView } from "@/app/cart/cart-view";
import { PageIntro } from "@/components/layout/page-intro";
import { getDict } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.cart };
}

export default async function CartPage() {
  const t = await getDict();

  return (
    <main className="page-wrap w-full max-w-3xl flex-1 py-12">
      <PageIntro kicker={t.cart.kicker} title={t.cart.title}>
        {t.cart.intro}
      </PageIntro>
      <CartView />
    </main>
  );
}
