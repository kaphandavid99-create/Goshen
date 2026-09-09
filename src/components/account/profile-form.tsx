"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useT } from "@/lib/i18n/context";

type FieldErrors = Record<string, string[] | undefined>;

export function ProfileForm({
  name,
  email,
  phone,
}: {
  name: string;
  email: string;
  phone: string;
}) {
  const router = useRouter();
  const t = useT();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});
    setSaved(false);

    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
        }),
      });
      const data = (await response.json()) as {
        error?: string;
        fieldErrors?: FieldErrors;
      };
      if (!response.ok) {
        setError(data.error ?? t.account.profile.unableToSave);
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError(t.account.profile.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
      <Field
        id="name"
        name="name"
        label={t.account.profile.fullName}
        defaultValue={name}
        error={fieldErrors.name?.[0]}
      />
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          {t.account.profile.email}
        </label>
        <input
          id="email"
          value={email}
          readOnly
          className="field bg-muted"
        />
      </div>
      <Field
        id="phone"
        name="phone"
        label={t.account.profile.phone}
        defaultValue={phone}
        error={fieldErrors.phone?.[0]}
      />
      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-sm text-primary">{t.account.profile.saved}</p>
      ) : null}
      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? t.account.profile.saving : t.account.profile.save}
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  defaultValue,
  error,
}: {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        className="field"
        aria-invalid={error ? true : undefined}
      />
      {error ? <p className="text-sm text-accent">{error}</p> : null}
    </div>
  );
}
