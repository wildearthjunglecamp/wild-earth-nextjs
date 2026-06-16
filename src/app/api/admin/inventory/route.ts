/**
 * POST /api/admin/inventory
 * Admin-only. Create an inventory item.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/src/lib/auth/adminAuth';
import { createInventoryItem } from '@/src/services/inventory.service';
import { inventoryItemSchema } from '@/src/validations/inventory.schema';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session.isAuthenticated)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!session.isAdmin)
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = inventoryItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        details: parsed.error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
      },
      { status: 400 }
    );
  }

  const result = await createInventoryItem(parsed.data);
  return NextResponse.json(result, { status: result.success ? 201 : 400 });
}

// Made with Bob
