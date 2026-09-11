import { getCurrentUser } from "@/server/auth/current-user";
import { countUnreadNotifications } from "@/server/account/hub";

/** Polled by the header/tab-bar badge to keep the unread count fresh. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ count: 0 });
  }

  const count = await countUnreadNotifications(user.id).catch(() => 0);
  return Response.json({ count });
}
