import { z } from "zod";
import { WHOLESALE } from "@/lib/constants";

/* Customer: wholesale account application ----------------------------------- */

export const wholesaleApplicationSchema = z.object({
  businessName: z.string().trim().min(2, "Enter your business name.").max(120),
  businessType: z.enum(WHOLESALE.businessTypes),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number.")
    .max(20, "Enter a valid phone number."),
  location: z.string().trim().min(2, "Where is the business based?").max(160),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});

export type WholesaleApplicationInput = z.infer<
  typeof wholesaleApplicationSchema
>;

/* Admin: review a wholesale application ------------------------------------- */

export const wholesaleReviewSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});

/* Customer: wholesale checkout --------------------------------------------- */

const wholesaleLineSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  quantity: z.number().int().min(1).max(100_000),
});

export const wholesaleCheckoutSchema = z
  .object({
    businessName: z.string().trim().min(2, "Enter your business name.").max(120),
    fulfillment: z.enum(["DELIVERY", "PICKUP"]),
    fullName: z.string().trim().min(2, "Enter a contact name.").max(80),
    phone: z
      .string()
      .trim()
      .min(8, "Enter a valid phone number.")
      .max(20, "Enter a valid phone number."),
    address: z.string().trim().max(200).optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    items: z.array(wholesaleLineSchema).min(1, "Your cart is empty."),
  })
  .superRefine((value, ctx) => {
    if (value.fulfillment === "DELIVERY" && !value.address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Enter a delivery address.",
      });
    }
  });

export type WholesaleCheckoutInput = z.infer<typeof wholesaleCheckoutSchema>;
