import { supabaseAdmin } from "@/lib/supabase/server";
import BulkEnquiryForm from "./BulkEnquiryForm";

export const revalidate = 0;

export default async function BulkEnquiryPage() {
  const { data: products } = await supabaseAdmin
    .from("products")
    .select("id, name, item_code, image_url")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl">Bulk Enquiry</h1>
        <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-3 max-w-2xl">
          Share the products and quantities you need. Our team will prepare a quote and contact you.
        </p>
      </div>
      <BulkEnquiryForm products={(products as any[]) || []} />
    </main>
  );
}
