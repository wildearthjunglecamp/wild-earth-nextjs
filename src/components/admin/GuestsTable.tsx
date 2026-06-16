'use client';

/**
 * Guests Table
 * Lists aggregated guests; clicking one opens a dialog with their booking
 * history (data already loaded — no extra fetch).
 */

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, History } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import type { GuestRow } from '@/src/services/guest.service';

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
  cancelled: 'Cancelled',
  'no-show': 'No Show',
};
const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-primary text-on-primary',
  pending: 'bg-secondary-container text-on-secondary-container',
  'checked-in': 'bg-tertiary-container text-on-tertiary-container',
  'checked-out': 'bg-surface-container-high text-on-surface',
  cancelled: 'bg-error-container text-on-error-container',
  'no-show': 'bg-error-container text-on-error-container',
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function GuestsTable({ guests }: { guests: GuestRow[] }) {
  const [selected, setSelected] = useState<GuestRow | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Bookings</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Last Stay</TableHead>
              <TableHead className="text-right">History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((g) => (
              <TableRow key={g.email} className="hover:bg-surface-container transition-colors">
                <TableCell className="text-on-surface font-medium">{g.name}</TableCell>
                <TableCell>
                  <div className="flex flex-col text-label-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {g.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {g.phone}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-on-surface">{g.totalBookings}</TableCell>
                <TableCell className="text-on-surface">₹{g.totalSpent.toLocaleString('en-IN')}</TableCell>
                <TableCell className="text-on-surface-variant">
                  {g.lastStay ? formatDate(g.lastStay) : '—'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => setSelected(g)}>
                    <History className="h-4 w-4 mr-1" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-[560px] bg-surface-container-lowest">
          <DialogHeader>
            <DialogTitle className="text-headline-sm font-display text-on-surface">
              {selected?.name}
            </DialogTitle>
            <DialogDescription className="text-body-md font-sans text-on-surface-variant">
              {selected?.email} • {selected?.phone}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {selected?.bookings.map((b) => (
              <Link
                key={b.bookingNumber}
                href={`/admin/bookings/${encodeURIComponent(b.bookingNumber)}`}
                className="flex items-center justify-between p-3 rounded-md border border-outline-variant hover:bg-surface-container"
              >
                <div>
                  <p className="text-body-md font-sans font-medium text-on-surface">#{b.bookingNumber}</p>
                  <p className="text-label-sm font-sans text-on-surface-variant">
                    {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-body-md font-sans font-semibold text-on-surface">
                    ₹{b.amount.toLocaleString('en-IN')}
                  </span>
                  <Badge className={`${STATUS_BADGE[b.status]} text-label-sm font-sans`}>
                    {STATUS_LABEL[b.status]}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Made with Bob
