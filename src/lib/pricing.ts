export type PriceableProduct = {
  mrp: number | null;
  is_on_sale?: boolean | null;
  discount_price?: number | null;
};

export function getEffectivePrice(product: PriceableProduct) {
  if (
    product.is_on_sale &&
    typeof product.discount_price === "number" &&
    product.discount_price >= 0
  ) {
    return product.discount_price;
  }

  return typeof product.mrp === "number" ? product.mrp : null;
}

export function hasActiveDiscount(product: PriceableProduct) {
  const effectivePrice = getEffectivePrice(product);
  return (
    product.is_on_sale === true &&
    typeof product.discount_price === "number" &&
    typeof product.mrp === "number" &&
    effectivePrice !== null &&
    product.discount_price < product.mrp
  );
}

export function formatPrice(value: number | null) {
  return typeof value === "number" ? `₹${value.toLocaleString("en-IN")}` : "Price on request";
}

export function formatProductPrice(product: PriceableProduct) {
  return formatPrice(getEffectivePrice(product));
}
