import { prisma } from "@/lib/db/prisma";
import { clientIp, jsonError } from "@/server/auth/request";
import { getCurrentUser } from "@/server/auth/current-user";
import { checkVisitRateLimit } from "@/server/analytics/rate-limit";
import { resolveVisitorId } from "@/server/analytics/visitor";

/**
 * Fire-and-forget storefront page-view beacon. Not CSRF-protected — it takes
 * no action beyond logging a visit, so the worst a forged request can do is
 * inflate the count, which the rate limit below keeps cheap to abuse.
 */
export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const path =
    body && typeof body === "object" && "path" in body ? String((body as { path: unknown }).path ?? "") : "";

  if (!path.startsWith("/") || path.length > 300 || path.startsWith("/admin")) {
    return jsonError("Invalid path.", 400);
  }

  const visitorId = await resolveVisitorId();
  const rateKey = visitorId || clientIp(request) || "anonymous";
  if (!checkVisitRateLimit(rateKey)) {
    return new Response(null, { status: 204 });
  }

  const user = await getCurrentUser();

  try {
    await prisma.pageView.create({
      data: { path, visitorId, userId: user?.id ?? null },
    });
  } catch {
    // Best-effort — never fail the page for a logging hiccup.
  }

  return new Response(null, { status: 204 });
}
