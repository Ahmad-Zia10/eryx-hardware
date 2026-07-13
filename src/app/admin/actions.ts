'use server';

import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { emptyTiptapDocument, tiptapJsonToHtml } from '@/lib/server/blog-content';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

// updateProduct targets product_variants (the per-SKU row) for pricing/status fields.
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

  // Update the variant row for SKU-level fields (price, sale, visibility)
  const { error: variantError } = await supabaseAdmin
    .from('product_variants')
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

  if (variantError) throw new Error('Update failed');

  revalidatePath('/');
  revalidatePath('/kitchen');
  revalidatePath('/checkout');
}

// updateParentProduct targets the products table for shared concept-level fields.
export async function updateParentProduct(id: string, data: {
  name: string;
  description: string | null;
  category: string;
  product_line: string;
  is_featured: boolean;
  is_active: boolean;
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
      name: data.name,
      description: data.description,
      category: data.category,
      product_line: data.product_line,
      is_featured: data.is_featured,
      is_active: data.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error('Update failed');
  revalidatePath('/');
  revalidatePath('/kitchen');
}

export async function addProductVariant(parentId: string, data: {
  item_code: string;
  name: string;
  finish: string | null;
  material: string | null;
  dimension_notes: string | null;
  mrp: number | null;
  external_price_url: string | null;
  is_default: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { data: parent } = await supabaseAdmin
    .from('products')
    .select('name, description, category, product_line, is_active, is_featured')
    .eq('id', parentId)
    .single();

  if (!parent) throw new Error('Parent product not found');

  if (data.is_default) {
    await supabaseAdmin
      .from('product_variants')
      .update({ is_default: false })
      .eq('product_id', parentId);
  }

  const { error } = await supabaseAdmin
    .from('product_variants')
    .insert({
      product_id: parentId,
      item_code: data.item_code,
      name: data.name || parent.name,
      description: parent.description,
      category: parent.category,
      product_line: parent.product_line,
      finish: data.finish,
      material: data.material,
      dimension_notes: data.dimension_notes,
      mrp: data.mrp,
      external_price_url: data.external_price_url,
      is_active: parent.is_active,
      is_featured: parent.is_featured,
      is_on_sale: false,
      discount_price: null,
      is_default: data.is_default,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    if (error.code === '23505') throw new Error('Item code already exists');
    throw new Error('Failed to add variant');
  }

  revalidatePath('/admin/products');
  revalidatePath('/kitchen');
}

export async function removeProductVariant(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { data: variant } = await supabaseAdmin
    .from('product_variants')
    .select('product_id')
    .eq('id', id)
    .single();

  if (!variant?.product_id) throw new Error('Variant not found');

  const { count: activeCount } = await supabaseAdmin
    .from('product_variants')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', variant.product_id)
    .eq('is_active', true);

  if ((activeCount || 0) <= 1) {
    throw new Error('Cannot remove the last active variant');
  }

  const { count: orderCount } = await supabaseAdmin
    .from('order_items')
    .select('*', { count: 'exact', head: true })
    .eq('variant_id', id);

  const { count: reviewCount } = await supabaseAdmin
    .from('product_reviews')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', id);

  if ((orderCount || 0) > 0 || (reviewCount || 0) > 0) {
    const { error } = await supabaseAdmin
      .from('product_variants')
      .update({ is_active: false, is_default: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error('Failed to deactivate variant');
  } else {
    const { error } = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('id', id);
    if (error) throw new Error('Failed to delete variant');
  }

  revalidatePath('/admin/products');
  revalidatePath('/kitchen');
}

export async function deleteParentProduct(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { data: variants } = await supabaseAdmin
    .from('product_variants')
    .select('id')
    .eq('product_id', id);

  const variantIds = (variants || []).map((variant) => variant.id);
  const { count: orderCount } = variantIds.length > 0
    ? await supabaseAdmin.from('order_items').select('*', { count: 'exact', head: true }).in('variant_id', variantIds)
    : { count: 0 };
  const { count: reviewCount } = variantIds.length > 0
    ? await supabaseAdmin.from('product_reviews').select('*', { count: 'exact', head: true }).in('product_id', variantIds)
    : { count: 0 };

  if ((orderCount || 0) > 0 || (reviewCount || 0) > 0) {
    await supabaseAdmin
      .from('product_variants')
      .update({ is_active: false, is_default: false, updated_at: new Date().toISOString() })
      .eq('product_id', id);
    const { error } = await supabaseAdmin
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw new Error('Failed to deactivate product');
  } else {
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw new Error('Failed to delete product');
  }

  revalidatePath('/admin/products');
  revalidatePath('/kitchen');
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
  max_uses_per_user: number;
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
      max_uses_per_user: data.max_uses_per_user,
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

export async function updateContactSubmissionStatus(id: string, status: 'new' | 'in_progress' | 'resolved') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('contact_submissions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error('Update failed');
  revalidatePath('/admin/contact');
}

export async function updateBulkEnquiryStatus(id: string, status: 'new' | 'contacted' | 'quoted' | 'closed') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('bulk_enquiries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error('Update failed');
  revalidatePath('/admin/bulk-enquiries');
}

export async function updateDealerEnquiryStatus(
  id: string,
  status: 'new' | 'reviewing' | 'approved' | 'rejected',
  review_note?: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('dealer_enquiries')
    .update({
      status,
      review_note: review_note || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error('Update failed');
  revalidatePath('/admin/dealer-enquiries');
}

export async function updateSupportRequestStatus(id: string, status: 'open' | 'in_progress' | 'resolved') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { error } = await supabaseAdmin
    .from('support_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error('Update failed');
  revalidatePath('/admin/support');
}

export async function savePost(id: string | null, data: {
  title: string;
  slug: string;
  excerpt: string | null;
  content_json: any;
  cover_image_url: string | null;
  status: 'draft' | 'published';
  published_at: string | null;
  author: string | null;
  meta_title: string | null;
  meta_description: string | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { data: existingPost } = id
    ? await supabaseAdmin
        .from('blog_posts')
        .select('published_at, status')
        .eq('id', id)
        .single()
    : { data: null };

  const contentJson = data.content_json || emptyTiptapDocument();
  const content = await tiptapJsonToHtml(contentJson);
  const payload = {
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || null,
    content,
    content_json: contentJson,
    cover_image_url: data.cover_image_url || null,
    status: data.status,
    author: data.author || null,
    meta_title: data.meta_title || null,
    meta_description: data.meta_description || null,
    updated_at: new Date().toISOString(),
    published_at: data.status === 'published'
      ? (data.published_at || existingPost?.published_at || new Date().toISOString())
      : data.published_at,
  };

  const { error } = id
    ? await supabaseAdmin.from('blog_posts').update(payload).eq('id', id)
    : await supabaseAdmin.from('blog_posts').insert(payload);

  if (error) {
    if (error.code === '23505') throw new Error('Slug already exists');
    throw new Error('Failed to save post');
  }

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  revalidatePath(`/blog/${data.slug}`);
}

export async function deletePost(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const { data: post } = await supabaseAdmin
    .from('blog_posts')
    .select('slug')
    .eq('id', id)
    .single();

  const { error } = await supabaseAdmin
    .from('blog_posts')
    .delete()
    .eq('id', id);

  if (error) throw new Error('Failed to delete post');

  revalidatePath('/admin/blog');
  revalidatePath('/blog');
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
}

export async function saveAboutSection(id: string, data: {
  title: string;
  content_json: any;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const contentJson = data.content_json || emptyTiptapDocument();
  const contentHtml = await tiptapJsonToHtml(contentJson);

  const { error } = await supabaseAdmin
    .from('about_page_sections')
    .update({
      title: data.title,
      content_json: contentJson,
      content_html: contentHtml,
      image_url: data.image_url || null,
      display_order: data.display_order,
      is_visible: data.is_visible,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', id);

  if (error) throw new Error('Failed to save about section');

  revalidatePath('/about');
  revalidatePath('/admin/about');
}

export async function adjustStock(
  variantId: string,
  delta: number,
  reason: 'restock' | 'manual_adjustment'
): Promise<{ ok: true; newQuantity: number } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { ok: false, error: 'Unauthorized' };

  if (!Number.isInteger(delta) || delta === 0) {
    return { ok: false, error: 'Delta must be a non-zero integer' };
  }
  if (reason !== 'restock' && reason !== 'manual_adjustment') {
    return { ok: false, error: 'Invalid reason' };
  }

  const { data, error } = await supabaseAdmin.rpc('adjust_stock', {
    p_variant_id: variantId,
    p_delta: delta,
    p_reason: reason,
    p_admin_id: user.id,
  });

  if (error) {
    // Column CHECK aborts negative-result updates; surface a friendly message.
    const msg = /negative|check/i.test(error.message)
      ? 'Adjustment would drop stock below zero'
      : error.message;
    return { ok: false, error: msg };
  }

  revalidatePath('/admin/products');
  revalidatePath('/kitchen', 'layout');

  return { ok: true, newQuantity: data as number };
}
