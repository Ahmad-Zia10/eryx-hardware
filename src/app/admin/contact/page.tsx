import { supabaseAdmin } from "@/lib/supabase/server";
import ContactSubmissionsTable from "./ContactSubmissionsTable";

export const revalidate = 0;

export default async function AdminContactPage() {
  const { data } = await supabaseAdmin
    .from("contact_submissions")
    .select("id, name, email, phone, subject, message, order_reference, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">Contact Submissions</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">Review and resolve customer contact messages.</p>
      </div>
      <ContactSubmissionsTable submissions={(data as any[]) || []} />
    </div>
  );
}
