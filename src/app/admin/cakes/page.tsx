import type { Metadata } from "next";
import {
  CakeBookingList,
  type AdminCakeBooking,
} from "@/components/admin/cake-bookings";
import { CakeItemList, CakeUploader } from "@/components/admin/cake-manager";
import { isCloudinaryConfigured } from "@/lib/env";
import { NIPZ } from "@/lib/constants";
import { listAllCakeItems, listCakeBookings } from "@/server/cakes/queries";

export const metadata: Metadata = {
  title: "Cakes & bookings",
};

export default async function AdminCakesPage() {
  const configured = isCloudinaryConfigured();
  const [items, bookings] = await Promise.all([
    listAllCakeItems(),
    listCakeBookings().catch(() => [] as AdminCakeBooking[]),
  ]);

  const openCount = bookings.filter(
    (booking) => booking.status === "NEW" || booking.status === "CONTACTED",
  ).length;

  return (
    <main>
      <p className="kicker">Nipz Pretty Cakes &amp; Pastries</p>
      <h1 className="page-title mt-1">Cakes &amp; bookings</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Manage the photos on the{" "}
        <a href={NIPZ.href} className="btn-ghost" target="_blank" rel="noreferrer">
          public cakes page
        </a>{" "}
        and review custom orders customers have requested.
      </p>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="section-title">Add a gallery photo</h2>
        <p className="mt-2 mb-5 text-sm text-muted-foreground">
          Photos go to Cloudinary as-is (no background removal) and appear on the
          public page immediately.
        </p>
        <CakeUploader configured={configured} />
      </section>

      <section className="mt-10">
        <h2 className="section-title">Gallery</h2>
        <div className="mt-4">
          <CakeItemList items={items} />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <h2 className="section-title">Booking requests</h2>
          {openCount > 0 ? (
            <span className="badge">{openCount} open</span>
          ) : null}
        </div>
        <div className="mt-4">
          <CakeBookingList bookings={bookings} />
        </div>
      </section>
    </main>
  );
}
