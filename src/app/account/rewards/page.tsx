import type { Metadata } from "next";
import Link from "next/link";
import { ReferralShare } from "@/components/account/referral-share";
import { PointsProgress } from "@/components/account/points-progress";
import {
  MIN_REDEEM_POINTS,
  MIN_REDEEM_SUBTOTAL,
  POINT_VALUE_FCFA,
  REFERRAL_POINTS,
  REVIEW_POINTS,
  WELCOME_POINTS,
} from "@/lib/constants";
import { getDict, getI18n } from "@/lib/i18n/server";
import { formatPrice } from "@/lib/money";
import { getCustomerDashboard } from "@/server/account/dashboard";
import { requireUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.account.nav.rewards };
}

export default async function AccountRewardsPage() {
  const user = await requireUser("/account/rewards");
  const [dashboard, { locale, t }] = await Promise.all([
    getCustomerDashboard(user.id),
    getI18n(),
  ]);

  const points = dashboard.stats.points;
  const ready = points >= MIN_REDEEM_POINTS;
  const remainder = points % MIN_REDEEM_POINTS;
  const progressInBlock = points > 0 && remainder === 0 ? MIN_REDEEM_POINTS : remainder;
  const remainingToNextMilestone = MIN_REDEEM_POINTS - progressInBlock;

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <h2 className="section-title">{t.account.rewards.title}</h2>
        <div className="mt-4">
          <PointsProgress
            points={points}
            milestone={MIN_REDEEM_POINTS}
            pointsLabel={t.account.rewards.pointsAmount(points)}
            readyLabel={t.account.rewards.progressReady}
            lockedLabel={t.account.rewards.progressLocked}
            ready={ready}
            caption={
              ready
                ? t.account.rewards.progressReadyBody(
                    points,
                    formatPrice(points * POINT_VALUE_FCFA, locale),
                  )
                : t.account.rewards.progressToNext(MIN_REDEEM_POINTS - points)
            }
          />
          {ready && remainingToNextMilestone > 0 ? (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {t.account.rewards.progressNextMilestone(remainingToNextMilestone)}
            </p>
          ) : null}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {t.account.rewards.redeemHint(
            MIN_REDEEM_POINTS,
            formatPrice(MIN_REDEEM_SUBTOTAL, locale),
          )}
        </p>
        <Link href="/checkout" className="btn btn-primary mt-5">
          {t.account.rewards.redeemAtCheckout}
        </Link>
      </section>

      <section className="card p-5 sm:p-6" id="referral">
        <h2 className="section-title">{t.account.rewards.referTitle}</h2>
        {dashboard.referral.code ? (
          <div className="mt-5">
            <ReferralShare
              code={dashboard.referral.code}
              url={dashboard.referral.url}
            />
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t.account.rewards.friendsSignedUp}
                </dt>
                <dd className="mt-1 font-medium">{dashboard.referral.signedUp}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">
                  {t.account.rewards.firstOrderRewards}
                </dt>
                <dd className="mt-1 font-medium">{dashboard.referral.completed}</dd>
              </div>
            </dl>
            {dashboard.referredFriends.length > 0 ? (
              <ul className="mt-5 space-y-2 text-sm">
                {dashboard.referredFriends.map((friend) => (
                  <li
                    key={friend.id}
                    className="flex justify-between gap-3 border-t border-border pt-2"
                  >
                    <span className="font-medium text-primary">{friend.name}</span>
                    <span className="text-muted-foreground">
                      {friend.referralRewarded
                        ? t.account.rewards.friendFirstOrder(REFERRAL_POINTS)
                        : t.account.rewards.friendWaiting}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            {t.account.rewards.noReferralYet}
          </p>
        )}
      </section>

      <section className="card p-5 text-sm text-muted-foreground">
        {t.account.rewards.summary(WELCOME_POINTS, REFERRAL_POINTS, REVIEW_POINTS)}{" "}
        <Link href="/rewards" className="underline">
          {t.account.rewards.rewardsLink}
        </Link>
        .
      </section>
    </div>
  );
}
