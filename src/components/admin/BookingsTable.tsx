/**
 * Bookings Table Component
 * Displays bookings in a table with actions
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  MoveRight,
  X,
  LogIn,
  LogOut,
  FileText,
  MoreVertical,
  Users,
} from 'lucide-react';

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  tentType: string;
  guests: number;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  status: 'confirmed' | 'pending' | 'checked-in' | 'checked-out' | 'cancelled';
  email: string;
}

interface BookingsTableProps {
  bookings: Booking[];
}

/**
 * Get status badge styling
 */
function getStatusBadge(status: Booking['status']) {
  const styles = {
    confirmed: 'bg-primary text-on-primary',
    pending: 'bg-secondary-container text-on-secondary-container',
    'checked-in': 'bg-tertiary-container text-on-tertiary-container',
    'checked-out': 'bg-surface-container-high text-on-surface',
    cancelled: 'bg-error-container text-on-error-container',
  };

  const labels = {
    confirmed: 'Confirmed',
    pending: 'Pending',
    'checked-in': 'Checked In',
    'checked-out': 'Checked Out',
    cancelled: 'Cancelled',
  };

  return (
    <Badge className={`${styles[status]} text-label-sm font-sans`}>
      ● {labels[status]}
    </Badge>
  );
}

/**
 * Format date for display
 */
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  const handleAction = (action: string, bookingId: string) => {
    console.log(`Action: ${action} for booking: ${bookingId}`);
    // TODO: Implement actual actions
  };

  return (
    <div className="bg-surface-container-lowest shadow-level-1 border border-outline-variant rounded-lg overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-container border-b border-outline-variant">
            <tr>
              <th className="px-6 py-4 text-left text-label-md font-display text-on-surface-variant uppercase">
                Booking ID
              </th>
              <th className="px-6 py-4 text-left text-label-md font-display text-on-surface-variant uppercase">
                Customer Info
              </th>
              <th className="px-6 py-4 text-left text-label-md font-display text-on-surface-variant uppercase">
                Accommodation
              </th>
              <th className="px-6 py-4 text-left text-label-md font-display text-on-surface-variant uppercase">
                Guests
              </th>
              <th className="px-6 py-4 text-left text-label-md font-display text-on-surface-variant uppercase">
                Dates
              </th>
              <th className="px-6 py-4 text-left text-label-md font-display text-on-surface-variant uppercase">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-label-md font-display text-on-surface-variant uppercase">
                Status
              </th>
              <th className="px-6 py-4 text-right text-label-md font-display text-on-surface-variant uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="hover:bg-surface-container transition-colors"
              >
                {/* Booking ID */}
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="text-body-md font-sans font-semibold text-primary hover:text-primary-container"
                  >
                    #{booking.id}
                  </Link>
                </td>

                {/* Customer Info */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-body-md font-sans font-medium text-on-surface">
                      {booking.customerName}
                    </span>
                    <span className="text-label-sm font-sans text-on-surface-variant">
                      {booking.phone}
                    </span>
                  </div>
                </td>

                {/* Accommodation */}
                <td className="px-6 py-4">
                  <Badge variant="secondary" className="text-label-sm font-sans bg-tertiary-container text-on-tertiary-container">
                    {booking.tentType}
                  </Badge>
                </td>

                {/* Guests */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-body-md font-sans text-on-surface">
                    <Users className="h-4 w-4 text-on-surface-variant" />
                    {booking.guests}
                  </div>
                </td>

                {/* Dates */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-body-md font-sans text-on-surface">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </span>
                    <span className="text-label-sm font-sans text-on-surface-variant">
                      {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                    </span>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4">
                  <span className="text-body-md font-sans font-semibold text-on-surface">
                    ₹{booking.amount.toLocaleString('en-IN')}
                  </span>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  {getStatusBadge(booking.status)}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel className="font-display">Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <Link href={`/admin/bookings/${booking.id}`}>
                        <DropdownMenuItem className="cursor-pointer font-sans">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </Link>
                      
                      <DropdownMenuItem
                        onClick={() => handleAction('edit', booking.id)}
                        className="cursor-pointer font-sans"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Booking
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        onClick={() => handleAction('move', booking.id)}
                        className="cursor-pointer font-sans"
                      >
                        <MoveRight className="mr-2 h-4 w-4" />
                        Move Booking
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {booking.status === 'confirmed' && (
                        <DropdownMenuItem
                          onClick={() => handleAction('check-in', booking.id)}
                          className="cursor-pointer font-sans"
                        >
                          <LogIn className="mr-2 h-4 w-4" />
                          Check In
                        </DropdownMenuItem>
                      )}
                      
                      {booking.status === 'checked-in' && (
                        <DropdownMenuItem
                          onClick={() => handleAction('check-out', booking.id)}
                          className="cursor-pointer font-sans"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Check Out
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem
                        onClick={() => handleAction('pdf', booking.id)}
                        className="cursor-pointer font-sans"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Generate PDF
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      
                      {booking.status !== 'cancelled' && booking.status !== 'checked-out' && (
                        <DropdownMenuItem
                          onClick={() => handleAction('cancel', booking.id)}
                          className="cursor-pointer text-error focus:text-error font-sans"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel Booking
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Made with Bob