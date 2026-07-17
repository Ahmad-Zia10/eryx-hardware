import { z } from "zod";

// Sanity guardrails on discount values. 100% off for percentages, ₹1M cap
// for fixed amounts — anything beyond that is almost certainly a bad
// paste, not a legitimate offer.
const PERCENTAGE_MAX = 100;
const FIXED_CAP = 1_000_000;
const MIN_ORDER_CAP = 10_000_000;

const baseSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(2, "Code must be at least 2 characters.")
      .max(50, "Code must be at most 50 characters.")
      .regex(/^[A-Z0-9_-]+$/, "Code can only contain letters, digits, hyphens, and underscores."),
    discount_type: z.enum(["fixed", "percentage"]),
    discount_value: z
      .number()
      .finite()
      .positive("Discount value must be greater than zero."),
    min_order_value: z
      .number()
      .finite()
      .nonnegative("Minimum order value cannot be negative.")
      .max(MIN_ORDER_CAP),
    expires_at: z
      .string()
      .datetime({ offset: true })
      .nullable()
      .or(z.literal("").transform(() => null)),
    max_uses_per_user: z
      .number()
      .int()
      .positive("Max uses per user must be at least 1.")
      .max(9999),
    description: z
      .string()
      .trim()
      .max(300, "Description must be under 300 characters.")
      .nullable()
      .or(z.literal("").transform(() => null)),
    is_public: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.discount_type === "percentage" && data.discount_value > PERCENTAGE_MAX) {
      ctx.addIssue({
        code: "custom",
        path: ["discount_value"],
        message: "Percentage discount cannot exceed 100%.",
      });
    }
    if (data.discount_type === "fixed" && data.discount_value > FIXED_CAP) {
      ctx.addIssue({
        code: "custom",
        path: ["discount_value"],
        message: `Fixed discount looks too large (over ₹${FIXED_CAP.toLocaleString("en-IN")}). Double-check.`,
      });
    }
  });

export const addPromoCodeInputSchema = baseSchema;
export type AddPromoCodeInput = z.infer<typeof addPromoCodeInputSchema>;

// Update shares the exact same shape as add — a promo edit can rewrite
// every field. The `code` uniqueness constraint at the DB level catches
// collisions on rename.
export const updatePromoCodeInputSchema = baseSchema;
export type UpdatePromoCodeInput = z.infer<typeof updatePromoCodeInputSchema>;
