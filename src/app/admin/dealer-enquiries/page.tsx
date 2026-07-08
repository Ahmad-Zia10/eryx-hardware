import { supabaseAdmin } from "@/lib/supabase/server";
import DealerEnquiriesTable from "./DealerEnquiriesTable";

export const revalidate = 0;

export default async function AdminDealerEnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; state?: string }>;
}) {
  const { status, state } = await searchParams;
  let query = supabaseAdmin
    .from("dealer_enquiries")
    .select("id, contact_name, company_name, email, phone, address_line, city, state, pincode, country, message, visiting_card_url, status, review_note, created_at")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (state) query = query.ilike("state", state);

  const { data } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">Dealer Enquiries</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">Review dealership requests by status and location.</p>
      </div>
      <DealerEnquiriesTable enquiries={(data as any[]) || []} />
    </div>
  );
}
