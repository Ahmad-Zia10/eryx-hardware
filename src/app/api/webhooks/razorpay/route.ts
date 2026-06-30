import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('RAZORPAY_WEBHOOK_SECRET is not set');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    // CHANGED: was a plain !== string comparison. timingSafeEqual avoids
    // leaking timing information about how many leading characters
    // matched, which is the correct way to compare secrets/signatures
    // even though the practical risk here was already low. Requires
    // both buffers to be equal length first, since timingSafeEqual
    // throws if lengths differ rather than just returning false.
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    const signatureIsValid =
      signatureBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

    if (!signatureIsValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      // Idempotency guard: Razorpay retries webhook delivery until it
      // gets a 200 response, so the same event can legitimately arrive
      // more than once. The update itself is naturally safe to repeat
      // (no unique constraint to violate), but this guard avoids an
      // unnecessary write and an updated_at bump on every retry of an
      // event we've already processed.
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('status')
        .eq('razorpay_order_id', razorpayOrderId)
        .single();

      if (existingOrder?.status === 'paid') {
        return NextResponse.json({ status: 'ok', note: 'already processed' });
      }

      const { error } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          razorpay_payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString()
        })
        .eq('razorpay_order_id', razorpayOrderId);

      if (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 