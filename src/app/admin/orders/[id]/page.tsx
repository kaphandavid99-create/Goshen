import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/account/avatar";
import { OrderActions } from "@/components/admin/order-actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { StarRating } from "@/components/feedback/star-rating";
import { ProductMedia } from "@/components/shop/product-media";
import { formatDateTime } from "@/lib/dates";
import {
  formatFlavorSummary,
  normalizeFlavorQuantities,
} from "@/lib/flavors";
import { formatPrice } from "@/lib/money";
import { getAdminOrder } from "@/server/admin/queries";

type OrderItem = NonNullable<
  Awaited<ReturnType<typeof getAdminOrder>>
>["items"][number];

type Media = {
  id: string;
  url: string;
  alt: string;
  resourceType: string;
  sortOrder: number;
};

function galleryFor(item: OrderItem): Media[] {
  const images = item.product?.images ?? [];
  if (images.length > 0) {
    return images;
  }
  if (item.imageUrl) {
    return [
      {
        id: item.id,
        url: item.imageUrl,
        alt: item.name,
        resourceType: "image",
        sortOrder: 0,
      },
    ];
  }
  return [];
}

export const metadata: Metadata = {
  title: "Order",
};

export default async function AdminOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);

  if (!order) {
    notFound();
  }

  return (
    <main>
      <Link href="/admin/orders" className="btn-ghost text-sm">
        Back to orders
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="kicker">Order</p>
          <h1 className="page-title mt-1">{order.orderNumber}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {formatDateTime(order.createdAt)} · {order.user.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {order.channel === "WHOLESALE" ? (
            <span className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
              Wholesale
            </span>
          ) : null}
          <StatusBadge status={order.status} />
        </div>
      </div>

      <section className="card mt-8 p-5 sm:p-6">
        <h2 className="section-title">Update</h2>
        <div className="mt-5">
          <OrderActions orderId={order.id} status={order.status} />
        </div>
        {order.acceptedAt ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Confirmed {formatDateTime(order.acceptedAt)}
          </p>
        ) : null}
        {order.receivedAt ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Customer received {formatDateTime(order.receivedAt)}
          </p>
        ) : null}
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Avatar name={order.user.name} url={order.user.avatarUrl} size={40} />
          <div>
            <h2 className="section-title">Customer</h2>
            <p className="text-sm text-muted-foreground">{order.user.name}</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <Row label="Name on order" value={order.fullName} />
          <Row label="Phone" value={order.phone} />
          <Row
            label="Method"
            value={order.fulfillment === "DELIVERY" ? "Delivery" : "Pickup"}
          />
          <Row label="Account email" value={order.user.email} />
          <Row label="Address" value={order.address ?? "Pickup at the shop"} />
          <Row label="Notes" value={order.notes ?? "None"} />
        </dl>
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="section-title">
          Items{" "}
          <span className="text-sm font-normal text-muted-foreground">
            · {order.items.length} product{order.items.length === 1 ? "" : "s"},{" "}
            {order.items.reduce((sum, item) => sum + item.quantity, 0)} pcs
          </span>
        </h2>

        <ul className="mt-5 divide-y divide-border">
          {order.items.map((item) => {
            const gallery = galleryFor(item);
            const removed = item.productId === null;
            const outOfStock = item.product?.inStock === false;

            return (
              <li key={item.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {removed ? (
                        item.name
                      ) : (
                        <Link
                          href={`/shop/${item.slug}`}
                          target="_blank"
                          className="hover:underline"
                        >
                          {item.name}
                        </Link>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.unit} · {formatPrice(item.priceCents)} ×{" "}
                      {item.quantity}
                    </p>
                    {(() => {
                      const flavors = formatFlavorSummary(
                        normalizeFlavorQuantities(item.flavors),
                      );
                      return flavors ? (
                        <p className="mt-1 text-xs font-medium text-foreground">
                          {flavors}
                        </p>
                      ) : null;
                    })()}
                    {item.product?.kind === "BUNDLE" &&
                    item.product.bundleItems.length > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Bundle:{" "}
                        {item.product.bundleItems
                          .map(
                            (part) =>
                              `${part.quantity}× ${part.product.name} (${part.product.unit})`,
                          )
                          .join(", ")}
                      </p>
                    ) : null}
                    {removed ? (
                      <p className="mt-1 text-xs text-accent">
                        Product deleted from the catalogue — photos below are from
                        the order.
                      </p>
                    ) : outOfStock ? (
                      <p className="mt-1 text-xs text-accent">
                        Currently marked out of stock.
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-sm font-semibold">
                    {formatPrice(item.priceCents * item.quantity)}
                  </span>
                </div>

                {gallery.length > 0 ? (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {gallery.map((media) => (
                      <a
                        key={media.id}
                        href={media.url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted transition hover:border-primary"
                      >
                        <ProductMedia
                          media={media}
                          sizes="96px"
                          className="size-full object-contain p-1"
                        />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No photo on file for this product.
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
          <p className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotalCents)}</span>
          </p>
          <p className="flex justify-between">
            <span>Delivery</span>
            <span>
              {order.channel === "WHOLESALE"
                ? "Arranged after confirmation"
                : order.deliveryCents === 0
                  ? "Free"
                  : formatPrice(order.deliveryCents)}
            </span>
          </p>
          {order.discountCents > 0 ? (
            <p className="flex justify-between text-accent">
              <span>Points discount ({order.pointsRedeemed} pts)</span>
              <span>−{formatPrice(order.discountCents)}</span>
            </p>
          ) : null}
          <p className="flex justify-between font-bold text-primary">
            <span>Total</span>
            <span>{formatPrice(order.totalCents)}</span>
          </p>
        </div>
      </section>

      {order.testimonial || order.reviews.length > 0 ? (
        <section className="card mt-6 p-5 sm:p-6">
          <h2 className="section-title">Customer feedback</h2>
          {order.testimonial ? (
            <div className="mt-5">
              <StarRating value={order.testimonial.rating} />
              <p className="mt-2 text-sm leading-6 text-foreground">
                {order.testimonial.message}
              </p>
            </div>
          ) : null}
          {order.reviews.length > 0 ? (
            <ul className="mt-5 space-y-3 border-t border-border pt-4">
              {order.reviews.map((review) => (
                <li key={review.id}>
                  <p className="text-sm font-medium text-primary">{review.product.name}</p>
                  <StarRating value={review.rating} />
                  {review.comment ? (
                    <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium text-foreground">{value}</dd>
    </div>
  );
}
