import { z } from "zod";

const line = z.string().trim().min(1).max(120);
// French variants are optional — an empty string means "not translated yet".
const optionalLine = z.string().trim().max(120);
const optionalLines = z.array(optionalLine).max(6, "Six rotating lines is the maximum.");

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
  kickerFr: z.string().trim().max(80),
  headlineFr: z.string().trim().max(120),
  rotatingLinesFr: optionalLines,
  leadFr: z.string().trim().max(400),
  primaryCtaLabelFr: z.string().trim().max(40),
  secondaryCtaLabelFr: z.string().trim().max(40),
});

export type HeroContentInput = z.infer<typeof heroContentSchema>;
