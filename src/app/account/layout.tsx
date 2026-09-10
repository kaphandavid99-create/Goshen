import type { ReactNode } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { Avatar } from "@/components/account/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { PageIntro } from "@/components/layout/page-intro";
import { getDict } from "@/lib/i18n/server";
import { countUnreadNotifications } from "@/server/account/hub";
import { consumeFirstDashboardVisit } from "@/server/account/welcome";
import { requireUser } from "@/server/auth/current-user";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const [unread, isFirstVisit, t] = await Promise.all([
    countUnreadNotifications(user.id).catch(() => 0),
    consumeFirstDashboardVisit(user.id),
    getDict(),
  ]);
  const firstName = user.name.split(" ")[0];
  const greeting = isFirstVisit
    ? t.account.welcome(firstName)
    : t.account.welcomeBack(firstName);

  return (
    <div className="page-wrap flex-1 py-10 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} url={user.avatarUrl} size={52} />
          <PageIntro kicker={t.account.kicker} title={greeting}>
            {t.account.intro}
          </PageIntro>
        </div>
        <LogoutButton />
      </div>
      <AccountNav unread={unread} />
      <div className="mt-8">{children}</div>
    </div>
  );
}
