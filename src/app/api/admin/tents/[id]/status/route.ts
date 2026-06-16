/**
 * PATCH /api/admin/tents/[id]/status
 * Admin-only. Set a tent's operational status (available/maintenance/out_of_service).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/src/lib/auth/adminAuth';
import {
  updateTentStatus,
  SETTABLE_TENT_STATUSES,
  type SettableTentStatus,
} from '@/src/services/inventory.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session.isAuthenticated)
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!session.isAdmin)
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!SETTABLE_TENT_STATUSES.includes(body.status as SettableTentStatus)) {
    return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
  }

  const result = await updateTentStatus(params.id, body.status as SettableTentStatus);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

// Made with Bob
