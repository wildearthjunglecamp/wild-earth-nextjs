/**
 * Calendar View Component
 * Displays monthly calendar with booking counts and availability
 */

'use client';

import { cn } from '@/src/lib/utils';

interface CalendarDay {
  date: number;
  month: 'prev' | 'current' | 'next';
  bookings: number;
  availability: 'available' | 'limited' | 'full';
  today?: boolean;
}

interface CalendarData {
  month: string;
  year: number;
  days: CalendarDay[];
}

interface CalendarViewProps {
  data: CalendarData;
}

/**
 * Get availability color classes
 */
function getAvailabilityColor(availability: CalendarDay['availability']) {
  const colors = {
    available: 'bg-primary/10 border-primary/20',
    limited: 'bg-tertiary/20 border-tertiary/30',
    full: 'bg-error/20 border-error/30',
  };
  return colors[availability];
}

/**
 * Get booking count color
 */
function getBookingCountColor(availability: CalendarDay['availability']) {
  const colors = {
    available: 'text-primary',
    limited: 'text-tertiary',
    full: 'text-error',
  };
  return colors[availability];
}

export function CalendarView({ data }: CalendarViewProps) {
  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="space-y-2">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center py-3 text-label-md font-display text-on-surface-variant uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-2">
        {data.days.map((day, index) => (
          <div
            key={index}
            className={cn(
              'relative min-h-[120px] p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-level-1',
              day.month === 'current'
                ? getAvailabilityColor(day.availability)
                : 'bg-surface-container/50 border-outline-variant/30',
              day.today && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            {/* Date number */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={cn(
                  'text-headline-sm font-display',
                  day.month === 'current'
                    ? 'text-on-surface'
                    : 'text-on-surface-variant/50',
                  day.today && 'text-primary font-bold'
                )}
              >
                {day.date}
              </span>
              {day.today && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </div>

            {/* Booking count */}
            {day.month === 'current' && day.bookings > 0 && (
              <div className="space-y-1">
                <div
                  className={cn(
                    'text-body-md font-sans font-semibold',
                    getBookingCountColor(day.availability)
                  )}
                >
                  {day.bookings} Booking{day.bookings !== 1 ? 's' : ''}
                </div>
                
                {/* Visual indicator bar */}
                <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all',
                      day.availability === 'available' && 'bg-primary',
                      day.availability === 'limited' && 'bg-tertiary',
                      day.availability === 'full' && 'bg-error'
                    )}
                    style={{ width: `${Math.min((day.bookings / 20) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Made with Bob