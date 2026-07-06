'use server';

import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

export async function updateProduct(id: string, data: {
  mrp: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_on_sale: boolean;
  discount_price: number | null;
  external_price_url: string | null;
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
      external_price_url: data.external_price_url,
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) throw new Error('Update failed');
}

export async function addProduct(data: {
  item_code: string;
  name: string;
  category: string;
  product_line: string;
  finish: string;
  material: string;
  dimension_notes: string;
  mrp: number | null;
  description: string;
  is_active: boolean;
  is_featured: boolean;
  image_url: string;
  external_price_url: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('products')
    .insert({
      ...data,
      is_on_sale: false,
      discount_price: null,
      is_active: data.is_active,
      is_featured: data.is_featured,
      image_url: data.image_url || null,
      external_price_url: data.external_price_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    if (error.code === '23505') throw new Error('Item code already exists');
    throw new Error('Failed to add product');
  }
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

export async function addPromoCode(data: {
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_value: number;
  expires_at: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('promo_codes')
    .insert({
      code: data.code.toUpperCase(),
      discount_type: data.discount_type,
      discount_value: data.discount_value,
      min_order_value: data.min_order_value,
      expires_at: data.expires_at || null,
      is_active: true,
    });

  if (error) {
    if (error.code === '23505') throw new Error('Promo code already exists');
    throw new Error('Failed to add promo code');
  }
}

export async function moderateReview(id: string, status: 'approved' | 'rejected') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('product_reviews')
    .update({ approval_status: status })
    .eq('id', id);

  if (error) throw new Error('Update failed');
  revalidatePath('/admin/reviews');
}

export async function updatePromoCodeStatus(id: string, is_active: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('promo_codes')
    .update({ is_active })
    .eq('id', id);
  if (error) throw new Error('Update failed');
}
