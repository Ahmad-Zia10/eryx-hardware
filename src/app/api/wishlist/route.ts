import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { wishlistItemSchema } from '@/lib/validations/wishlist';

// Return the caller's saved variant IDs. Used to hydrate heart state on load.
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('variant_id')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load wishlist:', error);
      return NextResponse.json({ error: 'Failed to load wishlist' }, { status: 500 });
    }

    return NextResponse.json({ variantIds: (data || []).map((r) => r.variant_id) });
  } catch (err) {
    console.error('Wishlist GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Add a variant to the caller's wishlist. Idempotent — a repeat save on an
// existing (customer_id, variant_id) pair is treated as success.
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = wishlistItemSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('wishlist_items')
      .insert({ customer_id: user.id, variant_id: parsed.data.variant_id });

    // 23505 = unique violation → already saved. Idempotent success.
    if (error && error.code !== '23505') {
      // 23503 = FK violation → variant doesn't exist.
      if (error.code === '23503') {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      console.error('Failed to add to wishlist:', error);
      return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Wishlist POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Remove a variant from the caller's wishlist. Ownership enforced by RLS plus
// the explicit customer_id filter.
export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = wishlistItemSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid payload' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('customer_id', user.id)
      .eq('variant_id', parsed.data.variant_id);

    if (error) {
      console.error('Failed to remove from wishlist:', error);
      return NextResponse.json({ error: 'Failed to remove item' }, { status: 500 });
    }

    // Idempotent — removing something not present is still success.
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Wishlist DELETE error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
