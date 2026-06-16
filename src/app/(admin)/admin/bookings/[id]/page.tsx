/**
 * Booking Detail Page
 * Real view of a single booking. [id] is the booking_number.
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  User,
  Calendar,
  Tent,
  CreditCard,
} from 'lucide-react';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import {
  getBookingByNumber,
  mapBookingStatusToUi,
} from '@/src/services/booking.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Separator } from '@/src/components/ui/separator';
import { BookingActions } from '@/src/components/admin/BookingActions';

export const metadata: Metadata = {
  title: 'Booking Details | Wild Earth Admin',
  description: 'View and manage booking details',
};

export const dynamic = 'force-dynamic';

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-primary text-on-primary',
  pending: 'bg-secondary-container text-on-secondary-container',
  'checked-in': 'bg-tertiary-container text-on-tertiary-container',
  'checked-out': 'bg-surface-container-high text-on-surface',
  cancelled: 'bg-error-container text-on-error-container',
  'no-show': 'bg-error-container text-on-error-container',
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
  cancelled: 'Cancelled',
  'no-show': 'No Show',
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

interface BookingDetailPageProps {
  params: { id: string };
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  await requireAdmin();

  const result = await getBookingByNumber(decodeURIComponent(params.id));
  if (!result.success || !result.data) {
    notFound();
  }

  const booking = result.data;
  const uiStatus = mapBookingStatusToUi(booking.bookingStatus);
  const totalGuests = booking.adults + booking.children;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-md font-display text-on-surface">
              Booking #{booking.bookingNumber}
            </h1>
            <Badge className={`${STATUS_BADGE[uiStatus]} text-label-md font-sans px-4 py-1`}>
              ● {STATUS_LABEL[uiStatus]}
            </Badge>
          </div>
          <p className="text-body-md font-sans text-on-surface-variant mt-1">
            Created on {formatDate(booking.createdAt)}
          </p>
        </div>

        {/* Status actions */}
        <BookingActions bookingNumber={booking.bookingNumber} status={uiStatus} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader>
              <CardTitle className="text-headline-sm font-display text-on-surface flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Full Name</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{booking.customerName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Email</p>
                  <p className="text-body-md font-sans text-on-surface">{booking.customerEmail}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Phone</p>
                  <p className="text-body-md font-sans text-on-surface">{booking.customerPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Information */}
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader>
              <CardTitle className="text-headline-sm font-display text-on-surface flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Check-in</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{formatDate(booking.checkIn)}</p>
                  <p className="text-label-sm font-sans text-on-surface-variant">After 1:00 PM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Check-out</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{formatDate(booking.checkOut)}</p>
                  <p className="text-label-sm font-sans text-on-surface-variant">Before 11:00 AM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Duration</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">
                    {booking.nights} {booking.nights === 1 ? 'Night' : 'Nights'}
                  </p>
                </div>
              </div>
              <Separator className="bg-outline-variant" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Adults</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{booking.adults}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Children (under 5)</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{booking.children}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Total Guests</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{totalGuests}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Accommodations */}
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader>
              <CardTitle className="text-headline-sm font-display text-on-surface flex items-center gap-2">
                <Tent className="h-5 w-5 text-primary" />
                Assigned Accommodations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {booking.tentTypes.map((tt) => (
                  <div
                    key={tt.tentTypeSlug}
                    className="flex items-center justify-between p-4 bg-surface-container rounded-lg border border-outline-variant"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-body-md font-sans font-semibold text-on-surface">{tt.tentTypeName}</p>
                        <Badge variant="secondary" className="text-label-sm font-sans bg-tertiary-container text-on-tertiary-container">
                          × {tt.quantity}
                        </Badge>
                      </div>
                      <p className="text-label-sm font-sans text-on-surface-variant mt-1">
                        Tents: {tt.assignedTents.map((t) => t.tentNumber).join(', ') || '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-body-md font-sans font-semibold text-on-surface">
                        ₹{tt.pricePerNight.toLocaleString('en-IN')}
                      </p>
                      <p className="text-label-sm font-sans text-on-surface-variant">per night</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column - Payment */}
        <div className="space-y-6">
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader>
              <CardTitle className="text-headline-sm font-display text-on-surface flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-headline-sm font-display">
                <span className="text-on-surface">Total Paid</span>
                <span className="text-on-surface">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>

              <Separator className="bg-outline-variant" />

              <div className="space-y-2">
                <div className="flex justify-between text-label-sm font-sans">
                  <span className="text-on-surface-variant">Payment Status</span>
                  <span className="text-on-surface capitalize">{booking.paymentStatus}</span>
                </div>
                <div className="flex justify-between text-label-sm font-sans">
                  <span className="text-on-surface-variant">Payment Method</span>
                  <span className="text-on-surface">Razorpay</span>
                </div>
                <div className="flex justify-between text-label-sm font-sans gap-2">
                  <span className="text-on-surface-variant flex-shrink-0">Payment ID</span>
                  <span className="text-on-surface font-mono text-right break-all">
                    {booking.paymentDetails.razorpayPaymentId}
                  </span>
                </div>
                <div className="flex justify-between text-label-sm font-sans gap-2">
                  <span className="text-on-surface-variant flex-shrink-0">Order ID</span>
                  <span className="text-on-surface font-mono text-right break-all">
                    {booking.paymentDetails.razorpayOrderId}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
