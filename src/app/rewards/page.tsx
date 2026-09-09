import type { Metadata } from "next";
import Link from "next/link";
import { ReferralShare } from "@/components/account/referral-share";
import { IconGift, IconStar, IconTag, IconTruck } from "@/components/icons";
import { PageIntro } from "@/components/layout/page-intro";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import {
  MIN_REDEEM_POINTS,
  MIN_REDEEM_SUBTOTAL,
  REFERRAL_POINTS,
  REVIEW_POINTS,
  WELCOME_POINTS,
} from "@/lib/constants";
import { getDict, getI18n } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/money";
import { env } from "@/lib/env";
import { ensureReferralCode } from "@/server/account/referrals";
import { getCurrentUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.rewards };
}

export default async function RewardsPage() {
  const [user, { locale, t }] = await Promise.all([getCurrentUser(), getI18n()]);
  const code = user ? await ensureReferralCode(user.id).catch(() => null) : null;

  const perks = [
    { icon: IconGift, title: t.rewards.perks.earnTitle, body: t.rewards.perks.earnBody },
    {
      icon: IconTag,
      title: t.rewards.perks.referTitle,
      body: t.rewards.perks.referBody(WELCOME_POINTS, REFERRAL_POINTS),
    },
    {
      icon: IconStar,
      title: t.rewards.perks.reviewTitle,
      body: t.rewards.perks.reviewBody(REVIEW_POINTS),
    },
    {
      icon: IconTruck,
      title: t.rewards.perks.redeemTitle,
      body: t.rewards.perks.redeemBody(
        MIN_REDEEM_POINTS,
        formatPrice(MIN_REDEEM_SUBTOTAL, locale),
      ),
    },
  ];

  return (
    <main className="page-wrap max-w-3xl flex-1 py-12">
      <PageIntro kicker={t.rewards.kicker} title={t.rewards.title}>
        {t.rewards.intro}
      </PageIntro>

      {code ? (
        <Reveal className="card mt-8 p-5 sm:p-6">
          <h2 className="section-title">{t.rewards.yourInvite}</h2>
          <div className="mt-5">
            <ReferralShare
              code={code}
              url={`${env.appUrl}/register?ref=${code}`}
            />
          </div>
        </Reveal>
      ) : (
        <Reveal className="card mt-8 p-5 text-sm text-muted-foreground">
          {t.rewards.signInForLink}
        </Reveal>
      )}

      <Stagger className="mt-8 space-y-4">
        {perks.map((perk) => (
          <StaggerItem key={perk.title}>
            <div className="card flex gap-4 p-5">
              <span className="icon-well text-accent">
                <perk.icon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-primary">{perk.title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{perk.body}</p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-8 flex flex-wrap gap-3">
        {user ? (
          <Link href="/account/rewards" className="btn btn-primary">
            {t.rewards.openDashboard}
          </Link>
        ) : (
          <Link href="/register" className="btn btn-primary">
            {t.rewards.createAccount}
          </Link>
        )}
        <Link href="/shop" className="btn btn-outline">
          {t.rewards.startShopping}
        </Link>
      </Reveal>
    </main>
  );
}
