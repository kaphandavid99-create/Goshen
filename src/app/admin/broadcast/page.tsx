import type { Metadata } from "next";
import { BroadcastForm } from "@/components/admin/broadcast-form";
import { requireAdmin } from "@/server/admin/access";

export const metadata: Metadata = {
  title: "Broadcast",
};

export default async function AdminBroadcastPage() {
  await requireAdmin();

  return (
    <main>
      <p className="kicker">Marketing</p>
      <h1 className="page-title mt-1">Broadcast</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Send a push notification and in-app message to every customer at
        once — a discount, a promotion, a special offer, or any other
        announcement. There is no automatic trigger for this; each send is a
        deliberate, one-off blast.
      </p>

      <section className="card mt-8 max-w-xl p-5 sm:p-6">
        <BroadcastForm />
      </section>
    </main>
  );
}
