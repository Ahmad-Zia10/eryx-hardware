import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { ALL_PRODUCTS } from '@/lib/catalogue-data';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    // 1. Verify authenticated session
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingDetails } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 2. Validate products and calculate total server-side
    // Never trust the client for pricing — re-derive from catalogue data
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const catalogProduct = ALL_PRODUCTS.find(p => p.code === item.code);

      if (!catalogProduct) {
        return NextResponse.json(
          { error: `Product not found: ${item.code}` },
          { status: 400 }
        );
      }

      if (typeof catalogProduct.mrp !== 'number') {
        return NextResponse.json(
          { error: `${catalogProduct.name} does not have a listed price. Please enquire instead.` },
          { status: 400 }
        );
      }

      if (item.quantity < 1) {
        return NextResponse.json(
          { error: `Invalid quantity for ${catalogProduct.name}` },
          { status: 400 }
        );
      }

      total += catalogProduct.mrp * item.quantity;
      orderItems.push({
        item_code: catalogProduct.code,
        product_name: catalogProduct.name,
        quantity: item.quantity,
        price_at_purchase: catalogProduct.mrp,
      });
    }

    // 3. Optionally resolve real product UUIDs for foreign key linkage
    // This is a best-effort enrichment — if a product isn't found in
    // the DB (e.g., added via admin but not in catalogue-data.ts yet),
    // we still proceed with product_id as null, which the schema allows.
    const itemCodes = orderItems.map(i => i.item_code);
    const { data: dbProducts } = await supabaseAdmin
      .from('products')
      .select('id, item_code')
      .in('item_code', itemCodes);

    const enrichedItems = orderItems.map(item => ({
      ...item,
      product_id: dbProducts?.find(p => p.item_code === item.item_code)?.id ?? null,
    }));

    // 4. Create Razorpay order (amount in paise)
    const amountInPaise = Math.round(total * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    // 5. Atomically create the order + all line items in one transaction
    // via a Postgres RPC function. If either the order or any item
    // insert fails, the entire transaction rolls back — no orphaned
    // order rows, no paid orders with zero line items.
    // Uses supabaseAdmin (service role) since the RPC function is
    // security definer and this bypasses the RLS timing issue described
    // in the function's comment.
    const { data: orderId, error: rpcError } = await supabaseAdmin
      .rpc('create_order_with_items', {
        p_customer_id: user.id,
        p_customer_name: shippingDetails.name,
        p_customer_email: shippingDetails.email,
        p_customer_phone: shippingDetails.phone,
        p_shipping_address: shippingDetails.address,
        p_shipping_city: shippingDetails.city,
        p_shipping_pincode: shippingDetails.pincode,
        p_subtotal: total,
        p_total: total,
        p_razorpay_order_id: rzpOrder.id,
        p_items: enrichedItems,
      });

    if (rpcError || !orderId) {
      console.error('Atomic order creation failed:', rpcError);
      return NextResponse.json(
        { error: 'Failed to create order. Please try again.' },
        { status: 500 }
      );
    }

    // 6. The needs_review flag logic from the previous version is no
    // longer needed here — the atomic transaction either fully succeeds
    // or fully rolls back. There is no partial success state to flag.

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