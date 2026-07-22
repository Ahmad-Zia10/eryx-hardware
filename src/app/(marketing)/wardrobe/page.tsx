import { Suspense } from "react";
import ProductLineListing from "@/components/sections/ProductLineListing";
import { getAllProducts } from "@/lib/db/products";
import { IMAGES } from "@/lib/catalogue-data";

export const revalidate = 60;

export default async function WardrobePage() {
  const products = await getAllProducts("wardrobe");

  return (
    <Suspense>
      <ProductLineListing
        products={products}
        basePath="/wardrobe"
        line="wardrobe"
        heroImage={IMAGES.wardrobeHero}
        eyebrow="Wardrobe Accessories"
        title="Wardrobe Solutions"
        breadcrumb="Wardrobe Accessories"
        description="Hangers, pull-outs, trouser racks, and fittings engineered for modern Indian wardrobes."
      />
    </Suspense>
  );
}
