import { Prisma } from "@prisma/client";
import { hashPassword } from "@/lib/auth/password";
import { WELCOME_POINTS } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import {
  createUniqueReferralCode,
  findReferrerByCode,
} from "@/server/account/referrals";
import { assertCsrf } from "@/server/auth/csrf";
import { clientIp, jsonError, setAuthCookies } from "@/server/auth/request";
import { createSession, toPublicUser } from "@/server/auth/session";
import { registerSchema } from "@/validators/auth";
import { createNotification } from "@/server/account/notifications";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, parsed.error.flatten().fieldErrors);
  }

  try {
    const referrer = await findReferrerByCode(parsed.data.referralCode);
    const passwordHash = await hashPassword(parsed.data.password);
    const referralCode = await createUniqueReferralCode();

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          passwordHash,
          referralCode,
          referredById: referrer?.id ?? null,
          points: WELCOME_POINTS,
          referralRewarded: false,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          wholesaleStatus: true,
          avatarUrl: true,
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

    await setAuthCookies(session.token);

    return Response.json({ user: toPublicUser(user) }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return jsonError("An account with that email already exists.", 409);
    }

    return jsonError(
      "Unable to create an account. Confirm the database is running.",
      503,
    );
  }
}
