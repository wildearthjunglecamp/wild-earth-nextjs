/**
 * Report Service
 * Aggregations for the admin Reports page.
 *
 * Conventions:
 *  - Trend charts (revenue, occupancy) cover the trailing 12 months.
 *  - Summary cards + breakdowns + profit reflect the CURRENT month, with
 *    month-over-month deltas where shown.
 *  - "Revenue by tent type" uses accommodation subtotals (booking_tents.subtotal);
 *    occupancy = booked tent-nights / (operational tents × days in month).
 */

import { createClient } from '../lib/supabase/server';
import { getExpenseStats } from './expense.service';

const ACTIVE_STATUSES = ['pending_payment', 'confirmed', 'checked_in', 'checked_out'];

interface MonthWindow {
  label: string;
  startMs: number; // UTC ms, inclusive
  endMs: number; // UTC ms, exclusive (first day of next month)
  days: number;
}

function buildMonths(count: number, now: Date): MonthWindow[] {
  const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', timeZone: 'UTC' });
  const months: MonthWindow[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const y = now.getFullYear();
    const m = now.getMonth() - i;
    const startMs = Date.UTC(y, m, 1);
    const endMs = Date.UTC(y, m + 1, 1);
    months.push({
      label: fmt.format(new Date(startMs)),
      startMs,
      endMs,
      days: Math.round((endMs - startMs) / 86400000),
    });
  }
  return months;
}

// Nights of [checkIn, checkOut) that fall within [startMs, endMs).
function overlapNights(checkIn: string, checkOut: string, startMs: number, endMs: number): number {
  const ci = new Date(checkIn).getTime();
  const co = new Date(checkOut).getTime();
  const start = Math.max(ci, startMs);
  const end = Math.min(co, endMs);
  return end > start ? Math.round((end - start) / 86400000) : 0;
}

export interface ReportsData {
  summary: {
    totalRevenue: number; // this month
    revenueChangePct: number;
    occupancyRate: number; // this month, %
    occupancyChangePct: number;
    avgDailyRate: number; // this month
  };
  revenueByMonth: { month: string; revenue: number; bookings: number }[];
  revenueByTentType: { type: string; revenue: number; percentage: number }[];
  expenseBreakdown: { category: string; amount: number; percentage: number }[];
  totalExpenses: number; // this month
  profitSummary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
  };
  occupancyTrends: { month: string; rate: number }[];
}

export async function getReportsData(): Promise<ReportsData> {
  const supabase = await createClient();
  const now = new Date();
  const months = buildMonths(12, now);
  const windowStart = new Date(months[0].startMs).toISOString();
  const thisMonth = months[months.length - 1];
  const thisMonthStartIso = new Date(thisMonth.startMs).toISOString().slice(0, 10);

  const [revenueRes, tentTypeRes, occupancyRes, totalTentsRes, expenseStats] =
    await Promise.all([
      // Paid bookings in the 12-month window (for revenue trend + summary)
      supabase
        .from('bookings')
        .select('total_amount, created_at')
        .eq('payment_status', 'paid')
        .gte('created_at', windowStart),
      // This month's accommodation revenue by tent type
      supabase
        .from('booking_tents')
        .select('subtotal, tents!inner(tent_types!inner(name)), bookings!inner(payment_status, created_at)')
        .eq('bookings.payment_status', 'paid')
        .gte('bookings.created_at', thisMonthStartIso),
      // Active bookings overlapping the window (for occupancy)
      supabase
        .from('booking_tents')
        .select('bookings!inner(check_in, check_out, booking_status)')
        .in('bookings.booking_status', ACTIVE_STATUSES)
        .lt('bookings.check_in', new Date(thisMonth.endMs).toISOString().slice(0, 10))
        .gt('bookings.check_out', new Date(months[0].startMs).toISOString().slice(0, 10)),
      // Operational tents
      supabase.from('tents').select('id', { count: 'exact', head: true }).eq('status', 'available'),
      // This-month expense breakdown
      getExpenseStats(),
    ]);

  // ---- Revenue by month + summary deltas ----
  const revBuckets = months.map((m) => ({ month: m.label, revenue: 0, bookings: 0 }));
  for (const row of revenueRes.data ?? []) {
    const t = new Date((row as any).created_at).getTime();
    const idx = months.findIndex((m) => t >= m.startMs && t < m.endMs);
    if (idx >= 0) {
      revBuckets[idx].revenue += Number((row as any).total_amount || 0);
      revBuckets[idx].bookings += 1;
    }
  }
  const thisMonthRevenue = revBuckets[revBuckets.length - 1].revenue;
  const lastMonthRevenue = revBuckets[revBuckets.length - 2]?.revenue ?? 0;
  const revenueChangePct =
    lastMonthRevenue > 0
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
      : thisMonthRevenue > 0
      ? 100
      : 0;

  // ---- Revenue by tent type (this month) ----
  const typeTotals = new Map<string, number>();
  for (const row of tentTypeRes.data ?? []) {
    const name = (row as any).tents?.tent_types?.name ?? 'Unknown';
    typeTotals.set(name, (typeTotals.get(name) ?? 0) + Number((row as any).subtotal || 0));
  }
  const tentTypeSum = Array.from(typeTotals.values()).reduce((s, v) => s + v, 0);
  const revenueByTentType = Array.from(typeTotals.entries())
    .map(([type, revenue]) => ({
      type,
      revenue,
      percentage: tentTypeSum > 0 ? Math.round((revenue / tentTypeSum) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // ---- Occupancy trend (booked tent-nights / capacity) ----
  const totalTents = totalTentsRes.count ?? 0;
  const bookedNights = new Array(months.length).fill(0);
  for (const row of occupancyRes.data ?? []) {
    const b = (row as any).bookings;
    if (!b) continue;
    months.forEach((m, i) => {
      bookedNights[i] += overlapNights(b.check_in, b.check_out, m.startMs, m.endMs);
    });
  }
  const occupancyTrends = months.map((m, i) => {
    const capacityNights = totalTents * m.days;
    const rate = capacityNights > 0 ? Math.round((bookedNights[i] / capacityNights) * 100) : 0;
    return { month: m.label, rate };
  });
  const occThisMonth = occupancyTrends[occupancyTrends.length - 1].rate;
  const occLastMonth = occupancyTrends[occupancyTrends.length - 2]?.rate ?? 0;
  const occupancyChangePct = Math.round((occThisMonth - occLastMonth) * 10) / 10;

  // Average daily rate this month = revenue / booked tent-nights this month
  const thisMonthBookedNights = bookedNights[bookedNights.length - 1];
  const avgDailyRate =
    thisMonthBookedNights > 0 ? Math.round(thisMonthRevenue / thisMonthBookedNights) : 0;

  // ---- Profit (this month) ----
  const totalExpenses = expenseStats.thisMonthTotal;
  const netProfit = thisMonthRevenue - totalExpenses;
  const profitMargin =
    thisMonthRevenue > 0 ? Math.round((netProfit / thisMonthRevenue) * 1000) / 10 : 0;

  return {
    summary: {
      totalRevenue: thisMonthRevenue,
      revenueChangePct,
      occupancyRate: occThisMonth,
      occupancyChangePct,
      avgDailyRate,
    },
    revenueByMonth: revBuckets,
    revenueByTentType,
    expenseBreakdown: expenseStats.byCategory,
    totalExpenses,
    profitSummary: {
      totalRevenue: thisMonthRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
    },
    occupancyTrends,
  };
}

// Made with Bob
