import "server-only";

import { Prisma } from "@prisma/client";
import { randomInt } from "node:crypto";
import { WHOLESALE_MIN_ORDER_CENTS } from "@/lib/constants";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/server/account/notifications";
import type { WholesaleCheckoutInput } from "@/validators/wholesale";

function createOrderNumber() {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `GOW-${day}-${randomInt(1000, 9999)}`;
}

export class WholesaleOrderError extends Error {}

type OrderLine = {
  productId: string;
  name: string;
  slug: string;
  unit: string;
  imageUrl: string | null;
  priceCents: number;
  quantity: number;
};

export async function createWholesaleOrder(
  userId: string,
  input: WholesaleCheckoutInput,
) {
  const lines: OrderLine[] = [];

  for (const item of input.items) {
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: item.productId }, { slug: item.slug }] },
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    });

    if (!product || !product.inStock || product.wholesalePriceCents === null) {
      throw new WholesaleOrderError(`UNAVAILABLE:${item.slug}`);
    }

    lines.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      unit: product.unit,
      imageUrl: product.images[0]?.url ?? null,
      priceCents: product.wholesalePriceCents,
      quantity: item.quantity,
    });
  }

  const subtotalCents = lines.reduce(
    (total, line) => total + line.priceCents * line.quantity,
    0,
  );

  if (subtotalCents < WHOLESALE_MIN_ORDER_CENTS) {
    throw new WholesaleOrderError("BELOW_MIN_ORDER");
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            userId,
            channel: "WHOLESALE",
            fulfillment: input.fulfillment,
            fullName: input.fullName,
            phone: input.phone,
            address:
              input.fulfillment === "DELIVERY"
                ? input.address?.trim() || null
                : null,
            notes: [
              `Business: ${input.businessName}`,
              input.notes?.trim() ? input.notes.trim() : null,
            ]
              .filter(Boolean)
              .join("\n"),
            subtotalCents,
            deliveryCents: 0,
            discountCents: 0,
            pointsRedeemed: 0,
            totalCents: subtotalCents,
            orderNumber: createOrderNumber(),
            items: { create: lines },
          },
          include: { items: true },
        });

        await createNotification(tx, {
          userId,
          title: "Wholesale order placed",
          body: `${created.orderNumber} is with the shop. They'll confirm pricing and arrange delivery.`,
          href: `/account/orders/${created.id}`,
        });

        return created;
      });

      return order;
    } catch (error) {
      const isDuplicate =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";

      if (!isDuplicate || attempt === 4) {
        throw error;
      }
    }
  }

  throw new WholesaleOrderError("Unable to create order number.");
}
