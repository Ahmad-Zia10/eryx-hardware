'use server';

import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function updateProduct(id: string, data: {
  mrp: number;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  discount_price: number | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('products')
    .update({ 
      mrp: data.mrp, 
      is_active: data.is_active, 
      is_featured: data.is_featured,
      is_on_sale: data.is_on_sale, 
      discount_price: data.discount_price,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) throw new Error('Update failed');
  redirect('/admin/products');
}

export async function updateEnquiryStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('enquiries')
    .update({ status })
    .eq('id', id);
  if (error) throw new Error('Update failed');
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error('Update failed');
}
