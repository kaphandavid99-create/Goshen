import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { assertCsrf } from "@/server/auth/csrf";
import { clientIp, jsonError, setAuthCookies } from "@/server/auth/request";
import { createSession, toPublicUser } from "@/server/auth/session";
import { loginSchema } from "@/validators/auth";

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, parsed.error.flatten().fieldErrors);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return jsonError("Email or password is incorrect.", 401);
    }

    if (!user.passwordHash) {
      return jsonError("This account uses Google. Continue with Google.", 401);
    }

    const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);

    if (!passwordOk) {
      return jsonError("Email or password is incorrect.", 401);
    }

    const session = await createSession({
      userId: user.id,
      userAgent: request.headers.get("user-agent"),
      ipAddress: clientIp(request),
    });

    await setAuthCookies(session.token);

    return Response.json({
      user: toPublicUser(user),
    });
  } catch {
    return jsonError("Unable to sign in. Confirm the database is running.", 503);
  }
}
