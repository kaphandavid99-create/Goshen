import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconClock,
  IconPhone,
  IconPin,
} from "@/components/icons";
import { APP_NAME, NAV_LINKS, STORE } from "@/lib/constants";
import { getDict } from "@/lib/i18n/server";

const ACCOUNT_LINKS = [
  { href: "/login", key: "signIn" },
  { href: "/register", key: "createAccount" },
  { href: "/account", key: "dashboard" },
  { href: "/cart", key: "cart" },
] as const;

function isStoreOpen(now = new Date()) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Douala",
      hour: "numeric",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .find((part) => part.type === "hour")?.value,
  );

  return hour >= 7 && hour < 21;
}

export async function SiteFooter() {
  const t = await getDict();
  const open = isStoreOpen();

  return (
    <footer className="site-footer">
      <div className="page-wrap">
        <div className="footer-status">
          <p className="footer-status-row">
            <span className={open ? "footer-live" : "footer-live is-closed"}>
              {open ? t.footer.openNow : t.footer.closedNow}
            </span>
            <span className="footer-status-dot" aria-hidden="true" />
            <span>{STORE.hours}</span>
            <span className="footer-status-dot" aria-hidden="true" />
            <span>{STORE.location}</span>
          </p>
        </div>

        <div className="grid items-end gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-14">
          <div className="min-w-0">
            <Link href="/" className="footer-brand">
              <span className="footer-logo-mark">
                <Image
                  src="/logo.png"
                  alt=""
                  width={80}
                  height={80}
                />
              </span>
              <span>
                <span className="footer-brand-name">{APP_NAME}</span>
                <span className="footer-brand-tag">New Bell · Bamenda</span>
              </span>
            </Link>

            <p className="footer-eyebrow">{t.footer.eyebrow}</p>
            <p className="footer-headline">
              <span className="footer-line">{t.footer.headline[0]}</span>
              <span className="footer-line">{t.footer.headline[1]}</span>
              <span className="footer-line is-accent">{t.footer.headline[2]}</span>
            </p>
            <span className="footer-rule" aria-hidden="true" />
            <p className="footer-lead">
              {t.footer.lead}
              <em>{t.footer.leadEm}</em>
            </p>
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row">
              <Link href="/shop" className="btn btn-accent w-full min-[420px]:w-auto">
                {t.common.shopNow}
                <IconArrowRight className="size-4" />
              </Link>
              <a
                href={STORE.whatsappHref}
                className="btn footer-ghost w-full min-[420px]:w-auto"
              >
                {t.common.whatsappShop}
              </a>
            </div>
          </div>

          <aside className="footer-visit">
            <p className="footer-card-kicker">{t.footer.visitTitle}</p>
            <ul className="mt-5 space-y-4">
              <li className="flex gap-3">
                <span className="footer-icon">
                  <IconPin className="size-4" />
                </span>
                <span>
                  <span className="footer-meta">{t.footer.location}</span>
                  <span className="footer-meta-value">{STORE.location}</span>
                  <a
                    href={STORE.directionsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-meta-value is-link"
                  >
                    {t.common.getDirections}
                  </a>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="footer-icon">
                  <IconClock className="size-4" />
                </span>
                <span>
                  <span className="footer-meta">{t.footer.hours}</span>
                  <span className="footer-meta-value">{STORE.hours}</span>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="footer-icon">
                  <IconPhone className="size-4" />
                </span>
                <span>
                  <span className="footer-meta">{t.footer.call}</span>
                  <a href={STORE.phoneHref} className="footer-meta-value is-link">
                    {STORE.phoneDisplay}
                  </a>
                </span>
              </li>
            </ul>
            <Link href="/contact" className="footer-card-link">
              {t.footer.contactSupport}
            </Link>
          </aside>
        </div>

        <div className="grid gap-8 border-t border-white/10 py-8 sm:grid-cols-3">
          <div>
            <p className="footer-col-title">{t.footer.explore}</p>
            <ul className="mt-4 space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="footer-link">
                    {t.nav[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-col-title">{t.footer.accountCol}</p>
            <ul className="mt-4 space-y-2.5">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.key}>
                  <Link href={link.href} className="footer-link">
                    {t.footer.accountLinks[link.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="footer-col-title">{t.footer.rewardsCol}</p>
            <p className="footer-col-copy">{t.footer.rewardsCopy}</p>
            <Link href="/rewards" className="footer-link is-accent">
              {t.footer.howRewardsWork}
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden border-t border-white/10">
        <div className="page-wrap flex flex-col gap-3 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="footer-legal">
            {t.footer.rightsReserved(new Date().getFullYear())}
          </p>
          <p className="footer-legal">{STORE.location}</p>
        </div>
        <p className="footer-wordmark" aria-hidden="true">
          {Array.from(APP_NAME.toUpperCase()).map((letter, index) => (
            <span key={`${letter}-${index}`}>{letter}</span>
          ))}
        </p>
      </div>
    </footer>
  );
}
