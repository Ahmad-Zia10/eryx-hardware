import { z } from "zod";

// Cap at ~₹10M/SKU — Eryx currently sells nothing near this. Guardrail
// against a misplaced decimal or a bad copy-paste that would render as
// "₹5,00,00,000" in the catalogue.
const PRICE_CAP = 10_000_000;

/**
 * Sanity checks for a variant update coming from the admin panel. Guards
 * against garbage payloads (negative prices, discount > mrp, URLs that
 * aren't URLs) that the DB would otherwise happily accept and render.
 */
export const updateProductInputSchema = z
  .object({
    mrp: z
      .number()
      .finite()
      .nonnegative("MRP cannot be negative.")
      .max(PRICE_CAP, `MRP looks too large (over ₹${PRICE_CAP.toLocaleString("en-IN")}). Double-check.`)
      .nullable(),
    is_active: z.boolean(),
    is_featured: z.boolean(),
    is_on_sale: z.boolean(),
    discount_price: z
      .number()
      .finite()
      .nonnegative("Discount price cannot be negative.")
      .max(PRICE_CAP)
      .nullable(),
    external_price_url: z
      .string()
      .trim()
      .url("External price URL must be a valid URL.")
      .max(500)
      .nullable()
      .or(z.literal("").transform(() => null)),
  })
  .superRefine((data, ctx) => {
    if (data.is_on_sale) {
      if (data.discount_price == null) {
        ctx.addIssue({
          code: "custom",
          path: ["discount_price"],
          message: "Sale is on but no discount price was provided.",
        });
      } else if (data.mrp != null && data.discount_price >= data.mrp) {
        ctx.addIssue({
          code: "custom",
          path: ["discount_price"],
          message: "Discount price must be strictly less than MRP.",
        });
      }
    }
  });

export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;

/**
 * Sanity checks for parent-product updates. Trims strings; requires a
 * name; caps description to a reasonable length.
 */
export const updateParentProductInputSchema = z.object({
  name: z.string().trim().min(1, "Product name is required.").max(200),
  description: z.string().trim().max(5000).nullable(),
  category: z.string().trim().min(1).max(100),
  product_line: z.enum(["kitchen", "wardrobe", "hardware"]),
  is_featured: z.boolean(),
  is_active: z.boolean(),
});

export type UpdateParentProductInput = z.infer<typeof updateParentProductInputSchema>;
