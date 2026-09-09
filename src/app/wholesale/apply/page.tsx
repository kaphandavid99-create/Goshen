import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageIntro } from "@/components/layout/page-intro";
import { WholesaleApplicationForm } from "@/components/wholesale/wholesale-application-form";
import { prisma } from "@/lib/db/prisma";
import { getDict } from "@/lib/i18n/server";
import { getCurrentUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.wholesale.applyPageTitle };
}

export default async function WholesaleApplyPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/wholesale/apply");
  }

  if (user.wholesaleStatus === "APPROVED") {
    redirect("/wholesale");
  }

  const profile = await prisma.user
    .findUnique({ where: { id: user.id }, select: { phone: true } })
    .catch(() => null);

  const resubmit =
    user.wholesaleStatus === "PENDING" || user.wholesaleStatus === "REJECTED";
  const t = await getDict();

  return (
    <main className="page-wrap flex-1 py-12">
      <PageIntro kicker={t.wholesale.kicker} title={t.wholesale.applyPageTitle}>
        {t.wholesale.applyPageIntroPre}{" "}
        <Link href="/wholesale" className="underline">
          {t.wholesale.applyPageIntroLink}
        </Link>
        .
      </PageIntro>

      {user.wholesaleStatus === "PENDING" ? (
        <p className="mt-6 text-sm text-muted-foreground">
          {t.wholesale.alreadyPending}
        </p>
      ) : null}

      <div className="max-w-xl">
        <WholesaleApplicationForm
          defaultPhone={profile?.phone ?? undefined}
          resubmit={resubmit}
        />
      </div>
    </main>
  );
}
