import { supabaseAdmin } from "@/lib/supabase/server";
import NotifyMeTable from "./NotifyMeTable";

export const revalidate = 0;

export default async function AdminNotifyMePage() {
  const { data } = await supabaseAdmin
    .from("stock_notifications")
    .select(`
      id, email, status, created_at, customer_id, notified_at,
      variant:product_variants (
        id, item_code, name, stock_quantity, track_inventory
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">Notify Me Signups</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">
          Customers waiting to hear when specific variants are back in stock.
        </p>
      </div>
      <NotifyMeTable rows={(data as any[]) || []} />
    </div>
  );
}
