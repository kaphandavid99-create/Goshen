"use client";

import { useState } from "react";
import { STORE } from "@/lib/constants";
import { useT } from "@/lib/i18n/context";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const t = useT();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const message = String(form.get("message") ?? "").trim();
    const text = name
      ? t.contact.waGreetingNamed(name, message)
      : t.contact.waGreeting(message);
    window.open(
      `${STORE.whatsappHref}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer",
    );
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="contact-name" className="block text-sm font-medium">
          {t.contact.yourName}
        </label>
        <input
          id="contact-name"
          name="name"
          required
          className="field"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="contact-message" className="block text-sm font-medium">
          {t.contact.message}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          className="field"
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {t.contact.sendOnWhatsapp}
      </button>
      {sent ? (
        <p className="text-sm text-muted-foreground">{t.contact.sentNote}</p>
      ) : null}
    </form>
  );
}
