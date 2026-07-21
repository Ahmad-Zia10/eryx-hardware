import { z } from "zod";

// variant_id references product_variants.id — the specific purchasable SKU
// being saved (see catalog-and-variants.md).
export const wishlistItemSchema = z.object({
  variant_id: z.string().uuid(),
});

export type WishlistItemInput = z.infer<typeof wishlistItemSchema>;
