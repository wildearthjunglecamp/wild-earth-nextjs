/**
 * PATCH /api/admin/tent-types/[id]
 * Admin-only. Edit a tent type (name, base price, description, active).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/src/lib/auth/adminAuth';
import { updateTentType } from '@/src/services/campsite.service';
import { tentTypeUpdateSchema } from '@/src/validations/campsite.schema';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const parsed = tentTypeUpdateSchema.safeParse(body);
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

  const result = await updateTentType(params.id, parsed.data);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

// Made with Bob
