import ProductDetail from "./ProductDetail";
import { 
  getProductBySlug, 
  getProductsByCategory,
  getProductReviews,
  getProductRatingSummary 
} from "@/lib/db/products";

// Next.js App Router convention: a folder named [slug] makes `slug`
// available as a prop here automatically. In Next.js 15+ (this project
// is on 16.2.9), `params` is a Promise and must be awaited — this
// changed from earlier versions where it was a plain synchronous object.
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // Fetch related products only if the product actually exists —
  // no point querying by a category that doesn't exist.
  const relatedProducts = product
    ? (await getProductsByCategory(product.category)).filter(
        (p) => p.slug !== product.slug
      ).slice(0, 4)
    : [];

  const reviews = product ? await getProductReviews(product.id) : [];
  const ratingSummary = product ? await getProductRatingSummary(product.id) : { average: 0, count: 0 };

  return (
    <ProductDetail 
      product={product} 
      relatedProducts={relatedProducts} 
      reviews={reviews}
      ratingSummary={ratingSummary}
    />
  );
}