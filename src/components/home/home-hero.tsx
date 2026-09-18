"use client";

import { useGSAP } from "@gsap/react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  IconArrowRight,
  IconGift,
  IconLeaf,
  IconPin,
  IconShield,
  IconTag,
  IconTruck,
} from "@/components/icons";
import { useT } from "@/lib/i18n/context";
import type { HeroContent, HeroImage } from "@/types/hero";

gsap.registerPlugin(useGSAP, ScrambleTextPlugin);

const trustIcons = [IconLeaf, IconTag, IconTruck, IconShield] as const;
const trustKeys = ["quality", "prices", "delivery", "payOnArrival"] as const;
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";

function HeroMedia({ images }: { images: HeroImage[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) {
      return;
    }
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % images.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <>
      {images.map((image, index) => (
        <Image
          key={image.id}
          src={image.url}
          alt={image.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 36rem, 100vw"
          className="hero-media-zoom object-cover transition-opacity duration-700 ease-out"
          style={{ opacity: index === active ? 1 : 0 }}
        />
      ))}
    </>
  );
}

export function HomeHero({ content }: { content: HeroContent }) {
  const root = useRef<HTMLElement>(null);
  const t = useT();
  const loopLines = content.rotatingLines.length
    ? content.rotatingLines
    : ["right around the corner."];

  useGSAP(
    () => {
      const headline = root.current?.querySelector<HTMLElement>(".hero-headline-text");
      const typeText = root.current?.querySelector<HTMLElement>(".hero-type-text");
      if (!headline || !typeText) {
        return;
      }

      const reduce =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const revealEls = ".hero-kicker, .hero-lead, .hero-cta, .hero-trust";

      typeText.textContent = loopLines[0];
      gsap.set(".hero-rule", { scaleX: 0, transformOrigin: "left center" });
      gsap.set(".hero-kicker", reduce ? {} : { autoAlpha: 0, y: 10 });
      gsap.set(headline, reduce ? {} : { autoAlpha: 0, y: 14 });
      gsap.set(typeText, reduce ? {} : { autoAlpha: 0 });
      gsap.set(revealEls, reduce ? { autoAlpha: 1, y: 0 } : { autoAlpha: 0, y: 18 });

      if (reduce) {
        return;
      }

      const intro = gsap.timeline({
        defaults: { ease: "power3.out" },
        delay: 0.06,
      });

      intro
        .to(".hero-kicker", { autoAlpha: 1, y: 0, duration: 0.45 }, 0)
        .to(headline, { autoAlpha: 1, y: 0, duration: 0.5 }, 0.15)
        .to(
          headline,
          {
            duration: 0.9,
            ease: "none",
            scrambleText: {
              text: content.headline,
              chars: SCRAMBLE_CHARS,
              revealDelay: 0.25,
              speed: 0.35,
            },
          },
          0.15,
        )
        .to(".hero-rule", { scaleX: 1, duration: 0.45, ease: "power2.out" }, 0.55)
        .set(typeText, { autoAlpha: 1 }, 0.9)
        .to(
          typeText,
          {
            duration: 0.9,
            ease: "none",
            scrambleText: {
              text: loopLines[0],
              chars: SCRAMBLE_CHARS,
              revealDelay: 0.25,
              speed: 0.35,
            },
          },
          0.9,
        )
        .to(revealEls, { autoAlpha: 1, y: 0, stagger: 0.07, duration: 0.5 }, 1.05);

      if (loopLines.length < 2) {
        return;
      }

      const loop = gsap.timeline({ repeat: -1, delay: 2.2 });

      loopLines.forEach((_, index) => {
        const next = loopLines[(index + 1) % loopLines.length];
        loop
          .to({}, { duration: 1.8 })
          .to(typeText, {
            duration: Math.min(1.3, 0.6 + next.length * 0.025),
            ease: "none",
            scrambleText: {
              text: next,
              chars: SCRAMBLE_CHARS,
              revealDelay: 0.25,
              speed: 0.35,
            },
          });
      });
    },
    { scope: root, dependencies: [content.headline, loopLines.join("|")] },
  );

  return (
    <section ref={root} className="border-b border-border bg-background">
      <div className="page-wrap grid grid-cols-1 items-center gap-6 py-8 sm:gap-8 sm:py-10 lg:grid-cols-2 lg:gap-x-12 lg:gap-y-0 lg:py-16">
        <div className="hero-copy min-w-0 lg:col-start-1 lg:row-start-1">
          <p className="hero-kicker">
            <IconPin className="size-3.5 shrink-0" aria-hidden />
            <span>{content.kicker}</span>
          </p>
          <h1 className="hero-title">
            <span className="sr-only">
              {content.headline} {loopLines.join(" ")}
            </span>
            <span className="hero-title-visual" aria-hidden="true">
              <span className="hero-line hero-headline-text">{content.headline}</span>
              <span className="hero-rotate hero-title-accent">
                <span className="hero-type-text">{loopLines[0]}</span>
              </span>
            </span>
          </h1>
          <span className="hero-rule" aria-hidden="true" />
          <p className="hero-lead">{content.lead}</p>
        </div>

        <motion.div
          className="hero-media relative aspect-[16/10] w-full overflow-hidden sm:aspect-[4/3] lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-none lg:self-start"
          initial={{ opacity: 0, scale: 1.06, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
        >
          <HeroMedia images={content.images} />
        </motion.div>

        <div className="hero-actions min-w-0 lg:col-start-1 lg:row-start-2 lg:mt-9">
          <div className="hero-cta-row">
            <Link
              href={content.primaryCtaHref}
              className="hero-cta btn btn-primary"
            >
              {content.primaryCtaLabel}
              <IconArrowRight className="hero-cta-arrow size-4" />
            </Link>
            <Link
              href={content.secondaryCtaHref}
              className="hero-cta btn btn-outline"
            >
              <IconGift className="size-4 text-accent" />
              {content.secondaryCtaLabel}
            </Link>
          </div>
          <ul className="hero-trust-list">
            {trustKeys.map((key, index) => {
              const Icon = trustIcons[index];
              return (
                <li key={key} className="hero-trust">
                  <span className="hero-trust-icon">
                    <Icon className="size-4" />
                  </span>
                  <span>{t.home.trust[key]}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
