import { supabaseAdmin } from "@/lib/supabase/server";
import BulkEnquiriesTable from "./BulkEnquiriesTable";

export const revalidate = 0;

export default async function AdminBulkEnquiriesPage() {
  const { data } = await supabaseAdmin
    .from("bulk_enquiries")
    .select(`
      id,
      customer_name,
      company_name,
      email,
      phone,
      message,
      status,
      created_at,
      bulk_enquiry_items (
        id,
        product_name_snapshot,
        quantity,
        note,
        product:products(name, image_url)
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">Bulk Enquiries</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">Review quote requests and update their sales status.</p>
      </div>
      <BulkEnquiriesTable enquiries={(data as any[]) || []} />
    </div>
  );
}
