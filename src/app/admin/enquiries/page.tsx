import { supabaseAdmin } from '@/lib/supabase/server';
import EnquiriesTable from './EnquiriesTable';

export const revalidate = 0;

export default async function AdminEnquiriesPage() {
  const { data: enquiries } = await supabaseAdmin
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl text-[#F5F5F5]">Enquiries</h1>
          <p className="text-sm text-[#9A9A9A] mt-1">Manage customer requests and product enquiries.</p>
        </div>
      </div>

      <EnquiriesTable enquiries={enquiries || []} />
    </div>
  );
}
