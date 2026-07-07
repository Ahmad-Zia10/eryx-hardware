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
      const payment = event.payload.payment?.entity;
      const order = event.payload.order?.entity;
      const razorpayOrderId = payment?.order_id || order?.id;
      const razorpayPaymentId = payment?.id || null;

      if (!razorpayOrderId) {
        return NextResponse.json({ error: 'Missing Razorpay order id' }, { status: 400 });
      }

      const { data: result, error } = await supabaseAdmin
        .rpc('mark_order_paid_and_record_promo', {
          p_razorpay_order_id: razorpayOrderId,
          p_razorpay_payment_id: razorpayPaymentId,
        });

      if (error) {
        console.error('Error marking order paid:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      if (result === 'already_processed') {
        return NextResponse.json({ status: 'ok', note: 'already processed' });
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
