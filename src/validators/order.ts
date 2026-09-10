import { z } from "zod";

const cartLineSchema = z.object({
  productId: z.string().min(1),
  slug: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
  flavors: z
    .record(z.string().min(1).max(40), z.number().int().min(1).max(50))
    .optional(),
});

export const checkoutSchema = z
  .object({
    fulfillment: z.enum(["DELIVERY", "PICKUP"]),
    fullName: z.string().trim().min(2, "Enter your name.").max(80),
    phone: z
      .string()
      .trim()
      .min(8, "Enter a valid phone number.")
      .max(20, "Enter a valid phone number."),
    address: z.string().trim().max(200).optional().or(z.literal("")),
    notes: z.string().trim().max(300).optional().or(z.literal("")),
    redeemPoints: z.boolean().optional(),
    paymentMethod: z.enum(["CASH", "MOMO"]).default("CASH"),
    momoPhone: z.string().trim().max(20).optional().or(z.literal("")),
    items: z.array(cartLineSchema).min(1, "Your cart is empty."),
  })
  .superRefine((value, ctx) => {
    if (value.fulfillment === "DELIVERY" && !value.address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Enter a delivery address.",
      });
    }
    if (value.paymentMethod === "MOMO") {
      const digits = (value.momoPhone ?? "").replace(/\D/g, "");
      if (digits.length < 9) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["momoPhone"],
          message: "Enter the MTN MoMo number to charge.",
        });
      }
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
