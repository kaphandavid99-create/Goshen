import "server-only";

import { setDefaultResultOrder } from "node:dns";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { WELCOME_POINTS } from "@/lib/constants";
import { isSafeNextPath } from "@/lib/auth/safe-next";
import {
  SESSION_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  sessionCookieOptions,
  csrfCookieOptions,
} from "@/lib/auth/cookies";
import { createOpaqueToken } from "@/lib/auth/tokens";
import { env, isGoogleAuthConfigured, isProduction } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import {
  createUniqueReferralCode,
  findReferrerByCode,
} from "@/server/account/referrals";
import { createNotification } from "@/server/account/notifications";
import { clientIp } from "@/server/auth/request";
import { createSession } from "@/server/auth/session";

const OAUTH_COOKIE = "goshen_oauth_state";
const GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";

setDefaultResultOrder("ipv4first");

function callbackUri(request: Request) {
  return `${new URL(request.url).origin}/api/auth/google/callback`;
}

function oauthCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 10 * 60,
  };
}

type OAuthState = {
  state?: string;
  next?: string;
  ref?: string;
  from?: string;
  redirectUri?: string;
};

function authScreen(from: string | undefined) {
  return from === "register" ? "/register" : "/login";
}

export function googleFailRedirect(
  from: string | undefined,
  code: "google" | "google_setup",
) {
  const url = new URL(authScreen(from), env.appUrl);
  url.searchParams.set("error", code);
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_COOKIE, "", { ...oauthCookieOptions(), maxAge: 0 });
  return response;
}

function encodeOAuthState(payload: OAuthState) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeOAuthState(raw: string | undefined): OAuthState {
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as OAuthState;
  } catch {
    try {
      return JSON.parse(raw) as OAuthState;
    } catch {
      return {};
    }
  }
}

export function googleLoginRedirect(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") === "register" ? "register" : "login";

  if (!isGoogleAuthConfigured()) {
    return googleFailRedirect(from, "google_setup");
  }

  const next = url.searchParams.get("next");
  const ref = url.searchParams.get("ref")?.trim().toUpperCase() ?? "";
  const state = createOpaqueToken();
  const redirectUri = callbackUri(request);
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  const response = NextResponse.redirect(`${GOOGLE_AUTH}?${params.toString()}`);
  response.cookies.set(
    OAUTH_COOKIE,
    encodeOAuthState({
      state,
      next: isSafeNextPath(next) ? next : "/account",
      ref,
      from,
      redirectUri,
    }),
    oauthCookieOptions(),
  );
  return response;
}

export async function googleCallback(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const payload = decodeOAuthState(cookieStore.get(OAUTH_COOKIE)?.value);

  if (!code || !state || !payload.state || payload.state !== state) {
    return googleFailRedirect(payload.from, "google");
  }

  const redirectUri = payload.redirectUri || callbackUri(request);
  const tokenResponse = await fetch(GOOGLE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenResponse.ok) {
    const details = await tokenResponse.text().catch(() => "");
    console.error("Google token exchange failed", tokenResponse.status, details.slice(0, 400));
    return googleFailRedirect(payload.from, "google");
  }

  const tokens = (await tokenResponse.json()) as { access_token?: string };
  if (!tokens.access_token) {
    return googleFailRedirect(payload.from, "google");
  }

  const profileResponse = await fetch(GOOGLE_USERINFO, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileResponse.ok) {
    console.error("Google profile request failed", profileResponse.status);
    return googleFailRedirect(payload.from, "google");
  }

  const profile = (await profileResponse.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean | string;
    name?: string;
  };

  const email = profile.email?.trim().toLowerCase();
  const emailVerified =
    profile.email_verified !== false && profile.email_verified !== "false";
  if (!profile.sub || !email || !emailVerified) {
    return googleFailRedirect(payload.from, "google");
  }

  const referrer = await findReferrerByCode(payload.ref);
  const name = profile.name?.trim() || email.split("@")[0];
  const referralCode = await createUniqueReferralCode();

  const user = await prisma.$transaction(async (tx) => {
    const byGoogle = await tx.user.findUnique({
      where: { googleId: profile.sub },
    });
    if (byGoogle) {
      return byGoogle;
    }

    const byEmail = await tx.user.findUnique({
      where: { email },
    });
    if (byEmail) {
      if (byEmail.googleId && byEmail.googleId !== profile.sub) {
        throw new Error("GOOGLE_EMAIL_IN_USE");
      }

      if (byEmail.googleId === profile.sub) {
        return byEmail;
      }

      return tx.user.update({
        where: { id: byEmail.id },
        data: { googleId: profile.sub },
      });
    }

    const created = await tx.user.create({
      data: {
        email,
        name,
        googleId: profile.sub,
        passwordHash: null,
        referralCode,
        referredById: referrer && referrer.id ? referrer.id : null,
        points: WELCOME_POINTS,
        referralRewarded: false,
      },
    });
    await createNotification(tx, {
      userId: created.id,
      title: "Welcome to Goshen",
      body: `Your account is ready. You have ${WELCOME_POINTS} welcome points.`,
      href: "/account/rewards",
    });
    return created;
  });

  const session = await createSession({
    userId: user.id,
    userAgent: request.headers.get("user-agent"),
    ipAddress: clientIp(request),
  });

  const nextPath = isSafeNextPath(payload.next) ? payload.next : "/account";
  const response = NextResponse.redirect(new URL(nextPath, env.appUrl));
  response.cookies.set(SESSION_COOKIE_NAME, session.token, sessionCookieOptions());
  response.cookies.set(CSRF_COOKIE_NAME, createOpaqueToken(), csrfCookieOptions());
  response.cookies.set(OAUTH_COOKIE, "", { ...oauthCookieOptions(), maxAge: 0 });
  return response;
}
