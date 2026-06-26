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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, shippingDetails } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Calculate total server-side
    let total = 0;
    const orderItemsForDb = [];

    for (const item of items) {
      const catalogProduct = ALL_PRODUCTS.find(p => p.code === item.code);
      if (!catalogProduct || typeof catalogProduct.mrp !== 'number') {
        return NextResponse.json({ error: `Invalid product: ${item.code}` }, { status: 400 });
      }
      
      const price = catalogProduct.mrp;
      total += price * item.quantity;

      // We'll link product_id later or leave it null as schema allows,
      // but we store product_name and item_code explicitly.
      orderItemsForDb.push({
        item_code: catalogProduct.code,
        product_name: catalogProduct.name,
        quantity: item.quantity,
        price_at_purchase: price,
      });
    }

    // Razorpay amount is in paise
    const amountInPaise = Math.round(total * 100);

    // 2. Create Razorpay order
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`
    });

    // 3. Store in Supabase
    // We use the authenticated client so the customer_id matches auth.uid() automatically by RLS
    // Wait, the RLS requires auth.uid() = customer_id. So we must pass it explicitly.
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      customer_id: user.id,
      customer_name: shippingDetails.name,
      customer_email: shippingDetails.email,
      customer_phone: shippingDetails.phone,
      shipping_address: shippingDetails.address,
      shipping_city: shippingDetails.city,
      shipping_pincode: shippingDetails.pincode,
      subtotal: total,
      total: total,
      status: 'pending',
      razorpay_order_id: rzpOrder.id
    }).select().single();

    if (orderError || !order) {
      console.error('Order creation error:', orderError);
      return NextResponse.json({ error: 'Failed to create order in database' }, { status: 500 });
    }

    // Insert items
    const itemsToInsert = orderItemsForDb.map(item => ({
      ...item,
      order_id: order.id,
    }));

    // We can also try to look up real product_id from DB using admin client to keep it clean
    const { data: realProducts } = await supabaseAdmin.from('products').select('id, item_code').in('item_code', itemsToInsert.map(i => i.item_code));
    
    if (realProducts) {
      itemsToInsert.forEach(item => {
        const match = realProducts.find(p => p.item_code === item.item_code);
        if (match) {
          (item as any).product_id = match.id;
        }
      });
    }

    const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);

    if (itemsError) {
      console.error('Order items error:', itemsError);
      // We don't fail the whole request because order is created, but it's bad.
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: "INR"
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
