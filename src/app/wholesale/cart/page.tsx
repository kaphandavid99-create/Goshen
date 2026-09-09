import type { Metadata } from "next";
import { PageIntro } from "@/components/layout/page-intro";
import { WholesaleCartView } from "@/components/wholesale/wholesale-cart-view";
import { getDict } from "@/lib/i18n/server";
import { requireApprovedWholesale } from "@/server/wholesale/access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.wholesale.cartTitle };
}

export default async function WholesaleCartPage() {
  await requireApprovedWholesale("/wholesale/cart");
  const t = await getDict();

  return (
    <main className="page-wrap flex-1 py-12">
      <PageIntro kicker={t.wholesale.kicker} title={t.wholesale.cartTitle} />
      <WholesaleCartView />
    </main>
  );
}
