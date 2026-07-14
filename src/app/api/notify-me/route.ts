import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';
import { sendStoreNotification } from '@/lib/server/notifications';
import { notifyMeSchema } from '@/lib/validations/notify-me';

export async function POST(req: Request) {
  try {
    const raw = await req.json();
    const parsed = notifyMeSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }
    const { variant_id, email } = parsed.data;

    // Link to the authenticated user if there is one; anonymous is fine.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch variant to (a) name it in the ops email and (b) guard against
    // subscribing to a variant that is already in stock — stale client
    // state or someone poking the API directly.
    const { data: variant, error: variantError } = await supabaseAdmin
      .from('product_variants')
      .select('id, name, item_code, stock_quantity, track_inventory, is_active')
      .eq('id', variant_id)
      .single();

    if (variantError || !variant) {
      return NextResponse.json(
        { error: 'Product not found.' },
        { status: 404 }
      );
    }

    if (!variant.is_active) {
      return NextResponse.json(
        { error: 'This product is no longer available.' },
        { status: 400 }
      );
    }

    if (variant.track_inventory && variant.stock_quantity > 0) {
      return NextResponse.json(
        { error: 'This product is already in stock.' },
        { status: 400 }
      );
    }

    // ON CONFLICT DO NOTHING via the .upsert with ignoreDuplicates.
    // We detect the already-subscribed case by checking whether the row
    // was returned.
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('stock_notifications')
      .upsert(
        {
          variant_id,
          email,
          customer_id: user?.id ?? null,
          status: 'pending',
        },
        { onConflict: 'variant_id,email', ignoreDuplicates: true }
      )
      .select('id')
      .maybeSingle();

    if (insertError) {
      console.error('Stock notification signup failed:', insertError);
      return NextResponse.json(
        { error: 'Could not subscribe. Please try again.' },
        { status: 500 }
      );
    }

    const alreadySubscribed = !inserted;

    if (!alreadySubscribed) {
      // Fire-and-forget ops email. We deliberately do NOT send a customer
      // confirmation — the promised email is the back-in-stock ping, not
      // a "we got your signup" note.
      await sendStoreNotification({
        subject: `New stock notification signup: ${variant.item_code}`,
        text: `Someone signed up to be notified when ${variant.name} (${variant.item_code}) is back in stock.\n\nEmail: ${email}\nCustomer: ${user?.id ? user.id : 'anonymous'}`,
        replyTo: email,
      });
    }

    return NextResponse.json({ ok: true, alreadySubscribed });
  } catch (err) {
    console.error('notify-me route error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
