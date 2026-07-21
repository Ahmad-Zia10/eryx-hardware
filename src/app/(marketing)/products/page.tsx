import { Suspense } from "react";
import AllProducts from "./AllProducts";
import { getAllProducts } from "@/lib/db/products";

export const metadata = {
  title: "All Products — Eryx Hardware",
  description:
    "Browse the complete Eryx catalogue — kitchen, wardrobe, and hardware accessories in one place.",
};

// Server Component — fetches every active default variant across all product
// lines (no line filter) once on the server, then hands it to the client grid
// which does line/category/finish/price filtering. Mirrors the /kitchen and
// /wardrobe pattern; the Suspense wrapper is required because AllProducts
// calls useSearchParams().
export default async function AllProductsPage() {
  const products = await getAllProducts();

  return (
    <Suspense>
      <AllProducts products={products} />
    </Suspense>
  );
}
