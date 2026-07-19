import { z } from "zod";

// Shared rules for review body text. When a customer writes text at all it
// should be substantive — a blank-ish "ok" adds noise and hurts trust — but
// text stays optional (a star rating alone is a valid review).
const reviewText = z
  .string()
  .trim()
  .min(10, "Please write at least 10 characters, or leave the review text empty.")
  .max(2000)
  .optional()
  .or(z.literal("").transform(() => undefined));

const reviewTitle = z
  .string()
  .trim()
  .max(120)
  .optional()
  .or(z.literal("").transform(() => undefined));

export const createReviewSchema = z.object({
  // Named product_id for historical reasons — actually references
  // product_variants.id (see catalog-and-variants.md).
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: reviewTitle,
  review_text: reviewText,
});

export const updateReviewSchema = z.object({
  review_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: reviewTitle,
  review_text: reviewText,
});

export const deleteReviewSchema = z.object({
  review_id: z.string().uuid(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
