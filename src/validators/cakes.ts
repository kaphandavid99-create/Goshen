import { z } from "zod";

const optionalText = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal(""));

export const cakeBookingSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your name.").max(80),
    phone: z
      .string()
      .trim()
      .min(8, "Enter a valid phone number.")
      .max(20, "Enter a valid phone number."),
    email: z.string().trim().email("Enter a valid email.").max(120).optional().or(z.literal("")),
    occasion: optionalText(60),
    flavor: optionalText(120),
    servings: optionalText(40),
    eventDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date.")
      .optional()
      .or(z.literal("")),
    fulfillment: z.enum(["DELIVERY", "PICKUP"]),
    budget: z
      .number({ invalid_type_error: "Enter a number." })
      .int()
      .min(0)
      .max(100_000_000)
      .optional(),
    details: z
      .string()
      .trim()
      .min(10, "Tell us a little about the cake you want.")
      .max(1200),
  })
  .superRefine((value, ctx) => {
    if (!value.eventDate) {
      return;
    }
    const picked = new Date(`${value.eventDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(picked.getTime()) || picked < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventDate"],
        message: "Pick a date that is not in the past.",
      });
    }
  });

export type CakeBookingInput = z.infer<typeof cakeBookingSchema>;

export const cakeItemSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").max(120),
  description: z.string().trim().min(10, "Add a short description.").max(600),
  category: z.string().trim().min(2).max(40),
  priceCents: z.number().int().min(0).max(100_000_000).nullable().optional(),
  priceNote: z.string().trim().max(40).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  available: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

export const cakeBookingStatusSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "CONFIRMED", "COMPLETED", "CANCELLED"]),
});
