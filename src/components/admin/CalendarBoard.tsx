'use client';

/**
 * Calendar Board
 * Client wrapper: renders the month grid and opens the day pricing modal.
 */

import { useState } from 'react';
import { CalendarView } from '@/src/components/admin/CalendarView';
import { DayPricingModal } from '@/src/components/admin/DayPricingModal';
import type { CalendarDay } from '@/src/services/calendar.service';

interface CalendarBoardProps {
  monthLabel: string;
  year: number;
  days: CalendarDay[];
}

export function CalendarBoard({ monthLabel, year, days }: CalendarBoardProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <>
      <CalendarView
        data={{ month: monthLabel, year, days }}
        onDayClick={(iso) => setSelectedDate(iso)}
      />
      <DayPricingModal
        date={selectedDate}
        open={selectedDate !== null}
        onOpenChange={(o) => {
          if (!o) setSelectedDate(null);
        }}
      />
    </>
  );
}

// Made with Bob
