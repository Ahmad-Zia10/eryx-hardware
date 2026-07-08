import { supabaseAdmin } from "@/lib/supabase/server";
import SupportRequestsTable from "./SupportRequestsTable";

export const revalidate = 0;

export default async function AdminSupportPage() {
  const { data } = await supabaseAdmin
    .from("support_requests")
    .select(`
      id,
      reason,
      message,
      attachment_url,
      status,
      created_at,
      order:orders(id, customer_name, customer_email, customer_phone)
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">Support Requests</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">Track customer help requests linked to orders.</p>
      </div>
      <SupportRequestsTable requests={(data as any[]) || []} />
    </div>
  );
}
