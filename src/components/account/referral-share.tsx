"use client";

import { useState } from "react";
import {
  REFERRAL_POINTS,
  REFERRAL_SIGNUP_POINTS,
  WELCOME_POINTS,
} from "@/lib/constants";
import { useT } from "@/lib/i18n/context";

export function ReferralShare({
  code,
  url,
}: {
  code: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);
  const t = useT();
  const message = t.referral.shareText(url);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t.referral.blurb(REFERRAL_SIGNUP_POINTS, REFERRAL_POINTS, WELCOME_POINTS)}
      </p>
      <p className="text-sm">
        <span className="text-muted-foreground">{t.referral.yourCode}</span>{" "}
        <span className="font-semibold text-primary">{code}</span>
      </p>
      <input
        readOnly
        value={url}
        className="field"
        aria-label={t.referral.linkLabel}
        onFocus={(event) => event.currentTarget.select()}
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary" onClick={() => void copyLink()}>
          {copied ? t.referral.copied : t.referral.copy}
        </button>
        <a
          className="btn btn-outline"
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
        >
          {t.referral.shareOnWhatsapp}
        </a>
      </div>
    </div>
  );
}
