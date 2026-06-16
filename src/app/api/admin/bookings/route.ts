/**
 * POST /api/admin/bookings
 * Admin-only. Creates a manual (offline / walk-in / phone) booking.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/src/lib/auth/adminAuth';
import { createManualBooking } from '@/src/services/booking.service';
import { createManualBookingSchema } from '@/src/validations/booking.schema';

export async function POST(request: NextRequest) {
  // Authorize: must be an authenticated admin.
  const session = await getServerSession();
  if (!session.isAuthenticated) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!session.isAdmin) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const parsed = createManualBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation error',
        details: parsed.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  const result = await createManualBooking(parsed.data);

  if (!result.success) {
    const status = result.error === 'Insufficient tents available' ? 409 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 201 });
}

// Made with Bob
