import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/db/products";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  if (!q) {
    return NextResponse.json({ products: [] });
  }

  const products = await getAllProducts();
  return NextResponse.json({
    products: products
      .filter((product) =>
        product.name.toLowerCase().includes(q) ||
        product.code.toLowerCase().includes(q)
      )
      .slice(0, 8),
  });
}
