import { z } from "zod";

const ratingSchema = z.number().int().min(1).max(5);

export const orderFeedbackSchema = z.object({
  testimonial: z.object({
    rating: ratingSchema,
    message: z
      .string()
      .trim()
      .min(12, "Tell us a little more about your experience.")
      .max(600, "Keep the testimonial under 600 characters."),
  }),
  reviews: z
    .array(
      z.object({
        productId: z.string().min(1),
        rating: ratingSchema,
        comment: z.string().trim().max(400, "Keep reviews under 400 characters."),
      }),
    )
    .max(30),
});

export type OrderFeedbackInput = z.infer<typeof orderFeedbackSchema>;
