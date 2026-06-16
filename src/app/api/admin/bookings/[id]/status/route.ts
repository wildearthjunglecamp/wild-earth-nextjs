/**
 * PATCH /api/admin/bookings/[id]/status
 * Admin-only. Applies a booking status transition (check-in / check-out / cancel).
 * [id] is the booking_number.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/src/lib/auth/adminAuth';
import {
  updateBookingStatus,
  type BookingStatusAction,
} from '@/src/services/booking.service';

const VALID_ACTIONS: BookingStatusAction[] = ['check-in', 'check-out', 'cancel'];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authorize: must be an authenticated admin.
  const session = await getServerSession();
  if (!session.isAuthenticated) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  if (!session.isAdmin) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    );
  }

  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const action = body.action as BookingStatusAction;
  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  }

  const result = await updateBookingStatus(params.id, action);

  if (!result.success) {
    const status = result.error === 'Booking not found' ? 404 : 400;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result);
}

// Made with Bob
