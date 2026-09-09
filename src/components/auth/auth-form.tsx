"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { isSafeNextPath } from "@/lib/auth/safe-next";
import { useT } from "@/lib/i18n/context";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

type FieldErrors = Record<string, string[] | undefined>;

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const t = useT();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const safeNext = isSafeNextPath(next) ? next : null;
  const urlReferral = searchParams.get("ref")?.trim().toUpperCase() ?? "";
  const googleErrorCode = searchParams.get("error");
  const googleErrorText =
    googleErrorCode === "google_setup"
      ? t.auth.googleSetup
      : googleErrorCode === "google"
        ? t.auth.googleFailed
        : null;
  const [storedReferral, setStoredReferral] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [pending, setPending] = useState(false);
  const activeReferral = urlReferral || storedReferral;

  useEffect(() => {
    let cancelled = false;

    async function loadCsrf() {
      try {
        const response = await fetch("/api/auth/csrf", { cache: "no-store" });
        const data = (await response.json()) as { token?: string };
        if (!cancelled && data.token) {
          setCsrfToken(data.token);
        }
      } catch {
        if (!cancelled) {
          setError(t.auth.csrfError);
        }
      }
    }

    void loadCsrf();
    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    if (urlReferral) {
      window.sessionStorage.setItem("goshen_ref", urlReferral);
      setStoredReferral(urlReferral);
      return;
    }

    const stored = window.sessionStorage.getItem("goshen_ref")?.trim().toUpperCase() ?? "";
    if (stored) {
      setStoredReferral(stored);
    }
  }, [urlReferral]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      referralCode: activeReferral || undefined,
    };

    try {
      const csrfResponse = await fetch("/api/auth/csrf", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const csrfData = (await csrfResponse.json()) as { token?: string };
      const token = csrfData.token || csrfToken;

      const response = await fetch(
        mode === "register" ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": token,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = (await response.json()) as {
        error?: string;
        fieldErrors?: FieldErrors;
        user?: { role?: string };
      };

      if (!response.ok) {
        setError(data.error ?? t.auth.somethingWrong);
        setFieldErrors(data.fieldErrors ?? {});
        return;
      }

      window.sessionStorage.removeItem("goshen_ref");
      router.push(safeNext ?? "/account");
      router.refresh();
    } catch {
      setError(t.auth.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <a
        href={googleStartHref(mode, safeNext, activeReferral)}
        className="btn btn-outline w-full"
      >
        {t.auth.continueWithGoogle}
      </a>
      <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {mode === "register" ? t.auth.orCreateEmail : t.auth.orSignInEmail}
      </p>

      {mode === "register" ? (
        <Field
          id="name"
          name="name"
          label={t.auth.fullName}
          autoComplete="name"
          error={fieldErrors.name?.[0]}
        />
      ) : null}
      <Field
        id="email"
        name="email"
        label={t.auth.email}
        type="email"
        autoComplete="email"
        error={fieldErrors.email?.[0]}
      />
      <Field
        id="password"
        name="password"
        label={t.auth.password}
        type="password"
        autoComplete={mode === "register" ? "new-password" : "current-password"}
        error={fieldErrors.password?.[0]}
      />

      {mode === "register" && activeReferral ? (
        <p className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
          {t.auth.referralNote}{" "}
          <span className="font-semibold text-primary">{activeReferral}</span>.
        </p>
      ) : null}

      {error || googleErrorText ? (
        <p role="alert" className="text-sm text-accent">
          {error ?? googleErrorText}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !csrfToken}
        className="btn btn-primary w-full"
      >
        {pending
          ? t.auth.pleaseWait
          : mode === "register"
            ? t.auth.createAccount
            : t.auth.signIn}
      </button>

      <p className="text-sm text-muted-foreground">
        {mode === "register" ? (
          <>
            {t.auth.haveAccount}{" "}
            <Link
              href={withAuthPath("/login", safeNext, activeReferral)}
              className="text-foreground underline"
            >
              {t.auth.signIn}
            </Link>
          </>
        ) : (
          <>
            {t.auth.newToGoshen}{" "}
            <Link
              href={withAuthPath("/register", safeNext, activeReferral)}
              className="text-foreground underline"
            >
              {t.auth.createAnAccount}
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

function googleStartHref(mode: AuthMode, next: string | null, referral: string) {
  const params = new URLSearchParams();
  params.set("from", mode);
  if (next) {
    params.set("next", next);
  }
  if (referral) {
    params.set("ref", referral);
  }
  return `/api/auth/google?${params.toString()}`;
}

function withAuthPath(path: string, next: string | null, referral: string) {
  const params = new URLSearchParams();
  if (next) {
    params.set("next", next);
  }
  if (referral) {
    params.set("ref", referral);
  }
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function Field({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  error,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
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
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="field"
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </div>
  );
}
