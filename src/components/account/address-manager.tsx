"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useT } from "@/lib/i18n/context";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type FieldErrors = Record<string, string[] | undefined>;

type AddressRecord = {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  line: string;
  isDefault: boolean;
};

export function AddressManager({
  addresses,
  defaultName,
  defaultPhone,
}: {
  addresses: AddressRecord[];
  defaultName: string;
  defaultPhone: string;
}) {
  const router = useRouter();
  const t = useT();
  const a = t.account.addresses;
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const [editingId, setEditingId] = useState<string | "new" | null>(
    addresses.length === 0 ? "new" : null,
  );

  async function save(event: React.FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setFieldErrors({});
    const form = new FormData(event.currentTarget);
    const payload = {
      label: String(form.get("label") ?? ""),
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      line: String(form.get("line") ?? ""),
      isDefault: form.get("isDefault") === "on",
    };

    try {
      const response = await fetch(
        id ? `/api/account/addresses/${id}` : "/api/account/addresses",
        {
          method: id ? "PATCH" : "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": await readCsrf(),
          },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        fieldErrors?: FieldErrors;
      };
      if (!response.ok) {
        setError(data.error ?? a.unableToSave);
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }
      setEditingId(null);
      router.refresh();
    } catch {
      setError(a.networkError);
    } finally {
      setPending(false);
    }
  }

  async function remove(id: string) {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "x-csrf-token": await readCsrf() },
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? a.unableToDelete);
        return;
      }
      router.refresh();
    } catch {
      setError(a.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && editingId !== "new" ? (
        <p className="text-sm text-muted-foreground">{a.emptyHint}</p>
      ) : null}

      {addresses.map((address) =>
        editingId === address.id ? (
          <AddressForm
            key={address.id}
            defaults={address}
            pending={pending}
            fieldErrors={fieldErrors}
            a={a}
            onSubmit={(event) => void save(event, address.id)}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <article key={address.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-primary">
                  {address.label}
                  {address.isDefault ? (
                    <span className="ml-2 text-xs font-medium text-muted-foreground">
                      {a.default}
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-sm">{address.fullName}</p>
                <p className="text-sm text-muted-foreground">{address.phone}</p>
                <p className="mt-2 text-sm whitespace-pre-wrap">{address.line}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="btn-ghost text-sm"
                  onClick={() => setEditingId(address.id)}
                >
                  {a.edit}
                </button>
                <button
                  type="button"
                  className="btn-ghost text-sm"
                  disabled={pending}
                  onClick={() => void remove(address.id)}
                >
                  {a.delete}
                </button>
              </div>
            </div>
          </article>
        ),
      )}

      {editingId === "new" ? (
        <AddressForm
          defaults={{
            label: a.defaultLabel,
            fullName: defaultName,
            phone: defaultPhone,
            line: "",
            isDefault: addresses.length === 0,
          }}
          pending={pending}
          fieldErrors={fieldErrors}
          a={a}
          onSubmit={(event) => void save(event)}
          onCancel={() => setEditingId(null)}
        />
      ) : (
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setEditingId("new")}
        >
          {a.add}
        </button>
      )}

      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function AddressForm({
  defaults,
  pending,
  fieldErrors,
  a,
  onSubmit,
  onCancel,
}: {
  defaults: {
    label: string;
    fullName: string;
    phone: string;
    line: string;
    isDefault: boolean;
  };
  pending: boolean;
  fieldErrors: FieldErrors;
  a: Dictionary["account"]["addresses"];
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5" noValidate>
      <Field id="label" name="label" label={a.fieldLabel} defaultValue={defaults.label} error={fieldErrors.label?.[0]} />
      <Field id="fullName" name="fullName" label={a.fullName} defaultValue={defaults.fullName} error={fieldErrors.fullName?.[0]} />
      <Field id="phone" name="phone" label={a.phone} defaultValue={defaults.phone} error={fieldErrors.phone?.[0]} />
      <div className="space-y-2">
        <label htmlFor="line" className="block text-sm font-medium">
          {a.line}
        </label>
        <textarea
          id="line"
          name="line"
          rows={3}
          defaultValue={defaults.line}
          className="field"
        />
        {fieldErrors.line?.[0] ? (
          <p className="text-sm text-accent">{fieldErrors.line[0]}</p>
        ) : null}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" defaultChecked={defaults.isDefault} />
        {a.useAsDefault}
      </label>
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? a.saving : a.save}
        </button>
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          {a.cancel}
        </button>
      </div>
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
      <input id={id} name={name} defaultValue={defaultValue} className="field" />
      {error ? <p className="text-sm text-accent">{error}</p> : null}
    </div>
  );
}
