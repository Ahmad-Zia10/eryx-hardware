import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { product_id, rating, review_text } = body;

    if (!product_id || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Check if the user has purchased this product (using supabaseAdmin to bypass RLS for orders)
    // We look for orders by this customer with status in 'paid', 'shipped', 'delivered'
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select(`
        id,
        status,
        order_items!inner(product_id)
      `)
      .eq('customer_id', user.id)
      .eq('order_items.product_id', product_id)
      .in('status', ['paid', 'shipped', 'delivered']);

    const is_verified_purchase = Array.isArray(orders) && orders.length > 0;

    if (!is_verified_purchase) {
      return NextResponse.json({ error: 'You must purchase this product before reviewing it.' }, { status: 403 });
    }

    // Insert the review using the authenticated client (so RLS policies apply)
    const { data: review, error } = await supabase
      .from('product_reviews')
      .insert({
        product_id,
        customer_id: user.id,
        rating,
        review_text: review_text || null,
        is_verified_purchase,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 409 });
      }
      console.error('Failed to insert review:', error);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json(review);
  } catch (err: any) {
    console.error('Review submission error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
