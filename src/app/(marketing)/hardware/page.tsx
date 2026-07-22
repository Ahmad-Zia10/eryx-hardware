import { Suspense } from "react";
import ProductLineListing from "@/components/sections/ProductLineListing";
import { getAllProducts } from "@/lib/db/products";
import { IMAGES } from "@/lib/catalogue-data";

export const revalidate = 60;

export const metadata = {
  title: "Hardware Accessories — Eryx Hardware",
  description:
    "Precision hinges, channels, and fittings engineered for modular kitchens and wardrobes.",
};

export default async function HardwarePage() {
  const products = await getAllProducts("hardware");

  return (
    <Suspense>
      <ProductLineListing
        products={products}
        basePath="/hardware"
        line="hardware"
        heroImage={IMAGES.hardwareHero}
        eyebrow="Hardware Accessories"
        title="Precision Hardware"
        breadcrumb="Hardware Accessories"
        description="Soft-close hinges, ball-bearing channels, and fittings engineered for a lifetime of daily use."
      />
    </Suspense>
  );
}
