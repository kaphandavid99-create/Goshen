import { Avatar } from "@/components/account/avatar";
import { StarRating } from "@/components/feedback/star-rating";
import { formatDate } from "@/lib/dates";
import { getI18n } from "@/lib/i18n/server";
import { listProductReviews } from "@/server/feedback/queries";

export async function ProductReviews({ productId }: { productId: string }) {
  const [reviews, { locale, t }] = await Promise.all([
    listProductReviews(productId),
    getI18n(),
  ]);

  if (reviews.length === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">{t.shop.reviews.none}</p>
    );
  }

  const average =
    reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="section-title">{t.shop.reviews.title}</h2>
        <div className="flex items-center gap-2">
          <StarRating value={average} />
          <span className="text-sm text-muted-foreground">
            {t.shop.reviews.summary(average.toFixed(1), reviews.length)}
          </span>
        </div>
      </div>
      <ul className="mt-5 space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2.5">
                <Avatar
                  name={review.user.name}
                  url={review.user.avatarUrl}
                  size={32}
                />
                <span className="text-sm font-semibold text-primary">
                  {review.user.name.split(" ")[0]}
                </span>
              </span>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.createdAt, locale)}
              </p>
            </div>
            <div className="mt-2">
              <StarRating value={review.rating} />
            </div>
            {review.comment ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {review.comment}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}