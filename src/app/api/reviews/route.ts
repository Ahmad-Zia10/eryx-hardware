import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import {
  createReviewSchema,
  updateReviewSchema,
  deleteReviewSchema,
} from '@/lib/validations/review';

// Has this customer bought (paid/shipped/delivered) the given variant?
// Uses supabaseAdmin to bypass RLS on orders — the customer_id filter keeps
// it scoped to the caller's own purchases.
async function hasPurchasedVariant(userId: string, variantId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('id, order_items!inner(variant_id)')
    .eq('customer_id', userId)
    .eq('order_items.variant_id', variantId)
    .in('status', ['paid', 'shipped', 'delivered']);

  if (error) {
    console.error('Verified purchase lookup failed:', error);
    throw new Error('purchase_lookup_failed');
  }
  return Array.isArray(data) && data.length > 0;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = createReviewSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }
    const { product_id, rating, title, review_text } = parsed.data;

    let verified: boolean;
    try {
      verified = await hasPurchasedVariant(user.id, product_id);
    } catch {
      return NextResponse.json(
        { error: 'Could not verify purchase history. Please try again.' },
        { status: 500 }
      );
    }

    if (!verified) {
      return NextResponse.json(
        { error: 'You must purchase this product before reviewing it.' },
        { status: 403 }
      );
    }

    // Insert through the authenticated client so RLS (own-row) applies.
    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id,
        customer_id: user.id,
        rating,
        title: title ?? null,
        review_text: review_text ?? null,
        is_verified_purchase: true,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You have already reviewed this product. Edit your existing review instead.' },
          { status: 409 }
        );
      }
      console.error('Failed to insert review:', error);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json(review);
  } catch (err) {
    console.error('Review submission error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Edit an existing review. Ownership is enforced by RLS (auth.uid() =
// customer_id) plus an explicit customer_id filter. Any edit sends the review
// back to 'pending' so admins re-moderate changed content.
export async function PATCH(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = updateReviewSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }
    const { review_id, rating, title, review_text } = parsed.data;

    const { data: review, error } = await supabase
      .from('product_reviews')
      .update({
        rating,
        title: title ?? null,
        review_text: review_text ?? null,
        approval_status: 'pending',
      })
      .eq('id', review_id)
      .eq('customer_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Review not found' }, { status: 404 });
      }
      console.error('Failed to update review:', error);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    return NextResponse.json(review);
  } catch (err) {
    console.error('Review update error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete own review. RLS + explicit customer_id filter guard ownership.
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = deleteReviewSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const { error, count } = await supabase
      .from('product_reviews')
      .delete({ count: 'exact' })
      .eq('id', parsed.data.review_id)
      .eq('customer_id', user.id);

    if (error) {
      console.error('Failed to delete review:', error);
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }
    if (!count) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Review delete error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
