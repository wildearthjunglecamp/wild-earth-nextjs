/**
 * PATCH  /api/admin/tents/[id]  — edit a tent (number / type / status)
 * DELETE /api/admin/tents/[id]  — delete a tent (guarded against booking history)
 * Admin-only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/src/lib/auth/adminAuth';
import { updateTent, deleteTent } from '@/src/services/campsite.service';
import { tentUpdateSchema } from '@/src/validations/campsite.schema';

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

  const parsed = tentUpdateSchema.safeParse(body);
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

  const result = await updateTent(params.id, parsed.data);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await denyIfNotAdmin();
  if (denied) return denied;

  const result = await deleteTent(params.id);
  // 409 when blocked by booking history, 400 for other failures.
  const status = result.success ? 200 : result.error?.includes('booking history') ? 409 : 400;
  return NextResponse.json(result, { status });
}

// Made with Bob
