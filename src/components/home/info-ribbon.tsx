"use client";

import Link from "next/link";
import { IconArrowRight, IconClock, IconGift, IconPhone, IconPin } from "@/components/icons";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { STORE } from "@/lib/constants";
import { useT } from "@/lib/i18n/context";
import type { Dictionary } from "@/lib/i18n/dictionaries";

function buildItems(r: Dictionary["home"]["ribbon"]) {
  return [
    { href: undefined, icon: IconClock, title: r.openDaily, detail: STORE.hours },
    {
      href: STORE.whatsappHref,
      icon: IconPhone,
      title: r.callWhatsapp,
      detail: STORE.phoneDisplay,
    },
    {
      href: "/contact",
      icon: IconPin,
      title: r.ourLocation,
      detail: STORE.location,
    },
    {
      href: "/rewards",
      icon: IconGift,
      title: r.rewards,
      detail: r.rewardsDetail,
    },
  ] as const;
}

function cellClass(index: number) {
  const borders = [
    index < 3 ? "border-b" : "",
    index >= 2 ? "sm:border-b-0" : "",
    index % 2 === 0 ? "sm:border-r" : "",
    index < 3 ? "lg:border-r" : "",
    "lg:border-b-0",
  ];

  return `min-w-0 px-4 py-4 sm:px-5 ${borders.filter(Boolean).join(" ")}`;
}

export function InfoRibbon() {
  const t = useT();
  const items = buildItems(t.home.ribbon);

  return (
    <section className="page-wrap py-6 sm:py-8">
      <Stagger className="card grid grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const content = (
            <span className="flex items-center gap-3">
              <span className="icon-well">
                <item.icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-primary">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  {item.detail}
                </span>
              </span>
              {item.href ? (
                <IconArrowRight className="hidden size-4 shrink-0 text-muted-foreground min-[400px]:block" />
              ) : null}
            </span>
          );

          const className = `${cellClass(index)} ${item.href ? "hover:bg-muted" : ""}`;

          if (!item.href) {
            return (
              <StaggerItem key={item.title}>
                <div className={className}>{content}</div>
              </StaggerItem>
            );
          }

          if (item.href.startsWith("http") || item.href.startsWith("tel")) {
            return (
              <StaggerItem key={item.title}>
                <a href={item.href} className={className}>
                  {content}
                </a>
              </StaggerItem>
            );
          }

          return (
            <StaggerItem key={item.title}>
              <Link href={item.href} className={className}>
                {content}
              </Link>
            </StaggerItem>
          );
        })}
      </Stagger>
    </section>
  );
}
