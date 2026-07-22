import { Suspense } from "react";
import ProductLineListing from "@/components/sections/ProductLineListing";
import { getAllProducts } from "@/lib/db/products";
import { IMAGES } from "@/lib/catalogue-data";

// Server Component — fetches this line's products once on the server, then
// hands them to the shared ProductLineListing client component (filters +
// sort + category chips). The Suspense wrapper is required: the client
// component calls useSearchParams().
export default async function KitchenPage() {
  const products = await getAllProducts("kitchen");

  return (
    <Suspense>
      <ProductLineListing
        products={products}
        basePath="/kitchen"
        line="kitchen"
        heroImage={IMAGES.kitchenHero}
        eyebrow="Kitchen Accessories"
        title="Kitchen Solutions"
        breadcrumb="Kitchen Solutions"
        description="Explore Eryx hardware categories for baskets, shutters, hinges, pull-down systems, corners, and wardrobe fittings."
      />
    </Suspense>
  );
}
