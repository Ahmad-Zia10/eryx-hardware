import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// Vercel Cron always sends GET with `Authorization: Bearer $CRON_SECRET`.
// On the Hobby plan the primary schedule lives in pg_cron instead
// (see supabase/migrations/20260713120100_schedule_release_expired_orders.sql);
// this route stays as a manual/debug trigger — curl it with the same
// bearer secret to fire the sweep on demand.
export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    console.error('CRON_SECRET is not set');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Timing-safe comparison mirrors src/app/api/webhooks/razorpay/route.ts.
  const provided = Buffer.from(auth.slice('Bearer '.length));
  const expected = Buffer.from(secret);
  const ok =
    provided.length === expected.length &&
    crypto.timingSafeEqual(provided, expected);

  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin.rpc('release_expired_orders');

  if (error) {
    console.error('release_expired_orders failed:', error);
    return NextResponse.json({ error: 'Sweep failed' }, { status: 500 });
  }

  return NextResponse.json({ released: data ?? 0 });
}
