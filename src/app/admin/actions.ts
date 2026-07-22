'use server';

import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { emptyTiptapDocument, tiptapJsonToHtml } from '@/lib/server/blog-content';
import { requireAdminUser } from '@/lib/server/admin';
import {
  updateParentProductInputSchema,
  updateProductInputSchema,
} from '@/lib/validations/product';
import {
  addPromoCodeInputSchema,
  updatePromoCodeInputSchema,
} from '@/lib/validations/promo-code';
import {
  faqCategoryInputSchema,
  faqInputSchema,
} from '@/lib/validations/faq';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/');
}

// updateProduct targets product_variants (the per-SKU row) for pricing/status fields.
export async function updateProduct(id: string, data: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const parsed = updateProductInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }
  const input = parsed.data;

  // Update the variant row for SKU-level fields (price, sale, visibility).
  // If the sale toggle is off, clear discount_price so a stale value can't
  // leak back into the UI on the next toggle.
  const { error: variantError } = await supabaseAdmin
    .from('product_variants')
    .update({
      mrp: input.mrp,
      is_active: input.is_active,
      is_featured: input.is_featured,
      is_on_sale: input.is_on_sale,
      discount_price: input.is_on_sale ? input.discount_price : null,
      external_price_url: input.external_price_url,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (variantError) throw new Error('Update failed');

  revalidateProductSurfaces();
}

// Every public surface where a product's price / sale state can appear.
// Pricing changes (mrp, is_on_sale, discount_price) must refresh all of
// these — missing one leaves a stale price cached on that surface.
function revalidateProductSurfaces() {
  revalidatePath('/');                       // home (top picks)
  revalidatePath('/kitchen');                // kitchen PLP
  revalidatePath('/wardrobe');               // wardrobe PLP
  revalidatePath('/hardware');               // hardware PLP
  revalidatePath('/products');               // all-lines PLP
  revalidatePath('/deals');                  // discounts page
  revalidatePath('/checkout');               // order summary snapshots
  revalidatePath('/kitchen/[slug]', 'page'); // every PDP (all lines route here)
}

// updateParentProduct targets the products table for shared concept-level fields.
export async function updateParentProduct(id: string, data: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const parsed = updateParentProductInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }
  const input = parsed.data;

  const { error } = await supabaseAdmin
    .from('products')
    .update({
      name: input.name,
      description: input.description,
      category: input.category,
      product_line: input.product_line,
      is_featured: input.is_featured,
      is_active: input.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw new Error('Update failed');
  revalidateProductSurfaces();
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

  // Guardrail: enforce the "every parent has at least one active default
  // variant" invariant. Public listing filters on is_default=true AND
  // is_active=true, so a parent without a matching variant silently
  // disappears from the site. If we just inserted a variant into a
  // parent that had zero active defaults, promote the new variant to
  // default so the parent stays visible.
  const { count: activeDefaultCount } = await supabaseAdmin
    .from('product_variants')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', parentId)
    .eq('is_active', true)
    .eq('is_default', true);

  if ((activeDefaultCount || 0) === 0) {
    await supabaseAdmin
      .from('product_variants')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('item_code', data.item_code);
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
    .select('product_id, is_default')
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

  // Guardrail: if we just removed the sole active default variant,
  // promote another active variant to default so the parent stays
  // listable. The "last active variant" guard above ensures at least
  // one other active variant exists to be promoted.
  if (variant.is_default) {
    const { data: promotee } = await supabaseAdmin
      .from('product_variants')
      .select('id')
      .eq('product_id', variant.product_id)
      .eq('is_active', true)
      .order('catalogue_sno', { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (promotee?.id) {
      await supabaseAdmin
        .from('product_variants')
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', promotee.id);
    }
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

export async function addPromoCode(data: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const parsed = addPromoCodeInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }
  const input = parsed.data;

  const { error } = await supabaseAdmin
    .from('promo_codes')
    .insert({
      code: input.code,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      min_order_value: input.min_order_value,
      expires_at: input.expires_at,
      max_uses_per_user: input.max_uses_per_user,
      description: input.description,
      is_public: input.is_public,
      is_active: true,
    });

  if (error) {
    if (error.code === '23505') throw new Error('Promo code already exists');
    throw new Error('Failed to add promo code');
  }

  revalidatePath('/admin/promo-codes');
  revalidatePath('/checkout');
}

export async function updatePromoCode(id: string, data: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') throw new Error('Unauthorized');

  const parsed = updatePromoCodeInputSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }
  const input = parsed.data;

  const { error } = await supabaseAdmin
    .from('promo_codes')
    .update({
      code: input.code,
      discount_type: input.discount_type,
      discount_value: input.discount_value,
      min_order_value: input.min_order_value,
      expires_at: input.expires_at,
      max_uses_per_user: input.max_uses_per_user,
      description: input.description,
      is_public: input.is_public,
    })
    .eq('id', id);

  if (error) {
    if (error.code === '23505') throw new Error('Promo code already exists');
    throw new Error('Failed to update promo code');
  }

  revalidatePath('/admin/promo-codes');
  revalidatePath('/checkout');
}

export async function deletePromoCode(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Unauthorized' };

  const { data: profile } = await supabaseAdmin
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { ok: false, error: 'Unauthorized' };

  // Pre-flight guard alongside the FK RESTRICT constraint. Surfaces a
  // clean message to the admin instead of a raw Postgres constraint
  // violation, and keeps the "toggle inactive to retire" muscle memory
  // aligned with removeProductVariant's history-safe pattern.
  const { count: usageCount } = await supabaseAdmin
    .from('promo_usages')
    .select('*', { count: 'exact', head: true })
    .eq('promo_code_id', id);

  if ((usageCount || 0) > 0) {
    return {
      ok: false,
      error:
        'This code has been used on real orders. Toggle it inactive to retire it (delete would break the usage audit trail).',
    };
  }

  const { error } = await supabaseAdmin
    .from('promo_codes')
    .delete()
    .eq('id', id);

  if (error) {
    return { ok: false, error: 'Failed to delete promo code' };
  }

  revalidatePath('/admin/promo-codes');
  revalidatePath('/checkout');
  return { ok: true };
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

export async function cancelStockNotification(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminUser();
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }

  const { error } = await supabaseAdmin
    .from('stock_notifications')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'pending');

  if (error) {
    return { ok: false, error: 'Failed to cancel signup' };
  }

  revalidatePath('/admin/notify-me');
  return { ok: true };
}

// ─── FAQ Categories ────────────────────────────────────────────────

async function revalidateFaqSurfaces() {
  revalidatePath('/admin/faqs');
  revalidatePath('/faqs');
  revalidatePath('/');
}

export async function addFaqCategory(
  data: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireAdminUser();
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }

  const parsed = faqCategoryInputSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  // Compute next display_order as MAX + 1 so new categories land at the
  // bottom. New rows never collide with existing ones.
  const { data: maxRow } = await supabaseAdmin
    .from('faq_categories')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = ((maxRow?.display_order as number | undefined) ?? -1) + 1;

  const { data: inserted, error } = await supabaseAdmin
    .from('faq_categories')
    .insert({
      name: parsed.data.name,
      is_visible: parsed.data.is_visible,
      display_order: nextOrder,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return { ok: false, error: 'Failed to add category' };
  }

  await revalidateFaqSurfaces();
  return { ok: true, id: inserted.id };
}

export async function updateFaqCategory(
  id: string,
  data: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminUser();
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }

  const parsed = faqCategoryInputSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { error } = await supabaseAdmin
    .from('faq_categories')
    .update({
      name: parsed.data.name,
      is_visible: parsed.data.is_visible,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { ok: false, error: 'Failed to update category' };
  }

  await revalidateFaqSurfaces();
  return { ok: true };
}

export async function deleteFaqCategory(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminUser();
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }

  // Cascade on the FK removes child questions.
  const { error } = await supabaseAdmin
    .from('faq_categories')
    .delete()
    .eq('id', id);

  if (error) {
    return { ok: false, error: 'Failed to delete category' };
  }

  await revalidateFaqSurfaces();
  return { ok: true };
}

/**
 * Swap this category's display_order with the immediate neighbour above
 * (direction='up') or below (direction='down'). No-op if we're already at
 * the edge in that direction.
 */
export async function reorderFaqCategory(
  id: string,
  direction: 'up' | 'down'
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminUser();
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }

  const { data: me } = await supabaseAdmin
    .from('faq_categories')
    .select('id, display_order')
    .eq('id', id)
    .maybeSingle();

  if (!me) return { ok: false, error: 'Category not found' };

  const { data: neighbour } = await supabaseAdmin
    .from('faq_categories')
    .select('id, display_order')
    .order('display_order', { ascending: direction === 'down' })
    [direction === 'up' ? 'lt' : 'gt']('display_order', me.display_order as number)
    .limit(1)
    .maybeSingle();

  if (!neighbour) {
    // Already at the edge — treat as a no-op success.
    return { ok: true };
  }

  // Swap the two display_order values. Not transactional (Supabase JS
  // client doesn't expose one) but acceptable — worst case a concurrent
  // reorder produces a duplicate display_order that the admin can fix
  // with another click. Uniqueness isn't enforced at the schema level
  // for exactly this reason.
  await supabaseAdmin
    .from('faq_categories')
    .update({ display_order: neighbour.display_order })
    .eq('id', me.id);
  await supabaseAdmin
    .from('faq_categories')
    .update({ display_order: me.display_order })
    .eq('id', neighbour.id);

  await revalidateFaqSurfaces();
  return { ok: true };
}

// ─── FAQ Questions ─────────────────────────────────────────────────

export async function addFaq(
  data: unknown
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    await requireAdminUser();
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }

  const parsed = faqInputSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { data: maxRow } = await supabaseAdmin
    .from('faqs')
    .select('display_order')
    .eq('category_id', parsed.data.category_id)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle();
  const nextOrder = ((maxRow?.display_order as number | undefined) ?? -1) + 1;

  const { data: inserted, error } = await supabaseAdmin
    .from('faqs')
    .insert({
      category_id: parsed.data.category_id,
      question: parsed.data.question,
      answer: parsed.data.answer,
      is_visible: parsed.data.is_visible,
      display_order: nextOrder,
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return { ok: false, error: 'Failed to add question' };
  }

  await revalidateFaqSurfaces();
  return { ok: true, id: inserted.id };
}

export async function updateFaq(
  id: string,
  data: unknown
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminUser();
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }

  const parsed = faqInputSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const { error } = await supabaseAdmin
    .from('faqs')
    .update({
      category_id: parsed.data.category_id,
      question: parsed.data.question,
      answer: parsed.data.answer,
      is_visible: parsed.data.is_visible,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    return { ok: false, error: 'Failed to update question' };
  }

  await revalidateFaqSurfaces();
  return { ok: true };
}

export async function deleteFaq(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminUser();
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }

  const { error } = await supabaseAdmin.from('faqs').delete().eq('id', id);
  if (error) {
    return { ok: false, error: 'Failed to delete question' };
  }

  await revalidateFaqSurfaces();
  return { ok: true };
}

/**
 * Swap this question's display_order with the immediate neighbour above
 * or below, scoped to the question's own category.
 */
export async function reorderFaq(
  id: string,
  direction: 'up' | 'down'
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdminUser();
  } catch {
    return { ok: false, error: 'Unauthorized' };
  }

  const { data: me } = await supabaseAdmin
    .from('faqs')
    .select('id, category_id, display_order')
    .eq('id', id)
    .maybeSingle();

  if (!me) return { ok: false, error: 'Question not found' };

  const { data: neighbour } = await supabaseAdmin
    .from('faqs')
    .select('id, display_order')
    .eq('category_id', me.category_id as string)
    .order('display_order', { ascending: direction === 'down' })
    [direction === 'up' ? 'lt' : 'gt']('display_order', me.display_order as number)
    .limit(1)
    .maybeSingle();

  if (!neighbour) return { ok: true };

  await supabaseAdmin
    .from('faqs')
    .update({ display_order: neighbour.display_order })
    .eq('id', me.id);
  await supabaseAdmin
    .from('faqs')
    .update({ display_order: me.display_order })
    .eq('id', neighbour.id);

  await revalidateFaqSurfaces();
  return { ok: true };
}
