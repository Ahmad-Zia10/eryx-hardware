import ProductDetail from "./ProductDetail";

// Next.js App Router convention: a folder named [slug] makes `slug`
// available as a prop here automatically, matching the file path
// src/app/(marketing)/kitchen/[slug]/page.tsx — no useParams() hook
// needed inside the page itself, unlike react-router.
export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}