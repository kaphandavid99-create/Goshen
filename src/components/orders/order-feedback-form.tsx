"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StarPicker } from "@/components/feedback/star-rating";
import { readCsrf } from "@/lib/auth/csrf-client";
import { useT } from "@/lib/i18n/context";
import { REVIEW_POINTS } from "@/lib/constants";

type ReviewDraft = {
  productId: string;
  name: string;
  rating: number;
  comment: string;
};

export function OrderFeedbackForm({
  orderId,
  items,
  testimonial,
  reviews,
}: {
  orderId: string;
  items: { productId: string | null; name: string }[];
  testimonial?: { rating: number; message: string } | null;
  reviews?: { productId: string; rating: number; comment: string }[];
}) {
  const router = useRouter();
  const t = useT();
  const f = t.orders.feedback;
  const existingReviews = new Map((reviews ?? []).map((review) => [review.productId, review]));
  const [rating, setRating] = useState(testimonial?.rating ?? 5);
  const [message, setMessage] = useState(testimonial?.message ?? "");
  const [itemReviews, setItemReviews] = useState<ReviewDraft[]>(
    items
      .filter((item): item is { productId: string; name: string } => Boolean(item.productId))
      .map((item) => ({
        productId: item.productId,
        name: item.name,
        rating: existingReviews.get(item.productId)?.rating ?? 5,
        comment: existingReviews.get(item.productId)?.comment ?? "",
      })),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(Boolean(testimonial));

  function updateReview(productId: string, patch: Partial<ReviewDraft>) {
    setItemReviews((current) =>
      current.map((review) =>
        review.productId === productId ? { ...review, ...patch } : review,
      ),
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/feedback`, {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": await readCsrf(),
        },
        body: JSON.stringify({
          testimonial: { rating, message },
          reviews: itemReviews.map((review) => ({
            productId: review.productId,
            rating: review.rating,
            comment: review.comment,
          })),
        }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        setError(data.error ?? f.error);
        return;
      }
      setSaved(true);
      router.refresh();
    } catch {
      setError(f.networkError);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-6 p-6">
      <div>
        <h2 className="section-title">{f.title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {f.intro(REVIEW_POINTS)}
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-primary">{f.testimonial}</legend>
        <StarPicker name="testimonial-rating" value={rating} onChange={setRating} />
        <label className="block space-y-2 text-sm">
          <span className="font-medium">{f.howWas}</span>
          <textarea
            required
            minLength={12}
            maxLength={600}
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="field"
            placeholder={f.testimonialPlaceholder}
          />
        </label>
      </fieldset>

      {itemReviews.length > 0 ? (
        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold text-primary">{f.itemReviews}</legend>
          {itemReviews.map((review) => (
            <div key={review.productId} className="space-y-2 border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground">{review.name}</p>
              <StarPicker
                name={`review-${review.productId}`}
                value={review.rating}
                onChange={(value) => updateReview(review.productId, { rating: value })}
              />
              <textarea
                maxLength={400}
                rows={2}
                value={review.comment}
                onChange={(event) =>
                  updateReview(review.productId, { comment: event.target.value })
                }
                className="field"
                placeholder={f.itemNotePlaceholder}
              />
            </div>
          ))}
        </fieldset>
      ) : null}

      <button type="submit" disabled={pending} className="btn btn-primary">
        {pending ? f.saving : saved ? f.update : f.send}
      </button>
      {saved && !error ? (
        <p className="text-sm text-muted-foreground">{f.thanks}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-accent">
          {error}
        </p>
      ) : null}
    </form>
  );
}
