import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { createAddress, listAddresses } from "@/server/account/hub";
import { addressSchema } from "@/validators/account";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to view addresses.", 401);
  }

  try {
    const addresses = await listAddresses(user.id);
    return Response.json({ addresses });
  } catch {
    return jsonError("Unable to load addresses.", 503);
  }
}

export async function POST(request: Request) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to save an address.", 401);
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, parsed.error.flatten().fieldErrors);
  }

  try {
    const address = await createAddress(user.id, {
      ...parsed.data,
      isDefault: parsed.data.isDefault ?? false,
    });
    return Response.json({ address }, { status: 201 });
  } catch {
    return jsonError("Unable to save this address.", 503);
  }
}
