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

  revalidatePath('/');
  revalidatePath('/kitchen');
  revalidatePath('/checkout');
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
  const content = tiptapJsonToHtml(contentJson);
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
  const contentHtml = tiptapJsonToHtml(contentJson);

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
