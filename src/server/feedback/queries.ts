import "server-only";

import { prisma } from "@/lib/db/prisma";

export async function listPublishedTestimonials(take = 6) {
  try {
    return await prisma.testimonial.findMany({
      where: { published: true },
      take,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    });
  } catch {
    return [];
  }
}

export async function listProductReviews(productId: string) {
  try {
    return await prisma.review.findMany({
      where: { productId },
      take: 12,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    });
  } catch {
    return [];
  }
}

export async function getAdminFeedback() {
  const [testimonials, reviews, testimonialAgg, reviewAgg] = await Promise.all([
    prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        order: { select: { orderNumber: true, id: true } },
      },
    }),
    prisma.review.findMany({
      take: 40,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        product: { select: { name: true, slug: true } },
        order: { select: { orderNumber: true, id: true } },
      },
    }),
    prisma.testimonial.aggregate({ _avg: { rating: true }, _count: true }),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
  ]);

  return {
    testimonials,
    reviews,
    stats: {
      testimonialCount: testimonialAgg._count,
      testimonialAverage: testimonialAgg._avg.rating ?? 0,
      reviewCount: reviewAgg._count,
      reviewAverage: reviewAgg._avg.rating ?? 0,
    },
  };
}
