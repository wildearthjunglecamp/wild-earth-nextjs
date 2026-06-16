/**
 * Calendar Page
 * Monthly tent-occupancy view. Click a day to set date-specific pricing.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { getMonthCalendar } from '@/src/services/calendar.service';
import { CalendarBoard } from '@/src/components/admin/CalendarBoard';
import { Button } from '@/src/components/ui/button';

export const metadata: Metadata = {
  title: 'Calendar | Wild Earth Admin',
  description: 'View bookings calendar and availability',
};

export const dynamic = 'force-dynamic';

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

interface CalendarPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  await requireAdmin();

  const now = new Date();
  const monthParam = firstParam(searchParams.month); // YYYY-MM
  let year = now.getFullYear();
  let month = now.getMonth() + 1;
  if (/^\d{4}-\d{2}$/.test(monthParam)) {
    const [y, m] = monthParam.split('-').map(Number);
    if (m >= 1 && m <= 12) {
      year = y;
      month = m;
    }
  }

  const cal = await getMonthCalendar(year, month);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md font-display text-on-surface">Calendar</h1>
        <p className="text-body-md font-sans text-on-surface-variant mt-1">
          Tent occupancy by day — click a date to set its pricing
        </p>
      </div>

      <div className="bg-surface-container-lowest shadow-level-1 border border-outline-variant rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-headline-sm font-display text-on-surface">
              {cal.monthLabel} {cal.year}
            </h2>
            <div className="flex items-center gap-2">
              <Link href={`/admin/calendar?month=${cal.prevParam}`}>
                <Button variant="outline" size="sm" className="font-display rounded-md">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/admin/calendar">
                <Button variant="outline" size="sm" className="font-display rounded-md">
                  Today
                </Button>
              </Link>
              <Link href={`/admin/calendar?month=${cal.nextParam}`}>
                <Button variant="outline" size="sm" className="font-display rounded-md">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary/20" />
              <span className="text-label-sm font-sans text-on-surface-variant">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-tertiary/40" />
              <span className="text-label-sm font-sans text-on-surface-variant">Limited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-error/40" />
              <span className="text-label-sm font-sans text-on-surface-variant">Full</span>
            </div>
          </div>
        </div>

        <CalendarBoard monthLabel={cal.monthLabel} year={cal.year} days={cal.days} />
      </div>
    </div>
  );
}

// Made with Bob
