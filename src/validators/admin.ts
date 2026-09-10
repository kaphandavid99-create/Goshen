import { z } from "zod";
import { DRINK_FLAVORS } from "@/lib/constants";

export const adminOrderStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

export const adminTestimonialPatchSchema = z.object({
  published: z.boolean(),
});

const productDetailShape = {
  name: z.string().trim().min(2, "Name is too short.").max(120),
  description: z.string().trim().min(1, "Add a short description.").max(2000),
  priceCents: z
    .number({ invalid_type_error: "Enter a price." })
    .int("Use a whole number of FCFA.")
    .min(1, "Price must be greater than zero.")
    .max(100_000_000),
  wholesalePriceCents: z
    .number({ invalid_type_error: "Enter a wholesale price." })
    .int("Use a whole number of FCFA.")
    .min(1, "Wholesale price must be greater than zero.")
    .max(100_000_000)
    .nullable()
    .optional(),
  unit: z.string().trim().min(1, "Add a unit, e.g. 500g or 1L.").max(40),
  categoryId: z.string().trim().min(1, "Choose a category."),
  inStock: z.boolean(),
  featured: z.boolean(),
  flavors: z.array(z.enum(DRINK_FLAVORS)).max(DRINK_FLAVORS.length).optional(),
  kind: z.enum(["SIMPLE", "BUNDLE"]).default("SIMPLE"),
  bundleItems: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(50),
      }),
    )
    .max(30)
    .optional(),
};

export const adminProductCreateSchema = z
  .object(productDetailShape)
  .superRefine((value, ctx) => {
    if (value.kind === "BUNDLE" && (value.bundleItems?.length ?? 0) < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bundleItems"],
        message: "A bundle needs at least two products.",
      });
    }
  });

export const adminProductPatchSchema = z
  .object({
    name: productDetailShape.name.optional(),
    description: productDetailShape.description.optional(),
    priceCents: productDetailShape.priceCents.optional(),
    wholesalePriceCents: productDetailShape.wholesalePriceCents,
    unit: productDetailShape.unit.optional(),
    categoryId: productDetailShape.categoryId.optional(),
    inStock: z.boolean().optional(),
    featured: z.boolean().optional(),
    flavors: productDetailShape.flavors,
    kind: z.enum(["SIMPLE", "BUNDLE"]).optional(),
    bundleItems: productDetailShape.bundleItems,
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "Nothing to update.",
  });
