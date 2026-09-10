import "server-only";

import { Prisma } from "@prisma/client";
import { randomInt, randomUUID } from "node:crypto";
import { deliveryFeeFor } from "@/lib/constants";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db/prisma";
import { requestToPay } from "@/server/payments/momo";
import {
  flavorQuantityTotal,
  normalizeFlavorQuantities,
} from "@/lib/flavors";
import { redeemableDiscount, spendPointsFor } from "@/lib/points";
import {
  bundleItemsInclude,
  getProductById,
  getProductBySlug,
  hydrateProduct,
} from "@/server/catalog/queries";
import { awardReferralOnPurchase } from "@/server/account/referrals";
import { createNotification } from "@/server/account/notifications";
import type { CheckoutInput } from "@/validators/order";

function createOrderNumber() {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `GOS-${day}-${randomInt(1000, 9999)}`;
}

async function resolveProduct(productId: string, slug: string) {
  const byId = await getProductById(productId);
  if (byId?.fromDatabase) {
    return byId;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        bundleItems: bundleItemsInclude,
      },
    });

    if (product) {
      return {
        product: hydrateProduct(product),
        fromDatabase: true as const,
      };
    }
  } catch {
    // Fall through to seed or slug lookup.
  }

  if (byId) {
    return byId;
  }

  const bySlug = await getProductBySlug(slug);
  return bySlug ? { product: bySlug, fromDatabase: false as const } : null;
}

type OrderLine = {
  productId: string | null;
  name: string;
  slug: string;
  unit: string;
  imageUrl: string | null;
  priceCents: number;
  quantity: number;
  flavors?: Record<string, number>;
};

export async function createOrder(userId: string, input: CheckoutInput) {
  const lines: OrderLine[] = [];

  for (const item of input.items) {
    const match = await resolveProduct(item.productId, item.slug);

    if (!match || !match.product.inStock) {
      throw new Error(`UNAVAILABLE:${item.slug}`);
    }

    const images = (match.product as { images?: { url: string }[] }).images ?? [];
    const allowedFlavors =
      (match.product as { flavors?: string[] }).flavors ?? [];

    let quantity = item.quantity;
    let flavors: Record<string, number> | undefined;
    if (item.flavors && allowedFlavors.length > 0) {
      const clean = normalizeFlavorQuantities(item.flavors, allowedFlavors);
      const total = flavorQuantityTotal(clean);
      if (total > 0) {
        flavors = clean;
        quantity = total; // the flavour breakdown is the source of truth
      }
    }

    lines.push({
      productId: match.fromDatabase ? match.product.id : null,
      name: match.product.name,
      slug: match.product.slug,
      unit: match.product.unit,
      imageUrl: images[0]?.url ?? null,
      priceCents: match.product.priceCents,
      quantity,
      ...(flavors ? { flavors } : {}),
    });
  }

  const subtotalCents = lines.reduce(
    (total, line) => total + line.priceCents * line.quantity,
    0,
  );
  const deliveryCents =
    input.fulfillment === "DELIVERY" ? deliveryFeeFor(subtotalCents) : 0;

  // MoMo orders are held as AWAITING_PAYMENT and only earn points / notify /
  // reach the shop once the payment clears (see settlePayment). Point
  // redemption is a cash-only perk for now, so there is nothing to compensate
  // if a MoMo payment fails.
  const momo = input.paymentMethod === "MOMO";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const order = await prisma.$transaction(async (tx) => {
        const account = await tx.user.findUnique({
          where: { id: userId },
          select: { points: true },
        });
        const points = account?.points ?? 0;
        const discountCents =
          !momo && input.redeemPoints
            ? redeemableDiscount(points, subtotalCents)
            : 0;
        const pointsRedeemed = discountCents;

        if (!momo && input.redeemPoints && discountCents <= 0) {
          throw new Error("REDEEM_NOT_ALLOWED");
        }

        const totalCents = subtotalCents - discountCents + deliveryCents;
        const created = await tx.order.create({
          data: {
            userId,
            status: momo ? "AWAITING_PAYMENT" : "PENDING",
            fulfillment: input.fulfillment,
            fullName: input.fullName,
            phone: input.phone,
            address:
              input.fulfillment === "DELIVERY"
                ? input.address?.trim() || null
                : null,
            notes: input.notes?.trim() || null,
            subtotalCents,
            deliveryCents,
            discountCents,
            pointsRedeemed,
            totalCents,
            orderNumber: createOrderNumber(),
            items: { create: lines },
            payment: {
              create: {
                method: momo ? "MOMO" : "CASH",
                amountCents: totalCents,
                currency: momo ? env.momoCurrency : "XAF",
                phone: momo
                  ? (input.momoPhone?.replace(/\D/g, "") ?? null)
                  : null,
                momoReferenceId: momo ? randomUUID() : null,
              },
            },
          },
          include: { items: true, payment: true },
        });

        if (!momo) {
          const spendPoints = spendPointsFor(totalCents);
          const pointsDelta = spendPoints - pointsRedeemed;

          if (pointsRedeemed > 0) {
            const spent = await tx.user.updateMany({
              where: { id: userId, points: { gte: pointsRedeemed } },
              data: { points: { increment: pointsDelta } },
            });
            if (spent.count !== 1) {
              throw new Error("REDEEM_NOT_ALLOWED");
            }
          } else if (spendPoints > 0) {
            await tx.user.update({
              where: { id: userId },
              data: { points: { increment: spendPoints } },
            });
          }

          await awardReferralOnPurchase(tx, userId);

          await createNotification(tx, {
            userId,
            title: "Order placed",
            body: `${created.orderNumber} is waiting for the shop to confirm.`,
            href: `/account/orders/${created.id}`,
          });
        }

        return created;
      });

      if (momo && order.payment?.momoReferenceId) {
        try {
          await requestToPay({
            referenceId: order.payment.momoReferenceId,
            amount: order.totalCents,
            phone: order.payment.phone ?? "",
            externalId: order.orderNumber,
            payerMessage: `Goshen order ${order.orderNumber}`,
            payeeNote: `Goshen order ${order.orderNumber}`,
          });
        } catch (error) {
          await prisma.payment
            .update({
              where: { id: order.payment.id },
              data: {
                status: "FAILED",
                failureReason:
                  error instanceof Error
                    ? error.message.slice(0, 300)
                    : "Could not reach MoMo",
              },
            })
            .catch(() => undefined);
        }
      }

      return order;
    } catch (error) {
      if (error instanceof Error && error.message === "REDEEM_NOT_ALLOWED") {
        throw error;
      }

      const isDuplicate =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";

      if (!isDuplicate || attempt === 4) {
        throw error;
      }
    }
  }

  throw new Error("Unable to create order number.");
}
