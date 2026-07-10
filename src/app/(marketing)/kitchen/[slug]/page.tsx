import ProductDetail from "./ProductDetail";
import { 
  getProductBySlug, 
  getProductsByCategory,
  getProductReviews,
  getProductRatingSummary,
  getProductVariants,
} from "@/lib/db/products";

// Next.js 16+ — params is a Promise, must be awaited.
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  const [relatedProducts, reviews, ratingSummary, variants] = await Promise.all([
    product
      ? (await getProductsByCategory(product.category)).filter(
          (p) => p.slug !== product.slug
        ).slice(0, 4)
      : [],
    product ? getProductReviews(product.id) : [],
    product ? getProductRatingSummary(product.id) : { average: 0, count: 0 },
    product ? getProductVariants(product.parentId) : [],
  ]);

  return (
    <ProductDetail 
      product={product} 
      relatedProducts={relatedProducts}
      reviews={reviews}
      ratingSummary={ratingSummary}
      variants={variants}
    />
  );
}