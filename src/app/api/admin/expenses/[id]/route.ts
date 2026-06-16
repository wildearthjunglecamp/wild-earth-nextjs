/**
 * PATCH  /api/admin/expenses/[id]  — update an expense
 * DELETE /api/admin/expenses/[id]  — delete an expense
 * Admin-only.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/src/lib/auth/adminAuth';
import { updateExpense, deleteExpense } from '@/src/services/expense.service';
import { expenseSchema } from '@/src/validations/expense.schema';

async function requireAdminJson() {
  const session = await getServerSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.isAdmin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdminJson();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = expenseSchema.safeParse(body);
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

  const result = await updateExpense(params.id, parsed.data);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = await requireAdminJson();
  if (denied) return denied;

  const result = await deleteExpense(params.id);
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}

// Made with Bob
