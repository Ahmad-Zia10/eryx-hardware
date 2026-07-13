import { NextResponse } from 'next/server';
import { createClient, supabaseAdmin } from '@/lib/supabase/server';

type AvailableCode = {
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  eligible: boolean;
  ineligibility_reason?: string;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function formatINR(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

function daysUntil(target: Date, now: Date): number {
  return Math.ceil((target.getTime() - now.getTime()) / DAY_MS);
}

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const rawSubtotal = searchParams.get('subtotal');
  const subtotal = rawSubtotal !== null ? Number(rawSubtotal) : NaN;
  // Missing/invalid subtotal → treat as unknown; skip the min-order check
  // rather than erroring, since the real re-check happens at checkout.
  const haveSubtotal = Number.isFinite(subtotal) && subtotal >= 0;

  const { data: promos, error: promosError } = await supabaseAdmin
    .from('promo_codes')
    .select(
      'id, code, description, discount_type, discount_value, min_order_value, max_uses_per_user, expires_at'
    )
    .eq('is_public', true)
    .eq('is_active', true)
    .order('expires_at', { ascending: true, nullsFirst: false });

  if (promosError) {
    console.error('available promo codes: promos lookup failed', promosError);
    return NextResponse.json({ error: 'Failed to load codes' }, { status: 500 });
  }

  const rows = promos ?? [];
  if (rows.length === 0) {
    return NextResponse.json({ codes: [] });
  }

  const ids = rows.map((r) => r.id);
  const { data: usages, error: usagesError } = await supabaseAdmin
    .from('promo_usages')
    .select('promo_code_id')
    .eq('customer_id', user.id)
    .in('promo_code_id', ids);

  if (usagesError) {
    console.error('available promo codes: usages lookup failed', usagesError);
    return NextResponse.json({ error: 'Failed to load codes' }, { status: 500 });
  }

  const usageCount = new Map<string, number>();
  for (const row of usages ?? []) {
    usageCount.set(row.promo_code_id, (usageCount.get(row.promo_code_id) ?? 0) + 1);
  }

  const now = new Date();
  const codes: AvailableCode[] = rows.map((promo) => {
    const base = {
      code: promo.code as string,
      description: (promo.description as string | null) ?? null,
      discount_type: promo.discount_type as string,
      discount_value: Number(promo.discount_value),
    };

    if (promo.expires_at) {
      const expiresAt = new Date(promo.expires_at as string);
      if (expiresAt.getTime() < now.getTime()) {
        return { ...base, eligible: false, ineligibility_reason: 'Expired' };
      }
    }

    const used = usageCount.get(promo.id) ?? 0;
    const maxUses = (promo.max_uses_per_user as number | null) ?? 1;
    if (used >= maxUses) {
      return { ...base, eligible: false, ineligibility_reason: 'Already used' };
    }

    const minOrder = Number(promo.min_order_value ?? 0);
    if (haveSubtotal && minOrder > 0 && subtotal < minOrder) {
      return {
        ...base,
        eligible: false,
        ineligibility_reason: `Min order ${formatINR(minOrder)}`,
      };
    }

    // Eligible. Attach an "expires soon" nudge for the last few days.
    if (promo.expires_at) {
      const days = daysUntil(new Date(promo.expires_at as string), now);
      if (days <= 3) {
        const label =
          days <= 0
            ? 'Expires today'
            : days === 1
              ? 'Expires in 1 day'
              : `Expires in ${days} days`;
        return { ...base, eligible: true, ineligibility_reason: label };
      }
    }

    return { ...base, eligible: true };
  });

  // Eligible first, ineligible after — each group already in expires_at asc.
  codes.sort((a, b) => Number(b.eligible) - Number(a.eligible));

  return NextResponse.json({ codes });
}
