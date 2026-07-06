import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof subtotal !== 'number') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Query the promo code
    const { data: promo, error } = await supabaseAdmin
      .from('promo_codes')
      .select('*')
      .ilike('code', code)
      .single();

    if (error || !promo) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });
    }

    if (!promo.is_active) {
      return NextResponse.json({ error: 'Promo code is no longer active' }, { status: 400 });
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 });
    }

    if (promo.min_order_value && subtotal < promo.min_order_value) {
      return NextResponse.json({ error: `Minimum order value of ₹${promo.min_order_value} required` }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (promo.discount_type === 'percentage') {
      discount = (subtotal * promo.discount_value) / 100;
    } else if (promo.discount_type === 'fixed') {
      discount = promo.discount_value;
    }

    // Ensure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      id: promo.id,
      code: promo.code,
      discount_type: promo.discount_type,
      discount_value: promo.discount_value,
      discount_amount: discount,
    });
  } catch (err: any) {
    console.error('Validate promo error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
