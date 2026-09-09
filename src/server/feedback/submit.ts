import "server-only";

import { REVIEW_POINTS } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { canLeaveFeedback } from "@/lib/order-status";
import type { OrderFeedbackInput } from "@/validators/feedback";

export async function submitOrderFeedback(
  userId: string,
  orderId: string,
  input: OrderFeedbackInput,
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!order) {
    throw new Error("NOT_FOUND");
  }

  if (!canLeaveFeedback(order.status)) {
    throw new Error("NOT_RECEIVED");
  }

  const allowedProductIds = new Set(
    order.items
      .map((item) => item.productId)
      .filter((productId): productId is string => Boolean(productId)),
  );

  const reviews = input.reviews.filter((review) =>
    allowedProductIds.has(review.productId),
  );

  await prisma.$transaction(async (tx) => {
    await tx.testimonial.upsert({
      where: { orderId },
      create: {
        userId,
        orderId,
        rating: input.testimonial.rating,
        message: input.testimonial.message,
      },
      update: {
        rating: input.testimonial.rating,
        message: input.testimonial.message,
      },
    });

    for (const review of reviews) {
      const existing = await tx.review.findUnique({
        where: {
          orderId_productId: {
            orderId,
            productId: review.productId,
          },
        },
        select: { id: true },
      });

      await tx.review.upsert({
        where: {
          orderId_productId: {
            orderId,
            productId: review.productId,
          },
        },
        create: {
          userId,
          orderId,
          productId: review.productId,
          rating: review.rating,
          comment: review.comment,
        },
        update: {
          rating: review.rating,
          comment: review.comment,
        },
      });

      if (!existing) {
        await tx.user.update({
          where: { id: userId },
          data: { points: { increment: REVIEW_POINTS } },
        });
      }
    }
  });
}
