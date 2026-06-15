/**
 * Calendar Page
 * Visual calendar view of bookings with availability indicators
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { CalendarView } from '@/src/components/admin/CalendarView';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Calendar | Wild Earth Admin',
  description: 'View bookings calendar and availability',
};

/**
 * Sample calendar data for October 2024
 */
const calendarData = {
  month: 'October',
  year: 2024,
  days: [
    // Week 1
    { date: 29, month: 'prev', bookings: 0, availability: 'available' },
    { date: 30, month: 'prev', bookings: 0, availability: 'available' },
    { date: 1, month: 'current', bookings: 2, availability: 'available' },
    { date: 2, month: 'current', bookings: 5, availability: 'available' },
    { date: 3, month: 'current', bookings: 8, availability: 'limited' },
    { date: 4, month: 'current', bookings: 12, availability: 'limited' },
    { date: 5, month: 'current', bookings: 15, availability: 'full' },
    
    // Week 2
    { date: 6, month: 'current', bookings: 8, availability: 'limited' },
    { date: 7, month: 'current', bookings: 3, availability: 'available' },
    { date: 8, month: 'current', bookings: 3, availability: 'available' },
    { date: 9, month: 'current', bookings: 8, availability: 'limited' },
    { date: 10, month: 'current', bookings: 14, availability: 'limited' },
    { date: 11, month: 'current', bookings: 3, availability: 'available' },
    { date: 12, month: 'current', bookings: 8, availability: 'limited' },
    
    // Week 3
    { date: 13, month: 'current', bookings: 4, availability: 'available' },
    { date: 14, month: 'current', bookings: 2, availability: 'available' },
    { date: 15, month: 'current', bookings: 10, availability: 'limited', today: true },
    { date: 16, month: 'current', bookings: 7, availability: 'available' },
    { date: 17, month: 'current', bookings: 1, availability: 'available' },
    { date: 18, month: 'current', bookings: 14, availability: 'limited' },
    { date: 19, month: 'current', bookings: 16, availability: 'full' },
    
    // Week 4
    { date: 20, month: 'current', bookings: 9, availability: 'limited' },
    { date: 21, month: 'current', bookings: 15, availability: 'full' },
    { date: 22, month: 'current', bookings: 2, availability: 'available' },
    { date: 23, month: 'current', bookings: 2, availability: 'available' },
    { date: 24, month: 'current', bookings: 9, availability: 'limited' },
    { date: 25, month: 'current', bookings: 2, availability: 'available' },
    { date: 26, month: 'current', bookings: 2, availability: 'available' },
    
    // Week 5
    { date: 27, month: 'current', bookings: 2, availability: 'available' },
    { date: 28, month: 'current', bookings: 9, availability: 'limited' },
    { date: 29, month: 'current', bookings: 2, availability: 'available' },
    { date: 30, month: 'current', bookings: 2, availability: 'available' },
    { date: 31, month: 'current', bookings: 2, availability: 'available' },
    { date: 1, month: 'next', bookings: 0, availability: 'available' },
    { date: 2, month: 'next', bookings: 0, availability: 'available' },
  ],
};

export default async function CalendarPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-display text-on-surface">Calendar</h1>
          <p className="text-body-md font-sans text-on-surface-variant mt-1">
            View bookings calendar and manage availability
          </p>
        </div>
      </div>

      {/* Calendar card */}
      <div className="bg-surface-container-lowest shadow-level-1 border border-outline-variant rounded-lg p-6">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-headline-sm font-display text-on-surface">
              {calendarData.month} {calendarData.year}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="font-display rounded-md">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="font-display rounded-md">
                Today
              </Button>
              <Button variant="outline" size="sm" className="font-display rounded-md">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* View toggle and legend */}
          <div className="flex items-center gap-6">
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

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-surface-container rounded-md p-1">
              <Button variant="ghost" size="sm" className="bg-primary text-on-primary font-display rounded-md">
                Day
              </Button>
              <Button variant="ghost" size="sm" className="font-display rounded-md">
                Week
              </Button>
              <Button variant="ghost" size="sm" className="font-display rounded-md">
                Month
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar grid */}
        <CalendarView data={calendarData} />
      </div>
    </div>
  );
}

// Made with Bob
