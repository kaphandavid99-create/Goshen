import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/layout/page-intro";
import { WholesaleCatalog } from "@/components/wholesale/wholesale-catalog";
import { WHOLESALE } from "@/lib/constants";
import { getDict, getI18n } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/money";
import { getWholesaleViewer } from "@/server/wholesale/access";
import {
  getMyWholesaleApplication,
  listWholesaleProducts,
} from "@/server/wholesale/queries";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.wholesale, description: t.wholesale.metaDescription };
}

export default async function WholesalePage() {
  const [{ user, status }, { locale, t }] = await Promise.all([
    getWholesaleViewer(),
    getI18n(),
  ]);

  if (status === "APPROVED") {
    const products = await listWholesaleProducts();
    return (
      <main className="page-wrap flex-1 py-12">
        <PageIntro kicker={t.wholesale.kicker} title={t.wholesale.catalogTitle}>
          {t.wholesale.catalogIntro(formatPrice(WHOLESALE.minOrderCents, locale))}
        </PageIntro>
        <p className="mt-4 text-sm">
          <Link href="/wholesale/cart" className="btn-ghost">
            {t.wholesale.viewCart}
          </Link>
        </p>
        <WholesaleCatalog products={products} />
      </main>
    );
  }

  const application = user ? await getMyWholesaleApplication(user.id) : null;

  return (
    <main className="page-wrap flex-1 py-12">
      <PageIntro kicker={t.wholesale.kicker} title={t.wholesale.applyTitle}>
        {t.wholesale.applyIntro}
      </PageIntro>

      <div className="card mt-8 max-w-xl space-y-4 p-6">
        {!user ? (
          <>
            <p className="text-sm text-muted-foreground">
              {t.wholesale.signInPrompt}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/login?next=/wholesale/apply" className="btn btn-primary">
                {t.wholesale.signIn}
              </Link>
              <Link href="/register?next=/wholesale/apply" className="btn btn-outline">
                {t.wholesale.createAccount}
              </Link>
            </div>
          </>
        ) : status === "PENDING" ? (
          <>
            <p className="font-medium text-primary">
              {t.wholesale.pendingTitle}
            </p>
            <p className="text-sm text-muted-foreground">
              {t.wholesale.pendingBody(
                application?.businessName ?? "",
                application?.phone ?? t.wholesale.yourPhone,
              )}
            </p>
            <Link href="/wholesale/apply" className="btn-ghost text-sm">
              {t.wholesale.updateApplication}
            </Link>
          </>
        ) : status === "REJECTED" ? (
          <>
            <p className="font-medium text-primary">
              {t.wholesale.rejectedTitle}
            </p>
            <p className="text-sm text-muted-foreground">
              {t.wholesale.rejectedBody}
            </p>
            <Link href="/wholesale/apply" className="btn btn-primary">
              {t.wholesale.submitNewApplication}
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {t.wholesale.signedInPrompt}
            </p>
            <Link href="/wholesale/apply" className="btn btn-primary">
              {t.wholesale.applyForWholesale}
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
