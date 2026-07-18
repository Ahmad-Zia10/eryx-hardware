import { supabaseAdmin } from '@/lib/supabase/server';
import FaqManager from './FaqManager';

export const revalidate = 0;

export default async function AdminFaqsPage() {
  const { data } = await supabaseAdmin
    .from('faq_categories')
    .select(
      `id, name, display_order, is_visible,
       faqs (id, question, answer, display_order, is_visible)`
    )
    .order('display_order', { ascending: true });

  // Sort questions inside each category (PostgREST nested rows aren't
  // ordered by the outer .order() clause).
  const categories = ((data as any[]) || []).map((cat) => ({
    ...cat,
    faqs: (cat.faqs || []).sort(
      (a: any, b: any) => a.display_order - b.display_order
    ),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#F5F5F5]">FAQs</h1>
        <p className="text-sm text-[#9A9A9A] mt-1">
          Manage the categories and questions shown on the home teaser and the /faqs page.
        </p>
      </div>
      <FaqManager categories={categories} />
    </div>
  );
}
