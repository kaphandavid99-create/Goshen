import "server-only";

import { prisma } from "@/lib/db/prisma";
import type { OrderStatus } from "@prisma/client";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function getAdminOverview() {
  const today = startOfToday();

  const [
    orderCount,
    pendingCount,
    acceptedCount,
    receivedCount,
    todayCount,
    revenue,
    customerCount,
    productCount,
    outOfStock,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "RECEIVED" } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({
      _sum: { totalCents: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count(),
    prisma.product.count({ where: { inStock: false } }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            product: {
              select: {
                images: {
                  take: 1,
                  orderBy: { sortOrder: "asc" },
                  select: { url: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    orderCount,
    pendingCount,
    acceptedCount,
    receivedCount,
    todayCount,
    revenue: revenue._sum.totalCents ?? 0,
    customerCount,
    productCount,
    outOfStock,
    recentOrders,
  };
}

export async function listAdminOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          product: {
            select: {
              images: {
                take: 1,
                orderBy: { sortOrder: "asc" },
                select: { url: true },
              },
            },
          },
        },
      },
    },
  });
}

export async function listWholesaleApplications() {
  const applications = await prisma.wholesaleApplication.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  const rank: Record<string, number> = {
    PENDING: 0,
    APPROVED: 1,
    REJECTED: 2,
    NONE: 3,
  };

  return [...applications].sort(
    (a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9),
  );
}

export async function getAdminOrder(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
      items: {
        include: {
          product: {
            select: {
              inStock: true,
              images: {
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  url: true,
                  alt: true,
                  resourceType: true,
                  sortOrder: true,
                },
              },
            },
          },
        },
      },
      testimonial: true,
      reviews: {
        include: { product: { select: { name: true, slug: true } } },
      },
    },
  });
}

export async function getAdminProduct(productId: string) {
  return prisma.product.findUnique({
    where: { id: productId },
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function listAdminProducts() {
  return prisma.product.findMany({
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
    include: {
      category: { select: { name: true, slug: true } },
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });
}

export async function listAdminCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { products: true } },
    },
  });
}

export async function listAdminCustomers() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      points: true,
      createdAt: true,
      referralCode: true,
      _count: { select: { orders: true, referrals: true } },
      orders: {
        select: { totalCents: true, status: true },
      },
    },
  });

  return customers.map((customer) => {
    const active = customer.orders.filter((order) => order.status !== "CANCELLED");
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      avatarUrl: customer.avatarUrl,
      points: customer.points,
      createdAt: customer.createdAt,
      referralCode: customer.referralCode,
      orderCount: customer._count.orders,
      referralCount: customer._count.referrals,
      spent: active.reduce((total, order) => total + order.totalCents, 0),
    };
  });
}
