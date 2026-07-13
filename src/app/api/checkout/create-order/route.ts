import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { getEffectivePrice } from '@/lib/pricing';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

type OutOfStockItem = {
  code: string;
  name: string;
  requested: number;
  available: number;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingDetails, promoCode } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Re-fetch variants server-side. Never trust client prices or stock.
    const codes = items.map((item: any) => item.code).filter(Boolean);
    const { data: dbProducts, error: productsError } = await supabaseAdmin
      .from('product_variants')
      .select('id, item_code, name, mrp, is_on_sale, discount_price, stock_quantity, track_inventory')
      .in('item_code', codes)
      .eq('is_active', true);

    if (productsError) {
      console.error('Checkout product lookup failed:', productsError);
      return NextResponse.json({ error: 'Failed to validate cart' }, { status: 500 });
    }

    const productByCode = new Map((dbProducts || []).map((product) => [product.item_code, product]));
    let total = 0;
    const orderItems = [];
    const outOfStockItems: OutOfStockItem[] = [];

    for (const item of items) {
      const product = productByCode.get(item.code);

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.code}` },
          { status: 400 }
        );
      }

      const effectivePrice = getEffectivePrice(product);
      if (typeof effectivePrice !== 'number') {
        return NextResponse.json(
          { error: `${product.name} does not have a listed price. Please enquire instead.` },
          { status: 400 }
        );
      }

      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        return NextResponse.json(
          { error: `Invalid quantity for ${product.name}` },
          { status: 400 }
        );
      }

      // Cheap short-circuit for the common stale-cart case. The RPC still
      // re-checks under a row lock — this is defence in depth, not the
      // primary guard.
      if (product.track_inventory && product.stock_quantity < item.quantity) {
        outOfStockItems.push({
          code: product.item_code,
          name: product.name,
          requested: item.quantity,
          available: product.stock_quantity,
        });
        continue;
      }

      total += effectivePrice * item.quantity;
      orderItems.push({
        item_code: product.item_code,
        product_name: product.name,
        quantity: item.quantity,
        price_at_purchase: effectivePrice,
        variant_id: product.id,
      });
    }

    if (outOfStockItems.length > 0) {
      return NextResponse.json(
        { error: 'Some items are out of stock', outOfStockItems },
        { status: 409 }
      );
    }

    let subtotal = total;
    let discountApplied = 0;
    let promoCodeId = null;

    if (promoCode) {
      const { data: promo } = await supabaseAdmin
        .from('promo_codes')
        .select('*')
        .ilike('code', promoCode)
        .eq('is_active', true)
        .single();

      if (promo) {
        if (!promo.expires_at || new Date(promo.expires_at) > new Date()) {
          if (!promo.min_order_value || subtotal >= promo.min_order_value) {
            const { count } = await supabaseAdmin
              .from('promo_usages')
              .select('*', { count: 'exact', head: true })
              .eq('promo_code_id', promo.id)
              .eq('customer_id', user.id);

            const maxUses = promo.max_uses_per_user ?? 1;
            if (count !== null && count >= maxUses) {
              return NextResponse.json(
                { error: "You've already used this promo code" },
                { status: 400 }
              );
            }

            promoCodeId = promo.id;
            if (promo.discount_type === 'percentage') {
              discountApplied = (subtotal * promo.discount_value) / 100;
            } else if (promo.discount_type === 'fixed') {
              discountApplied = promo.discount_value;
            }
            discountApplied = Math.min(discountApplied, subtotal);
            total -= discountApplied;
          }
        }
      }
    }

    // Reserve stock + create the DB order atomically. Do this BEFORE the
    // Razorpay order so a rolled-back DB order (e.g. lost race for the
    // last unit) never leaves a dangling Razorpay order behind.
    const { data: rpcResult, error: rpcError } = await supabaseAdmin
      .rpc('create_order_with_items', {
        p_customer_id: user.id,
        p_customer_name: shippingDetails.name,
        p_customer_email: shippingDetails.email,
        p_customer_phone: shippingDetails.phone,
        p_shipping_address: shippingDetails.address,
        p_shipping_city: shippingDetails.city,
        p_shipping_pincode: shippingDetails.pincode,
        p_subtotal: subtotal,
        p_total: total,
        p_razorpay_order_id: null,
        p_items: orderItems,
        p_promo_code_id: promoCodeId,
        p_discount_applied: discountApplied,
        p_payment_method: 'online',
      });

    if (rpcError || !rpcResult) {
      console.error('Atomic order creation failed:', rpcError);
      return NextResponse.json(
        { error: 'Failed to create order. Please try again.' },
        { status: 500 }
      );
    }

    if (rpcResult.out_of_stock && Array.isArray(rpcResult.out_of_stock)) {
      const nameByCode = new Map(
        (dbProducts || []).map((p) => [p.item_code, p.name])
      );
      const raceItems: OutOfStockItem[] = rpcResult.out_of_stock.map((row: any) => ({
        code: row.item_code,
        name: nameByCode.get(row.item_code) ?? row.item_code,
        requested: row.requested,
        available: row.available,
      }));
      return NextResponse.json(
        { error: 'Some items are out of stock', outOfStockItems: raceItems },
        { status: 409 }
      );
    }

    const orderId = rpcResult.order_id as string;

    // Now that stock is reserved and the DB order exists, create the
    // Razorpay order and back-fill its id on the order row.
    const amountInPaise = Math.round(total * 100);
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
      });
    } catch (rzpError) {
      console.error('Razorpay order creation failed:', rzpError);
      // Release the reservation immediately via the shared RPC. Waiting
      // for the 10-minute cron sweep would strand stock needlessly, and
      // the sweep only touches 'pending' rows anyway — this one is now
      // 'failed'.
      await supabaseAdmin.rpc('release_order_stock', {
        p_order_id: orderId,
        p_reason: 'failed',
      });
      return NextResponse.json(
        { error: 'Payment gateway is unavailable. Please try again.' },
        { status: 502 }
      );
    }

    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ razorpay_order_id: rzpOrder.id })
      .eq('id', orderId);

    if (updateError) {
      console.error('Failed to backfill razorpay_order_id:', updateError);
      await supabaseAdmin.rpc('release_order_stock', {
        p_order_id: orderId,
        p_reason: 'failed',
      });
      return NextResponse.json(
        { error: 'Failed to create order. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
