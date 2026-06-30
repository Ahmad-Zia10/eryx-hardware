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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
        <p className="mt-2 text-sm text-gray-600">Manage customer contact requests and product enquiries.</p>
      </div>

      <EnquiriesTable enquiries={enquiries || []} />
    </div>
  );
}
