import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(255)
    .transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(72, "Password is too long."),
  referralCode: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((value) => {
      const code = value?.toUpperCase();
      return code ? code : undefined;
    }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Enter your password."),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
