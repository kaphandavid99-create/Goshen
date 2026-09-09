"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { WHOLESALE } from "@/lib/constants";
import { useT } from "@/lib/i18n/context";

type FieldErrors = Record<string, string[] | undefined>;

export function WholesaleApplicationForm({
  defaultPhone,
  resubmit = false,
}: {
  defaultPhone?: string;
  resubmit?: boolean;
}) {
  const router = useRouter();
  const t = useT();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/wholesale/apply", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({
          businessName: String(form.get("businessName") ?? ""),
          businessType: String(form.get("businessType") ?? ""),
          phone: String(form.get("phone") ?? ""),
          location: String(form.get("location") ?? ""),
          note: String(form.get("note") ?? ""),
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        fieldErrors?: FieldErrors;
      };

      if (response.status === 401) {
        router.push("/login?next=/wholesale/apply");
        return;
      }

      if (!response.ok) {
        setError(data.error ?? t.wholesale.unableToSubmit);
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }

      router.push("/wholesale");
      router.refresh();
    } catch {
      setError(t.wholesale.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-8 space-y-5 p-6">
      <div className="space-y-2">
        <label htmlFor="businessName" className="block text-sm font-medium">
          {t.wholesale.businessName}
        </label>
        <input id="businessName" name="businessName" required className="field" />
        {fieldErrors.businessName?.[0] ? (
          <p className="text-sm text-accent">{fieldErrors.businessName[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="businessType" className="block text-sm font-medium">
          {t.wholesale.businessType}
        </label>
        <select id="businessType" name="businessType" required className="field">
          {WHOLESALE.businessTypes.map((type) => (
            <option key={type} value={type}>
              {t.wholesale.businessTypes[type] ?? type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-medium">
          {t.wholesale.phone}
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={defaultPhone}
          required
          className="field"
        />
        {fieldErrors.phone?.[0] ? (
          <p className="text-sm text-accent">{fieldErrors.phone[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="block text-sm font-medium">
          {t.wholesale.locationLabel}
        </label>
        <input
          id="location"
          name="location"
          required
          className="field"
          placeholder={t.wholesale.locationPlaceholder}
        />
        {fieldErrors.location?.[0] ? (
          <p className="text-sm text-accent">{fieldErrors.location[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="note" className="block text-sm font-medium">
          {t.wholesale.noteLabel}
        </label>
        <textarea
          id="note"
          name="note"
          rows={3}
          className="field"
          placeholder={t.wholesale.notePlaceholder}
        />
      </div>

      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending
          ? t.wholesale.submitting
          : resubmit
            ? t.wholesale.submitNewApplication
            : t.wholesale.applyForWholesale}
      </button>
    </form>
  );
}
