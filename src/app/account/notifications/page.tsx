import type { Metadata } from "next";
import Link from "next/link";
import { formatDate } from "@/lib/dates";
import { getDict, getI18n } from "@/lib/i18n/server";
import {
  listNotifications,
  markNotificationsRead,
} from "@/server/account/hub";
import { requireUser } from "@/server/auth/current-user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.account.nav.notifications };
}

export default async function AccountNotificationsPage() {
  const user = await requireUser("/account/notifications");
  const [notifications, { locale, t }] = await Promise.all([
    listNotifications(user.id).catch(() => []),
    getI18n(),
  ]);
  await markNotificationsRead(user.id).catch(() => undefined);

  return (
    <section>
      <h2 className="section-title">{t.account.notifications.title}</h2>
      {notifications.length === 0 ? (
        <p className="card mt-4 p-5 text-sm text-muted-foreground">
          {t.account.notifications.empty}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {notifications.map((item) => {
            const inner = (
              <>
                <p className="font-semibold text-primary">{item.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatDate(item.createdAt, locale)}
                </p>
              </>
            );
            return (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`card block p-4 ${item.readAt ? "" : "ring-1 ring-primary/20"}`}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className={`card p-4 ${item.readAt ? "" : "ring-1 ring-primary/20"}`}>
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
