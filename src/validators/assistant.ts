import { z } from "zod";

export const assistantMessageSchema = z.object({
  threadId: z.string().min(1).max(64).optional(),
  message: z
    .string()
    .trim()
    .min(1, "Type a message.")
    .max(2000, "Keep it under 2000 characters."),
});

export type AssistantMessageInput = z.infer<typeof assistantMessageSchema>;
