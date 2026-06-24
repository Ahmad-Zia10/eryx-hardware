import { Suspense } from "react";
import Kitchen from "./kitchen";
import { getAllProducts } from "@/lib/db/products";

// Server Component — fetches real product data once, on the server,
// before the page is sent to the browser. Kitchen.tsx (the Client
// Component) receives this as a prop and handles all filtering
// interactivity client-side, same as it always did against static data.
//
// The Suspense wrapper is required here, not optional: any Client
// Component that calls useSearchParams() — which Kitchen.tsx does —
// must be wrapped in Suspense, or Next.js throws a build error on
// prerendered/static routes. This is an App Router rule, not a
// stylistic choice.
export default async function KitchenPage() {
  const products = await getAllProducts();

  return (
    <Suspense>
      <Kitchen products={products} />
    </Suspense>
  );
}