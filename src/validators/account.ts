import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  phone: z
    .string()
    .trim()
    .max(24, "Enter a shorter phone number.")
    .transform((value) => (value ? value : null))
    .refine((value) => !value || value.length >= 8, "Enter a valid phone number."),
});

export const addressSchema = z.object({
  label: z.string().trim().min(2, "Add a label.").max(40),
  fullName: z.string().trim().min(2, "Enter a name.").max(80),
  phone: z.string().trim().min(8, "Enter a phone number.").max(24),
  line: z.string().trim().min(8, "Enter a delivery address.").max(400),
  isDefault: z.boolean().optional(),
});

export const wishlistToggleSchema = z.object({
  productId: z.string().trim().min(1),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
