'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  CheckCircle2,
  Calendar,
  Users,
  Tent,
  CreditCard,
  Mail,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Separator } from '../../../components/ui/separator';

interface ConfirmedTent {
  tentTypeId: string;
  tentTypeSlug: string;
  tentTypeName: string;
  capacity: number;
  basePrice: number;
  quantity: number;
}

interface ConfirmedBooking {
  bookingNumber: string;
  paymentId: string;
  orderId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  selectedTents: ConfirmedTent[];
  adults: number;
  children: number;
  guestDetails: { fullName: string; phone: string; email: string };
  addOns: { lunch: boolean; dinner: boolean };
  total: number;
}

// Safely format a YYYY-MM-DD string; falls back to the raw value if invalid.
function formatDate(value: string): string {
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : format(date, 'EEE, MMM dd, yyyy');
}

export default function BookingSuccessPage() {
  const [booking, setBooking] = useState<ConfirmedBooking | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('confirmedBooking');
    if (stored) {
      try {
        setBooking(JSON.parse(stored));
      } catch {
        setBooking(null);
      }
    }
    setLoaded(true);
  }, []);

  // Generic fallback: no confirmation data in this browser (e.g. opened
  // directly or after the data was cleared).
  if (loaded && !booking) {
    return (
      <div className="min-h-screen pt-20">
        <section className="py-20">
          <div className="container max-w-2xl text-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Booking Confirmed!</h1>
            <p className="text-xl mb-8 text-muted-foreground">
              Thank you for choosing Wild Earth Jungle Camp. We've sent a
              confirmation email with all the details.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">Return Home</Button>
              </Link>
              <Link href="/gallery">
                <Button>View Gallery</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!booking) {
    // Brief loading state while reading localStorage.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  const totalGuests = booking.adults + booking.children;

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-primary-50 via-white to-emerald-50">
      <section className="py-12 md:py-16">
        <div className="container max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-20 h-20 mb-4">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75" />
              <div className="relative bg-emerald-500 rounded-full w-20 h-20 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-900 mb-2">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-lg text-secondary-600">
              Your wilderness adventure awaits.
            </p>
          </div>

          {/* Reference */}
          <Card className="border-primary-200 shadow-level-2 mb-6">
            <CardContent className="p-6 text-center">
              <div className="text-sm text-secondary-600 mb-1">
                Booking Reference
              </div>
              <div className="text-2xl font-bold text-primary-900 tracking-wider">
                {booking.bookingNumber}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card className="border-surface-200 shadow-level-1">
            <CardHeader>
              <CardTitle className="text-xl text-primary-900 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Check-in</span>
                <span className="font-medium text-primary-900">
                  {formatDate(booking.checkIn)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Check-out</span>
                <span className="font-medium text-primary-900">
                  {formatDate(booking.checkOut)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600">Duration</span>
                <span className="font-medium text-primary-900">
                  {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-secondary-600 flex items-center gap-1">
                  <Users className="h-4 w-4" /> Guests
                </span>
                <span className="font-medium text-primary-900">
                  {booking.adults} adult{booking.adults === 1 ? '' : 's'}
                  {booking.children > 0
                    ? `, ${booking.children} child${booking.children === 1 ? '' : 'ren'} (under 5)`
                    : ''}{' '}
                  ({totalGuests} total)
                </span>
              </div>

              <Separator />

              {/* Tents */}
              <div className="space-y-2">
                <div className="text-sm font-semibold text-secondary-700 flex items-center gap-1">
                  <Tent className="h-4 w-4" /> Tents
                </div>
                {booking.selectedTents.map((tent) => (
                  <div
                    key={tent.tentTypeId}
                    className="flex justify-between text-sm pl-5"
                  >
                    <span className="text-secondary-600">
                      {tent.tentTypeName} × {tent.quantity}
                    </span>
                    <span className="font-medium text-primary-900">
                      ₹{(tent.basePrice * tent.quantity * booking.nights).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-primary-900">Total Paid</span>
                <span className="text-2xl font-bold text-primary-600">
                  ₹{booking.total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-secondary-500">
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3" /> Payment ID
                </span>
                <span>{booking.paymentId}</span>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 flex items-start gap-2">
                <Mail className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-900">
                  A confirmation has been sent to{' '}
                  <strong>{booking.guestDetails.email}</strong>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Return Home
              </Button>
            </Link>
            <Link href="/gallery" className="flex-1">
              <Button className="w-full">View Gallery</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Made with Bob
