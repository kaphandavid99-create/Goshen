import "server-only";

import { randomInt } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { createNotification } from "@/server/account/notifications";
import type { CakeBookingInput } from "@/validators/cakes";

function createReference() {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `NIPZ-${day}-${randomInt(1000, 9999)}`;
}

export async function createCakeBooking(
  userId: string | null,
  input: CakeBookingInput,
) {
  const eventDate = input.eventDate
    ? new Date(`${input.eventDate}T00:00:00`)
    : null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
        const booking = await tx.cakeBooking.create({
          data: {
            reference: createReference(),
            userId: userId ?? undefined,
            fullName: input.fullName,
            phone: input.phone,
            email: input.email?.trim() || null,
            occasion: input.occasion?.trim() || null,
            flavor: input.flavor?.trim() || null,
            servings: input.servings?.trim() || null,
            eventDate,
            fulfillment: input.fulfillment,
            budgetCents:
              typeof input.budget === "number" && input.budget > 0
                ? input.budget
                : null,
            details: input.details,
          },
        });

        if (userId) {
          await createNotification(tx, {
            userId,
            title: "Cake booking received",
            body: `${booking.reference} — the bakery will contact you to confirm the details.`,
            href: "/account/orders",
          });
        }

        return booking;
      });
    } catch (error) {
      const isDuplicate =
        error instanceof Error &&
        "code" in error &&
        (error as { code?: string }).code === "P2002";
      if (!isDuplicate || attempt === 4) {
        throw error;
      }
    }
  }

  throw new Error("Unable to create a booking reference.");
}
