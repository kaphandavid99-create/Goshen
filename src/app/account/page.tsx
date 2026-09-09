import type { Metadata } from "next";
import Link from "next/link";
import { AvatarUploader } from "@/components/account/avatar-uploader";
import { ProfileForm } from "@/components/account/profile-form";
import { formatDate } from "@/lib/dates";
import { getDict, getI18n } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatPrice } from "@/lib/money";
import { getCustomerDashboard } from "@/server/account/dashboard";
import { getAccountProfile } from "@/server/account/hub";
import { requireUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.account.nav.profile };
}

export default async function AccountProfilePage() {
  const user = await requireUser();
  const [dashboard, profile, { locale, t }] = await Promise.all([
    getCustomerDashboard(user.id),
    getAccountProfile(user.id),
    getI18n(),
  ]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="card p-5 sm:p-6">
        <h2 className="section-title">{t.account.profile.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.account.profile.memberSince(
            profile ? formatDate(profile.createdAt, locale) : "—",
          )}
        </p>
        <div className="mt-5">
          <AvatarUploader
            name={profile?.name ?? user.name}
            avatarUrl={profile?.avatarUrl ?? null}
          />
        </div>
        <ProfileForm
          name={profile?.name ?? user.name}
          email={profile?.email ?? user.email}
          phone={profile?.phone ?? ""}
        />
      </section>

      <section className="grid grid-cols-2 gap-3 content-start">
        <Stat label={t.account.stats.orders} value={String(dashboard.stats.orderCount)} href="/account/orders" />
        <Stat label={t.account.stats.points} value={String(dashboard.stats.points)} href="/account/rewards" />
        <Stat label={t.account.stats.spent} value={formatPrice(dashboard.stats.spent, locale)} href="/account/orders" />
        <Stat
          label={t.account.stats.pending}
          value={String(dashboard.stats.pendingCount)}
          href="/account/orders"
        />
        <Link href="/shop" className="btn btn-primary col-span-2">
          {t.account.stats.continueShopping}
        </Link>
        <WholesaleCard status={user.wholesaleStatus} t={t} />
      </section>
    </div>
  );
}

function WholesaleCard({
  status,
  t,
}: {
  status: string;
  t: Dictionary;
}) {
  const c = t.account.wholesaleCard;
  const copy =
    status === "APPROVED"
      ? { title: c.approvedTitle, cta: c.approvedCta, href: "/wholesale" }
      : status === "PENDING"
        ? { title: c.pendingTitle, cta: c.pendingCta, href: "/wholesale" }
        : status === "REJECTED"
          ? { title: c.rejectedTitle, cta: c.rejectedCta, href: "/wholesale/apply" }
          : { title: c.noneTitle, cta: c.noneCta, href: "/wholesale/apply" };

  return (
    <Link href={copy.href} className="card col-span-2 p-4 sm:p-5">
      <p className="text-xs text-muted-foreground">{c.label}</p>
      <p className="mt-1 font-semibold text-primary">{copy.title}</p>
      <p className="mt-2 text-sm underline underline-offset-4">{copy.cta}</p>
    </Link>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href} className="card p-4 sm:p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-bold tracking-tight text-primary sm:text-xl">
        {value}
      </p>
    </Link>
  );
}
