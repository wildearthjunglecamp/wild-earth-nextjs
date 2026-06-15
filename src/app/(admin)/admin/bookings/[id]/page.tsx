/**
 * Booking Detail Page
 * Comprehensive view of a single booking with all details and actions
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Tent,
  CreditCard,
  FileText,
  Edit,
  X,
  LogIn,
  LogOut,
  MoveRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Booking Details | Wild Earth Admin',
  description: 'View and manage booking details',
};

/**
 * Sample booking detail data
 */
const bookingDetails = {
  'WH-77342': {
    id: 'WH-77342',
    status: 'confirmed',
    createdAt: '2024-10-01T10:30:00Z',
    
    // Customer info
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 293-8472',
      address: '123 Oak Street, San Francisco, CA 94102',
      country: 'United States',
    },
    
    // Booking info
    checkIn: '2024-10-15',
    checkOut: '2024-10-18',
    nights: 3,
    guests: {
      adults: 2,
      children: 1,
      total: 3,
    },
    
    // Assigned tents
    tents: [
      {
        id: 'TENT-001',
        name: 'Big Jungle Tent',
        type: 'Premium',
        capacity: 4,
        pricePerNight: 2750,
      },
    ],
    
    // Add-ons
    addOns: [
      {
        id: 'ADDON-001',
        name: 'Campfire Experience',
        quantity: 1,
        price: 500,
      },
      {
        id: 'ADDON-002',
        name: 'Guided Nature Walk',
        quantity: 3,
        price: 1500,
      },
    ],
    
    // Payment info
    payment: {
      subtotal: 8250,
      addOnsTotal: 2000,
      tax: 1025,
      discount: 0,
      total: 11275,
      paid: 11275,
      pending: 0,
      method: 'Credit Card',
      transactionId: 'TXN-2024-10-001-4567',
      paidAt: '2024-10-01T10:35:00Z',
    },
    
    // Status timeline
    timeline: [
      {
        status: 'Booking Created',
        timestamp: '2024-10-01T10:30:00Z',
        user: 'System',
        icon: 'create',
      },
      {
        status: 'Payment Received',
        timestamp: '2024-10-01T10:35:00Z',
        user: 'Payment Gateway',
        icon: 'payment',
      },
      {
        status: 'Booking Confirmed',
        timestamp: '2024-10-01T10:36:00Z',
        user: 'Admin',
        icon: 'confirm',
      },
    ],
    
    // Special requests
    specialRequests: 'Please arrange for early check-in if possible. Celebrating anniversary.',
    
    // Notes
    internalNotes: 'VIP guest - previous customer with excellent history.',
  },
};

interface BookingDetailPageProps {
  params: {
    id: string;
  };
}

export default async function BookingDetailPage({ params }: BookingDetailPageProps) {
  await requireAdmin();
  
  const booking = bookingDetails[params.id as keyof typeof bookingDetails];
  
  if (!booking) {
    notFound();
  }

  /**
   * Get status badge
   */
  function getStatusBadge(status: string) {
    const styles = {
      confirmed: 'bg-primary text-on-primary',
      pending: 'bg-secondary-container text-on-secondary-container',
      'checked-in': 'bg-tertiary-container text-on-tertiary-container',
      'checked-out': 'bg-surface-container-high text-on-surface',
      cancelled: 'bg-error-container text-on-error-container',
    };

    return (
      <Badge className={`${styles[status as keyof typeof styles]} text-label-md font-sans px-4 py-1`}>
        ● {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }

  /**
   * Format date
   */
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /**
   * Format time
   */
  function formatTime(dateString: string) {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-headline-md font-display text-on-surface">
              Booking #{booking.id}
            </h1>
            {getStatusBadge(booking.status)}
          </div>
          <p className="text-body-md font-sans text-on-surface-variant mt-1">
            Created on {formatDate(booking.createdAt)} at {formatTime(booking.createdAt)}
          </p>
        </div>
        
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" className="font-display rounded-md">
            <FileText className="h-4 w-4 mr-2" />
            Generate PDF
          </Button>
          <Button variant="outline" className="font-display rounded-md">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {booking.status === 'confirmed' && (
            <Button className="bg-primary text-on-primary font-display rounded-md">
              <LogIn className="h-4 w-4 mr-2" />
              Check In
            </Button>
          )}
          {booking.status === 'checked-in' && (
            <Button className="bg-tertiary text-on-tertiary font-display rounded-md">
              <LogOut className="h-4 w-4 mr-2" />
              Check Out
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Main details */}
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
                  <p className="text-body-md font-sans text-on-surface font-medium">{booking.customer.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Email</p>
                  <p className="text-body-md font-sans text-on-surface">{booking.customer.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Phone</p>
                  <p className="text-body-md font-sans text-on-surface">{booking.customer.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Country</p>
                  <p className="text-body-md font-sans text-on-surface">{booking.customer.country}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-label-sm font-display text-on-surface-variant uppercase">Address</p>
                <p className="text-body-md font-sans text-on-surface">{booking.customer.address}</p>
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
                  <p className="text-label-sm font-sans text-on-surface-variant">After 2:00 PM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Check-out</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{formatDate(booking.checkOut)}</p>
                  <p className="text-label-sm font-sans text-on-surface-variant">Before 11:00 AM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Duration</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{booking.nights} Nights</p>
                </div>
              </div>
              <Separator className="bg-outline-variant" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Adults</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{booking.guests.adults}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Children</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{booking.guests.children}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-label-sm font-display text-on-surface-variant uppercase">Total Guests</p>
                  <p className="text-body-md font-sans text-on-surface font-medium">{booking.guests.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned Tents */}
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader>
              <CardTitle className="text-headline-sm font-display text-on-surface flex items-center gap-2">
                <Tent className="h-5 w-5 text-primary" />
                Assigned Accommodations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {booking.tents.map((tent) => (
                  <div
                    key={tent.id}
                    className="flex items-center justify-between p-4 bg-surface-container rounded-lg border border-outline-variant"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-body-md font-sans font-semibold text-on-surface">{tent.name}</p>
                        <Badge variant="secondary" className="text-label-sm font-sans bg-tertiary-container text-on-tertiary-container">
                          {tent.type}
                        </Badge>
                      </div>
                      <p className="text-label-sm font-sans text-on-surface-variant mt-1">
                        Capacity: {tent.capacity} guests • ID: {tent.id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-body-md font-sans font-semibold text-on-surface">
                        ₹{tent.pricePerNight.toLocaleString('en-IN')}
                      </p>
                      <p className="text-label-sm font-sans text-on-surface-variant">per night</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add-ons */}
          {booking.addOns.length > 0 && (
            <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
              <CardHeader>
                <CardTitle className="text-headline-sm font-display text-on-surface">Add-ons & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.addOns.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between p-3 bg-surface-container rounded-lg"
                    >
                      <div>
                        <p className="text-body-md font-sans font-medium text-on-surface">{addon.name}</p>
                        <p className="text-label-sm font-sans text-on-surface-variant">Quantity: {addon.quantity}</p>
                      </div>
                      <p className="text-body-md font-sans font-semibold text-on-surface">
                        ₹{addon.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Special Requests */}
          {booking.specialRequests && (
            <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
              <CardHeader>
                <CardTitle className="text-headline-sm font-display text-on-surface">Special Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-md font-sans text-on-surface">{booking.specialRequests}</p>
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          {booking.internalNotes && (
            <Card className="bg-tertiary-container/20 shadow-level-1 border-tertiary-container rounded-lg">
              <CardHeader>
                <CardTitle className="text-headline-sm font-display text-on-surface">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-md font-sans text-on-surface">{booking.internalNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Payment & Timeline */}
        <div className="space-y-6">
          {/* Payment Information */}
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader>
              <CardTitle className="text-headline-sm font-display text-on-surface flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-body-md font-sans">
                  <span className="text-on-surface-variant">Accommodation</span>
                  <span className="text-on-surface">₹{booking.payment.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-body-md font-sans">
                  <span className="text-on-surface-variant">Add-ons</span>
                  <span className="text-on-surface">₹{booking.payment.addOnsTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-body-md font-sans">
                  <span className="text-on-surface-variant">Tax (10%)</span>
                  <span className="text-on-surface">₹{booking.payment.tax.toLocaleString('en-IN')}</span>
                </div>
                {booking.payment.discount > 0 && (
                  <div className="flex justify-between text-body-md font-sans">
                    <span className="text-on-surface-variant">Discount</span>
                    <span className="text-error">-₹{booking.payment.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
              
              <Separator className="bg-outline-variant" />
              
              <div className="flex justify-between text-headline-sm font-display">
                <span className="text-on-surface">Total</span>
                <span className="text-on-surface">₹{booking.payment.total.toLocaleString('en-IN')}</span>
              </div>
              
              <Separator className="bg-outline-variant" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-body-md font-sans">
                  <span className="text-on-surface-variant">Paid</span>
                  <span className="text-primary font-semibold">₹{booking.payment.paid.toLocaleString('en-IN')}</span>
                </div>
                {booking.payment.pending > 0 && (
                  <div className="flex justify-between text-body-md font-sans">
                    <span className="text-on-surface-variant">Pending</span>
                    <span className="text-error font-semibold">₹{booking.payment.pending.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
              
              <Separator className="bg-outline-variant" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-label-sm font-sans">
                  <span className="text-on-surface-variant">Payment Method</span>
                  <span className="text-on-surface">{booking.payment.method}</span>
                </div>
                <div className="flex justify-between text-label-sm font-sans">
                  <span className="text-on-surface-variant">Transaction ID</span>
                  <span className="text-on-surface font-mono">{booking.payment.transactionId}</span>
                </div>
                <div className="flex justify-between text-label-sm font-sans">
                  <span className="text-on-surface-variant">Paid At</span>
                  <span className="text-on-surface">{formatTime(booking.payment.paidAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader>
              <CardTitle className="text-headline-sm font-display text-on-surface flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booking.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {event.icon === 'create' && <FileText className="h-4 w-4 text-primary" />}
                        {event.icon === 'payment' && <DollarSign className="h-4 w-4 text-primary" />}
                        {event.icon === 'confirm' && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      {index < booking.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-outline-variant mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-body-md font-sans font-medium text-on-surface">{event.status}</p>
                      <p className="text-label-sm font-sans text-on-surface-variant mt-1">
                        {formatDate(event.timestamp)} at {formatTime(event.timestamp)}
                      </p>
                      <p className="text-label-sm font-sans text-on-surface-variant">by {event.user}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader>
              <CardTitle className="text-headline-sm font-display text-on-surface">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start font-display rounded-md">
                <MoveRight className="h-4 w-4 mr-2" />
                Move Booking
              </Button>
              <Button variant="outline" className="w-full justify-start font-display rounded-md">
                <Mail className="h-4 w-4 mr-2" />
                Send Confirmation
              </Button>
              {booking.status !== 'cancelled' && (
                <Button variant="outline" className="w-full justify-start text-error hover:text-error font-display rounded-md">
                  <X className="h-4 w-4 mr-2" />
                  Cancel Booking
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Made with Bob