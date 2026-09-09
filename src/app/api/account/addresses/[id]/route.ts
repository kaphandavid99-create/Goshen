import { getCurrentUser } from "@/server/auth/current-user";
import { assertCsrf } from "@/server/auth/csrf";
import { jsonError } from "@/server/auth/request";
import { deleteAddress, updateAddress } from "@/server/account/hub";
import { addressSchema } from "@/validators/account";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to update an address.", 401);
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);

  if (!parsed.success) {
    return jsonError("Check the highlighted fields.", 400, parsed.error.flatten().fieldErrors);
  }

  try {
    const address = await updateAddress(user.id, id, {
      ...parsed.data,
      isDefault: parsed.data.isDefault ?? false,
    });
    if (!address) {
      return jsonError("Address not found.", 404);
    }
    return Response.json({ address });
  } catch {
    return jsonError("Unable to update this address.", 503);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await assertCsrf(request))) {
    return jsonError("Invalid or missing CSRF token.", 403);
  }

  const user = await getCurrentUser();
  if (!user) {
    return jsonError("Sign in to delete an address.", 401);
  }

  const { id } = await params;

  try {
    const removed = await deleteAddress(user.id, id);
    if (!removed) {
      return jsonError("Address not found.", 404);
    }
    return Response.json({ ok: true });
  } catch {
    return jsonError("Unable to delete this address.", 503);
  }
}
