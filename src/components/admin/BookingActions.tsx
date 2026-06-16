'use client';

/**
 * Booking Actions
 * Admin status-transition buttons for the booking detail page.
 * Calls /api/admin/bookings/[id]/status and refreshes the server data.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, X, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { useToast } from '@/src/hooks/use-toast';
import type { AdminBookingStatus, BookingStatusAction } from '@/src/services/booking.service';

interface BookingActionsProps {
  bookingNumber: string;
  status: AdminBookingStatus;
}

export function BookingActions({ bookingNumber, status }: BookingActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState<BookingStatusAction | null>(null);

  const run = async (action: BookingStatusAction) => {
    if (
      action === 'cancel' &&
      !window.confirm('Cancel this booking? This cannot be undone.')
    ) {
      return;
    }

    setPending(action);
    try {
      const res = await fetch(
        `/api/admin/bookings/${encodeURIComponent(bookingNumber)}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.details || data.error || 'Action failed');
      }

      const labels: Record<BookingStatusAction, string> = {
        'check-in': 'checked in',
        'check-out': 'checked out',
        cancel: 'cancelled',
      };
      toast({ title: 'Booking updated', description: `Booking ${labels[action]}.` });
      router.refresh();
    } catch (err: any) {
      toast({
        title: 'Action failed',
        description: err?.message || 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setPending(null);
    }
  };

  const canCancel =
    status !== 'cancelled' && status !== 'checked-out' && status !== 'no-show';

  return (
    <div className="flex items-center gap-2">
      {status === 'confirmed' && (
        <Button
          onClick={() => run('check-in')}
          disabled={pending !== null}
          className="bg-primary text-on-primary font-display rounded-md"
        >
          {pending === 'check-in' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4 mr-2" />
          )}
          Check In
        </Button>
      )}

      {status === 'checked-in' && (
        <Button
          onClick={() => run('check-out')}
          disabled={pending !== null}
          className="bg-tertiary text-on-tertiary font-display rounded-md"
        >
          {pending === 'check-out' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          Check Out
        </Button>
      )}

      {canCancel && (
        <Button
          onClick={() => run('cancel')}
          disabled={pending !== null}
          variant="outline"
          className="text-error hover:text-error font-display rounded-md"
        >
          {pending === 'cancel' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <X className="h-4 w-4 mr-2" />
          )}
          Cancel
        </Button>
      )}
    </div>
  );
}

// Made with Bob
