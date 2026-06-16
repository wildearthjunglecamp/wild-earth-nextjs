/**
 * PATCH  /api/admin/inventory/[id]  — update an inventory item (partial)
 * DELETE /api/admin/inventory/[id]  — delete an inventory item
 * Admin-only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/src/lib/auth/adminAuth';
import { updateInventoryItem, deleteInventoryItem } from '@/src/services/inventory.service';
import { inventoryItemUpdateSchema } from '@/src/validations/inventory.schema';

async function denyIfNotAdmin() {
  const session = await getServerSession();
  if (!session.isAuthenticated)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!session.isAdmin)
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = inventoryItemUpdateSchema.safeParse(body);
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

  const result = await updateInventoryItem(params.id, parsed.data);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const result = await deleteInventoryItem(params.id);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

// Made with Bob
