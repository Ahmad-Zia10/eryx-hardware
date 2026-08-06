import AllProducts from "./AllProducts";
import { getProductsOverview } from "@/lib/db/categories";

export const metadata = {
  title: "All Products — Eryx Hardware",
  description:
    "Browse the complete Eryx catalogue — kitchen, wardrobe, and hardware accessories in one place.",
};

// Server Component — rolls the whole catalogue up per product line
// (counts + cheapest "from" price per category) once on the server, then
// renders a static category directory. No client filtering lives here;
// that's on the per-line PLPs (/kitchen, /wardrobe, /hardware).
export default async function AllProductsPage() {
  const overview = await getProductsOverview();

  return <AllProducts overview={overview} />;
}
