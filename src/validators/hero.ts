import { z } from "zod";

const line = z.string().trim().min(1).max(120);

export const heroContentSchema = z.object({
  kicker: z.string().trim().min(1, "Add a kicker.").max(80),
  headline: z.string().trim().min(1, "Add a headline.").max(120),
  rotatingLines: z
    .array(line)
    .min(1, "Add at least one rotating line.")
    .max(6, "Six rotating lines is the maximum."),
  lead: z.string().trim().min(1, "Add a lead paragraph.").max(400),
  primaryCtaLabel: z.string().trim().min(1, "Add a button label.").max(40),
  primaryCtaHref: z.string().trim().min(1).max(200),
  secondaryCtaLabel: z.string().trim().min(1, "Add a button label.").max(40),
  secondaryCtaHref: z.string().trim().min(1).max(200),
});

export type HeroContentInput = z.infer<typeof heroContentSchema>;
