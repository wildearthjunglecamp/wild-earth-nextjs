/**
 * GET  /api/admin/pricing/day?date=YYYY-MM-DD
 *   → tent types with base + custom (effective) price for that date.
 * POST /api/admin/pricing/day  { date, items: [{ tentTypeId, price | null }] }
 *   → upsert custom price per tent type for the date; price=null reverts to base.
 * Admin-only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/src/lib/auth/adminAuth';
import { createClient } from '@/src/lib/supabase/server';
import { pricingService } from '@/src/services/pricing.service';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// findAll() treats endDate as exclusive, so query [date, date+1) to hit the day.
function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function denyIfNotAdmin() {
  const session = await getServerSession();
  if (!session.isAuthenticated)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!session.isAdmin)
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  return null;
}

export async function GET(request: NextRequest) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const date = request.nextUrl.searchParams.get('date') ?? '';
  if (!DATE_RE.test(date)) {
    return NextResponse.json({ success: false, error: 'Invalid date' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: types } = await supabase
    .from('tent_types')
    .select('id, name, base_price')
    .eq('is_active', true)
    .order('capacity', { ascending: true });

  const custom = await pricingService.getAllPricing({ startDate: date, endDate: nextDay(date) });
  const customByType = new Map(custom.map((c) => [c.tentTypeId, c.customPrice]));

  const items = (types ?? []).map((t: any) => {
    const basePrice = Number(t.base_price);
    const customPrice = customByType.has(t.id) ? Number(customByType.get(t.id)) : null;
    return {
      tentTypeId: t.id,
      name: t.name,
      basePrice,
      customPrice,
      effectivePrice: customPrice ?? basePrice,
    };
  });

  return NextResponse.json({ success: true, date, items });
}

export async function POST(request: NextRequest) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  let body: { date?: string; items?: { tentTypeId: string; price: number | null }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { date, items } = body;
  if (!date || !DATE_RE.test(date) || !Array.isArray(items)) {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }

  try {
    // Existing overrides for this date, to delete by id when reverting to base.
    const existing = await pricingService.getAllPricing({ startDate: date, endDate: nextDay(date) });
    const idByType = new Map(existing.map((c) => [c.tentTypeId, c.id]));

    for (const item of items) {
      if (item.price === null || item.price === undefined) {
        const id = idByType.get(item.tentTypeId);
        if (id) await pricingService.deletePricing(id);
      } else {
        if (typeof item.price !== 'number' || item.price < 0) {
          return NextResponse.json(
            { success: false, error: 'Prices must be non-negative numbers' },
            { status: 400 }
          );
        }
        await pricingService.bulkUpsertPricing(item.tentTypeId, [date], item.price);
      }
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to update pricing' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}

// Made with Bob
