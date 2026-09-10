import { z } from "zod";

export const nipzContentSchema = z.object({
  businessName: z.string().trim().min(1, "Add the business name.").max(80),
  eyebrow: z.string().trim().min(1, "Add the small line above the title.").max(80),
  title: z.string().trim().min(1, "Add a title.").max(80),
  titleEm: z.string().trim().max(60).optional().or(z.literal("")),
  lead: z.string().trim().min(1, "Add the details paragraph.").max(600),
  whatsappNumber: z
    .string()
    .trim()
    .transform((value) => value.replace(/[^\d]/g, ""))
    .pipe(
      z
        .string()
        .min(8, "Enter a valid WhatsApp number in international format.")
        .max(15, "Enter a valid WhatsApp number in international format."),
    ),
});

export type NipzContentInput = z.infer<typeof nipzContentSchema>;
