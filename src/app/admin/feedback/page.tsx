import type { Metadata } from "next";
import Link from "next/link";
import { TestimonialPublish } from "@/components/admin/testimonial-publish";
import { StarRating } from "@/components/feedback/star-rating";
import { formatDateTime } from "@/lib/dates";
import { getAdminFeedback } from "@/server/feedback/queries";

export const metadata: Metadata = {
  title: "Feedback",
};

export default async function AdminFeedbackPage() {
  const data = await getAdminFeedback();

  return (
    <main>
      <p className="kicker">Insights</p>
      <h1 className="page-title mt-1">Feedback</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Testimonials and product reviews from customers who received their orders.
      </p>

      <section className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          label="Testimonials"
          value={String(data.stats.testimonialCount)}
        />
        <Stat
          label="Shop rating"
          value={formatAverage(data.stats.testimonialAverage)}
        />
        <Stat label="Item reviews" value={String(data.stats.reviewCount)} />
        <Stat
          label="Item rating"
          value={formatAverage(data.stats.reviewAverage)}
        />
      </section>

      <section className="card mt-8 overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="section-title">Testimonials</h2>
        </div>
        {data.testimonials.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">
            No testimonials yet. They appear after a customer receives an order
            and writes one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Order</th>
                  <th>Rating</th>
                  <th>Message</th>
                  <th>Site</th>
                </tr>
              </thead>
              <tbody>
                {data.testimonials.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <p>{item.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </td>
                    <td>
                      <Link
                        href={`/admin/orders/${item.order.id}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {item.order.orderNumber}
                      </Link>
                    </td>
                    <td>
                      <StarRating value={item.rating} />
                    </td>
                    <td className="max-w-xs">
                      <p className="line-clamp-3">{item.message}</p>
                    </td>
                    <td>
                      <TestimonialPublish id={item.id} published={item.published} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card mt-6 overflow-hidden">
        <div className="px-5 py-4">
          <h2 className="section-title">Item reviews</h2>
        </div>
        {data.reviews.length === 0 ? (
          <p className="px-5 pb-5 text-sm text-muted-foreground">
            Product reviews will show here after received orders are rated.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {data.reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      <Link
                        href={`/shop/${review.product.slug}`}
                        className="font-semibold text-primary hover:underline"
                      >
                        {review.product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {review.order.orderNumber}
                      </p>
                    </td>
                    <td>{review.user.name}</td>
                    <td>
                      <StarRating value={review.rating} />
                    </td>
                    <td className="max-w-xs">
                      {review.comment || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function formatAverage(value: number) {
  return value > 0 ? value.toFixed(1) : "—";
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-bold tracking-tight text-primary sm:text-xl">
        {value}
      </p>
    </div>
  );
}
