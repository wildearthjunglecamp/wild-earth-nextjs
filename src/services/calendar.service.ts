/**
 * Calendar Service
 * Per-day tent occupancy for a month, for the admin calendar.
 */

import { createClient } from '../lib/supabase/server';

const ACTIVE_BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'checked_in',
  'checked_out',
];

export interface CalendarDay {
  date: number;
  month: 'prev' | 'current' | 'next';
  iso?: string; // YYYY-MM-DD for current-month days
  bookings: number; // occupied tents that day
  availability: 'available' | 'limited' | 'full';
  today?: boolean;
}

export interface MonthCalendar {
  monthLabel: string; // e.g. "June"
  year: number;
  monthParam: string; // YYYY-MM
  prevParam: string;
  nextParam: string;
  totalTents: number;
  days: CalendarDay[];
}

function iso(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

function availabilityLevel(occupied: number, total: number): CalendarDay['availability'] {
  if (total <= 0) return 'available';
  if (occupied >= total) return 'full';
  if (occupied / total >= 0.7) return 'limited';
  return 'available';
}

/**
 * Build the calendar grid for the given month (1–12), with occupied tent
 * counts per day and an availability level.
 */
export async function getMonthCalendar(year: number, month: number): Promise<MonthCalendar> {
  const supabase = await createClient();

  const monthStart = Date.UTC(year, month - 1, 1);
  const monthEnd = Date.UTC(year, month, 1);
  const daysInMonth = Math.round((monthEnd - monthStart) / 86400000);
  const firstWeekday = new Date(monthStart).getUTCDay(); // 0=Sun

  const [tentsRes, occRes] = await Promise.all([
    // Bookable (operational) tents
    supabase.from('tents').select('id', { count: 'exact', head: true }).eq('status', 'available'),
    // Active bookings overlapping this month
    supabase
      .from('booking_tents')
      .select('bookings!inner(check_in, check_out, booking_status)')
      .in('bookings.booking_status', ACTIVE_BOOKING_STATUSES)
      .lt('bookings.check_in', iso(monthEnd))
      .gt('bookings.check_out', iso(monthStart)),
  ]);

  const totalTents = tentsRes.count ?? 0;

  // occupied[dayOfMonth-1] = tents occupied that day
  const occupied = new Array(daysInMonth).fill(0);
  for (const row of occRes.data ?? []) {
    const b = (row as any).bookings;
    if (!b) continue;
    const ci = new Date(b.check_in).getTime();
    const co = new Date(b.check_out).getTime();
    const start = Math.max(ci, monthStart);
    const end = Math.min(co, monthEnd);
    for (let t = start; t < end; t += 86400000) {
      const idx = Math.round((t - monthStart) / 86400000);
      if (idx >= 0 && idx < daysInMonth) occupied[idx] += 1;
    }
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  const days: CalendarDay[] = [];

  // Leading days from the previous month (blank padding)
  const prevMonthEnd = monthStart;
  for (let i = firstWeekday; i > 0; i--) {
    const d = new Date(prevMonthEnd - i * 86400000);
    days.push({ date: d.getUTCDate(), month: 'prev', bookings: 0, availability: 'available' });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayIso = iso(Date.UTC(year, month - 1, day));
    const occ = occupied[day - 1];
    days.push({
      date: day,
      month: 'current',
      iso: dayIso,
      bookings: occ,
      availability: availabilityLevel(occ, totalTents),
      today: dayIso === todayIso,
    });
  }

  // Trailing days to complete the final week
  while (days.length % 7 !== 0) {
    const nextIndex = days.length - (firstWeekday + daysInMonth) + 1;
    days.push({ date: nextIndex, month: 'next', bookings: 0, availability: 'available' });
  }

  const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', timeZone: 'UTC' }).format(
    new Date(monthStart)
  );

  const prev = new Date(Date.UTC(year, month - 2, 1));
  const next = new Date(Date.UTC(year, month, 1));
  const param = (d: Date) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

  return {
    monthLabel,
    year,
    monthParam: `${year}-${String(month).padStart(2, '0')}`,
    prevParam: param(prev),
    nextParam: param(next),
    totalTents,
    days,
  };
}

// Made with Bob
