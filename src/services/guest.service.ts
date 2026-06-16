/**
 * Guest Service
 * Guests are derived by aggregating bookings by customer email (there are no
 * separate guest accounts). Aggregation is done in app code — fine for this
 * scale; revisit with a SQL view if booking volume grows large.
 */

import { createClient } from '../lib/supabase/server';
import { mapBookingStatusToUi, type AdminBookingStatus } from './booking.service';

export interface GuestBooking {
  bookingNumber: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  status: AdminBookingStatus;
}

export interface GuestRow {
  email: string;
  name: string;
  phone: string;
  totalBookings: number;
  totalSpent: number; // paid bookings only
  lastStay: string | null;
  bookings: GuestBooking[];
}

export interface ListGuestsParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListGuestsResult {
  rows: GuestRow[];
  total: number;
  page: number;
  pageSize: number;
}

export async function listGuests(params: ListGuestsParams = {}): Promise<ListGuestsResult> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));

  const { data, error } = await supabase
    .from('bookings')
    .select(
      'booking_number, customer_name, customer_email, customer_phone, check_in, check_out, total_amount, booking_status, payment_status, created_at'
    )
    .order('created_at', { ascending: false });

  if (error) {
    console.error('listGuests error:', error);
    return { rows: [], total: 0, page, pageSize };
  }

  // Aggregate by lowercased email.
  const byEmail = new Map<string, GuestRow>();
  for (const b of data ?? []) {
    const email = ((b as any).customer_email ?? '').toLowerCase();
    if (!email) continue;

    let guest = byEmail.get(email);
    if (!guest) {
      // First (most recent, since ordered desc) booking sets name/phone.
      guest = {
        email,
        name: (b as any).customer_name,
        phone: (b as any).customer_phone,
        totalBookings: 0,
        totalSpent: 0,
        lastStay: null,
        bookings: [],
      };
      byEmail.set(email, guest);
    }

    guest.totalBookings += 1;
    if ((b as any).payment_status === 'paid') {
      guest.totalSpent += Number((b as any).total_amount || 0);
    }
    const checkIn = (b as any).check_in as string;
    if (!guest.lastStay || checkIn > guest.lastStay) guest.lastStay = checkIn;

    guest.bookings.push({
      bookingNumber: (b as any).booking_number,
      checkIn,
      checkOut: (b as any).check_out,
      amount: Number((b as any).total_amount || 0),
      status: mapBookingStatusToUi((b as any).booking_status),
    });
  }

  let guests = Array.from(byEmail.values());

  // Search across name / email / phone.
  const q = (params.search ?? '').trim().toLowerCase();
  if (q) {
    guests = guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.email.includes(q) ||
        (g.phone ?? '').toLowerCase().includes(q)
    );
  }

  // Most recent stay first.
  guests.sort((a, b) => (b.lastStay ?? '').localeCompare(a.lastStay ?? ''));

  const total = guests.length;
  const start = (page - 1) * pageSize;
  const rows = guests.slice(start, start + pageSize);

  return { rows, total, page, pageSize };
}

// Made with Bob
