import { z } from "zod";
import { MAX_INPUT_LENGTH } from "@/lib/chat/matcher";

export const chatMissSchema = z.object({
  kind: z.enum(["unanswered", "no_product_match"]),
  query: z.string().trim().min(1).max(MAX_INPUT_LENGTH),
  // Pathname only — the route strips anything after ? or #.
  page_path: z.string().max(200).startsWith("/").optional(),
});

export type ChatMissInput = z.infer<typeof chatMissSchema>;

export const chatQueryStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["new", "resolved", "ignored"]),
});
