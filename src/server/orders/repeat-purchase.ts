import "server-only";

import {
  REPEAT_PURCHASE_DELAY_DAYS,
  REPEAT_PURCHASE_MAX_SUGGESTIONS,
} from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/server/account/notifications";

/**
 * Finds orders that were received `REPEAT_PURCHASE_DELAY_DAYS`+ ago and never
 * got a repeat-purchase nudge, then — for each — notifies the customer with
 * a few more in-stock products from the category they bought the most from.
 * Meant to run on a schedule (see /api/cron/repeat-purchase). Every matching
 * order is marked notified regardless of whether a suggestion was found, so
 * it's never re-checked on a later run.
 */
export async function runRepeatPurchaseSuggestions() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - REPEAT_PURCHASE_DELAY_DAYS);

  const orders = await prisma.order.findMany({
    where: {
      status: "RECEIVED",
      receivedAt: { lte: cutoff },
      repeatPurchaseNotifiedAt: null,
    },
    select: {
      id: true,
      userId: true,
      items: {
        select: {
          productId: true,
          product: {
            select: {
              categoryId: true,
              category: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  let notified = 0;

  for (const order of orders) {
    const purchasedProductIds = order.items
      .map((item) => item.productId)
      .filter((id): id is string => id !== null);

    const categoryCounts = new Map<
      string,
      { count: number; name: string; slug: string }
    >();
    for (const item of order.items) {
      if (!item.product) continue;
      const { categoryId, category } = item.product;
      const entry = categoryCounts.get(categoryId) ?? {
        count: 0,
        name: category.name,
        slug: category.slug,
      };
      entry.count += 1;
      categoryCounts.set(categoryId, entry);
    }

    const topCategory = [...categoryCounts.entries()].sort(
      (a, b) => b[1].count - a[1].count,
    )[0];

    if (topCategory) {
      const [categoryId, category] = topCategory;
      const suggestions = await prisma.product.findMany({
        where: {
          categoryId,
          kind: "SIMPLE",
          inStock: true,
          id: { notIn: purchasedProductIds },
        },
        select: { name: true },
        orderBy: { featured: "desc" },
        take: REPEAT_PURCHASE_MAX_SUGGESTIONS,
      });

      if (suggestions.length > 0) {
        const names = suggestions.map((p) => p.name).join(", ");
        await createNotification(prisma, {
          userId: order.userId,
          title: `More from ${category.name}`,
          body: `Loved your last order? ${names} ${suggestions.length === 1 ? "is" : "are"} waiting for you.`,
          href: `/shop?category=${category.slug}`,
        });
        notified += 1;
      }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { repeatPurchaseNotifiedAt: new Date() },
    });
  }

  return { checked: orders.length, notified };
}
