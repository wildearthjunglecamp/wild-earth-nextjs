'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Calendar, 
  Users, 
  Check, 
  ChevronLeft,
  Mail, 
  Phone, 
  User,
  Utensils,
  Coffee,
  Activity,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Shield,
  Lock,
  Award,
  TrendingUp,
  Clock,
  MapPin,
  Sparkles,
  ArrowRight,
  Home
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Separator } from '@/src/components/ui/separator';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Badge } from '@/src/components/ui/badge';
import { RazorpayButton } from '@/src/components/payment/razorpay-button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/src/components/ui/breadcrumb';

// TypeScript interfaces
interface SelectedTent {
  tentTypeId: string;
  tentTypeSlug: string;
  tentTypeName: string;
  capacity: number;
  basePrice: number;
  quantity: number;
}

interface BookingData {
  checkIn: string;
  checkOut: string;
  nights: number;
  selectedTents: SelectedTent[];
  totalGuests: number;
  totalPrice: number;
}

interface GuestDetails {
  fullName: string;
  phone: string;
  email: string;
}

interface AddOns {
  lunch: boolean;
  dinner: boolean;
}

interface FinalBooking {
  checkIn: string;
  checkOut: string;
  nights: number;
  selectedTents: SelectedTent[];
  totalGuests: number;
  totalPrice: number;
  guestDetails: GuestDetails;
  adults: number;
  children: number;
  addOns: AddOns;
  addOnsTotal: number;
  grandTotal: number;
}

const ADDON_PRICES = {
  lunch: 300,
  dinner: 400,
};

// Tax and fee percentages
const TAX_RATE = 0.0; // 18% GST
const PLATFORM_FEE_RATE = 0.0; // 2% platform fee

export default function CheckoutPage() {
  const router = useRouter();
  
  // State management
  const [bookingData, setBookingData] = useState<FinalBooking | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [bookingReference, setBookingReference] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Load booking data from localStorage
  useEffect(() => {
    const storedData = localStorage.getItem('finalBooking');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setBookingData(parsed);
      } catch (error) {
        console.error('Failed to parse booking data:', error);
        router.push('/booking');
      }
    } else {
      // No booking data, redirect to booking
      router.push('/booking');
    }
  }, [router]);

  // Calculate breakdown
  const calculateBreakdown = () => {
    if (!bookingData) return null;

    const accommodationSubtotal = bookingData.totalPrice;
    const addOnsSubtotal = bookingData.addOnsTotal;
    const subtotal = accommodationSubtotal + addOnsSubtotal;
    const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + platformFee + tax;

    return {
      accommodationSubtotal,
      addOnsSubtotal,
      subtotal,
      platformFee,
      tax,
      total,
    };
  };

  const breakdown = calculateBreakdown();

  // Generate booking reference
  const generateBookingReference = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    return `WE${timestamp}${random}`.toUpperCase();
  };

  // Handle payment success: persist the booking server-side. The payment has
  // already been verified by RazorpayButton; createBookingWithPayment re-verifies
  // the signature and creates the booking + payment records atomically.
  const handlePaymentSuccess = async (
    paymentId: string,
    orderId: string,
    signature: string
  ) => {
    if (!bookingData || !breakdown) return;

    // Show the processing overlay while we save the booking.
    setPaymentState('processing');

    const payload = {
      customerName: bookingData.guestDetails.fullName,
      customerEmail: bookingData.guestDetails.email,
      // Strip spaces/dashes so the phone matches the server's E.164-ish regex.
      customerPhone: bookingData.guestDetails.phone.replace(/[\s-]/g, ''),
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      tentItems: bookingData.selectedTents.map((tent) => ({
        tentTypeSlug: tent.tentTypeSlug,
        quantity: tent.quantity,
        pricePerNight: tent.basePrice,
      })),
      adults: bookingData.adults,
      children: bookingData.children,
      // Persist the amount actually charged (incl. platform fee + GST).
      totalAmount: breakdown.total,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    };

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        // Payment went through but the booking couldn't be saved. Keep the
        // booking data in localStorage and surface the payment ID for support.
        setPaymentState('error');
        setErrorMessage(
          `Your payment succeeded (Payment ID: ${paymentId}), but we couldn't confirm your booking: ${
            result.message || result.error || 'Unknown error'
          }. Please contact support with this Payment ID and do not pay again.`
        );
        return;
      }

      // Use the authoritative booking number returned by the server.
      const reference = result.data.bookingNumber;
      setBookingReference(reference);

      // Persist a confirmation summary for the success page. We render from
      // this (the browser already has the full booking) rather than re-reading
      // from the DB, which would require a public, enumerable booking-by-number
      // endpoint that could leak customer PII.
      const confirmedBooking = {
        bookingNumber: reference,
        paymentId,
        orderId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        nights: bookingData.nights,
        selectedTents: bookingData.selectedTents,
        adults: bookingData.adults,
        children: bookingData.children,
        guestDetails: bookingData.guestDetails,
        addOns: bookingData.addOns,
        total: breakdown.total,
      };

      // Clear funnel data now that the booking is confirmed.
      localStorage.removeItem('bookingData');
      localStorage.removeItem('finalBooking');

      // Store details for the success page.
      localStorage.setItem('confirmedBooking', JSON.stringify(confirmedBooking));
      localStorage.setItem('bookingReference', reference);
      localStorage.setItem('paymentId', paymentId);
      localStorage.setItem('orderId', orderId);

      setPaymentState('success');
    } catch (error: any) {
      setPaymentState('error');
      setErrorMessage(
        `Your payment succeeded (Payment ID: ${paymentId}), but we couldn't confirm your booking: ${
          error?.message || 'Network error'
        }. Please contact support with this Payment ID and do not pay again.`
      );
    }
  };

  // Handle payment error
  const handlePaymentError = (error: any) => {
    setPaymentState('error');
    setErrorMessage(error.message || 'Payment failed. Please try again.');
  };

  // Loading State Component
  const LoadingState = () => (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <CreditCard className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-xl font-semibold text-primary-900">
            Processing Payment
          </h3>
          <p className="font-body text-sm text-secondary-600">
            Please wait while we securely process your payment...
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-secondary-500">
          <Shield className="h-4 w-4" />
          <span>Secured by Razorpay</span>
        </div>
      </div>
    </div>
  );

  // Success State Component
  const SuccessState = () => (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-primary-200 shadow-level-3">
        <CardContent className="p-8 md:p-12 text-center space-y-6">
          {/* Success Animation */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-emerald-500 rounded-full w-24 h-24 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Success Message */}
          <div className="space-y-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-900">
              Booking Confirmed! 🎉
            </h1>
            <p className="font-body text-lg text-secondary-600">
              Your wilderness adventure awaits
            </p>
          </div>

          {/* Booking Reference */}
          <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6">
            <div className="text-sm font-body text-secondary-600 mb-2">
              Booking Reference Number
            </div>
            <div className="font-display text-2xl font-bold text-primary-900 tracking-wider">
              {bookingReference}
            </div>
          </div>

          {/* Confirmation Details */}
          <Alert className="bg-blue-50 border-blue-200">
            <Mail className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              A confirmation email has been sent to <strong>{bookingData?.guestDetails.email}</strong> with your booking details and payment receipt.
            </AlertDescription>
          </Alert>

          {/* Quick Summary */}
          {bookingData && (
            <div className="bg-surface-50 rounded-lg p-6 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-secondary-600">Check-in</span>
                <span className="font-body text-sm font-medium text-primary-900">
                  {format(new Date(bookingData.checkIn), 'MMM dd, yyyy')}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-secondary-600">Check-out</span>
                <span className="font-body text-sm font-medium text-primary-900">
                  {format(new Date(bookingData.checkOut), 'MMM dd, yyyy')}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-secondary-600">Total Guests</span>
                <span className="font-body text-sm font-medium text-primary-900">
                  {bookingData.totalGuests} guests
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => router.push('/booking-success')}
              className="flex-1 p-3 bg-primary-600 hover:bg-primary-700 text-white"
              size="lg"
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              View Booking Details
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1 p-3 border-primary-300 text-primary-700 hover:bg-primary-50"
              size="lg"
            >
              <Home className="h-5 w-5 mr-2" />
              Return to Home
            </Button>
          </div>

          {/* Additional Info */}
          <div className="pt-4 border-t border-surface-200">
            <p className="font-body text-xs text-secondary-500">
              Need help? Contact us at <a href="tel:+919876543210" className="text-primary-600 hover:underline">+91 98765 43210</a> or <a href="mailto:support@wildearth.com" className="text-primary-600 hover:underline">support@wildearth.com</a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Booking Summary Component
  const BookingSummaryCard = () => {
    if (!bookingData) return null;

    return (
      <Card className="border-surface-200 shadow-level-2">
        <CardHeader className="bg-primary-50 border-b border-primary-100">
          <CardTitle className="font-display text-xl text-primary-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Booking Summary
          </CardTitle>
          <CardDescription className="font-body">
            Review your reservation details
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Guest Information */}
          <div className="space-y-3">
            <h3 className="font-body font-semibold text-sm text-secondary-700 uppercase tracking-wide">
              Guest Information
            </h3>
            <div className="bg-surface-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-secondary-500" />
                <div>
                  <div className="font-body text-xs text-secondary-600">Full Name</div>
                  <div className="font-body text-sm font-medium text-primary-900">
                    {bookingData.guestDetails.fullName}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-secondary-500" />
                <div>
                  <div className="font-body text-xs text-secondary-600">Email</div>
                  <div className="font-body text-sm font-medium text-primary-900">
                    {bookingData.guestDetails.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-secondary-500" />
                <div>
                  <div className="font-body text-xs text-secondary-600">Phone</div>
                  <div className="font-body text-sm font-medium text-primary-900">
                    {bookingData.guestDetails.phone}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Stay Details */}
          <div className="space-y-3">
            <h3 className="font-body font-semibold text-sm text-secondary-700 uppercase tracking-wide">
              Stay Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-secondary-600">Check-in</span>
                <span className="font-body text-sm font-medium text-primary-900">
                  {format(new Date(bookingData.checkIn), 'EEE, MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-secondary-600">Check-out</span>
                <span className="font-body text-sm font-medium text-primary-900">
                  {format(new Date(bookingData.checkOut), 'EEE, MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-secondary-600">Duration</span>
                <Badge variant="secondary" className="font-body">
                  {bookingData.nights} {bookingData.nights === 1 ? 'night' : 'nights'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-secondary-600">Total Guests</span>
                <span className="font-body text-sm font-medium text-primary-900 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {bookingData.totalGuests}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Accommodations */}
          <div className="space-y-3">
            <h3 className="font-body font-semibold text-sm text-secondary-700 uppercase tracking-wide">
              Selected Accommodations
            </h3>
            <div className="space-y-3">
              {bookingData.selectedTents.map((tent) => (
                <div key={tent.tentTypeId} className="bg-primary-50 rounded-lg p-4 border border-primary-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-body text-sm font-semibold text-primary-900">
                        {tent.tentTypeName}
                      </div>
                      <div className="font-body text-xs text-secondary-600">
                        Capacity: {tent.capacity} guests per tent
                      </div>
                    </div>
                    <Badge className="bg-primary-600 text-white">
                      × {tent.quantity}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-body text-secondary-600">
                      ₹{tent.basePrice.toLocaleString()} × {tent.quantity} × {bookingData.nights} nights
                    </span>
                    <span className="font-body font-semibold text-primary-900">
                      ₹{(tent.basePrice * tent.quantity * bookingData.nights).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          {(bookingData.addOns.lunch || bookingData.addOns.dinner) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-body font-semibold text-sm text-secondary-700 uppercase tracking-wide">
                  Selected Add-ons
                </h3>
                <div className="space-y-2">
                  {bookingData.addOns.lunch && (
                    <div className="flex items-center justify-between bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-amber-600" />
                        <span className="font-body text-sm text-primary-900">Lunch</span>
                      </div>
                      <span className="font-body text-sm font-medium text-primary-900">
                        ₹{(ADDON_PRICES.lunch * bookingData.totalGuests * bookingData.nights).toLocaleString()}
                      </span>
                    </div>
                  )}
                  {bookingData.addOns.dinner && (
                    <div className="flex items-center justify-between bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-orange-600" />
                        <span className="font-body text-sm text-primary-900">Dinner</span>
                      </div>
                      <span className="font-body text-sm font-medium text-primary-900">
                        ₹{(ADDON_PRICES.dinner * bookingData.totalGuests * bookingData.nights).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Included Items */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="font-body text-sm font-semibold text-emerald-900">
                Included in Your Stay
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-emerald-800">
                <Coffee className="h-3 w-3" />
                <span>Breakfast</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-800">
                <Coffee className="h-3 w-3" />
                <span>Evening Snacks</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-800">
                <Activity className="h-3 w-3" />
                <span>All Activities</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-800">
                <MapPin className="h-3 w-3" />
                <span>Guided Tours</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Payment Breakdown Component
  const PaymentBreakdownCard = () => {
    if (!bookingData || !breakdown) return null;

    return (
      <Card className="border-surface-200 shadow-level-2">
        <CardHeader className="bg-surface-50 border-b border-surface-200">
          <CardTitle className="font-display text-xl text-primary-900 flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Breakdown
          </CardTitle>
          <CardDescription className="font-body">
            Detailed cost breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Accommodation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-body text-sm text-secondary-600">Accommodation</span>
              <span className="font-body text-sm font-medium text-primary-900">
                ₹{breakdown.accommodationSubtotal.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-secondary-500 pl-4">
              {bookingData.selectedTents.map((tent) => (
                <div key={tent.tentTypeId} className="flex justify-between">
                  <span>{tent.tentTypeName} × {tent.quantity}</span>
                  <span>₹{(tent.basePrice * tent.quantity * bookingData.nights).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          {breakdown.addOnsSubtotal > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-secondary-600">Add-ons</span>
                <span className="font-body text-sm font-medium text-primary-900">
                  ₹{breakdown.addOnsSubtotal.toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-secondary-500 pl-4">
                {bookingData.addOns.lunch && (
                  <div className="flex justify-between">
                    <span>Lunch</span>
                    <span>₹{(ADDON_PRICES.lunch * bookingData.totalGuests * bookingData.nights).toLocaleString()}</span>
                  </div>
                )}
                {bookingData.addOns.dinner && (
                  <div className="flex justify-between">
                    <span>Dinner</span>
                    <span>₹{(ADDON_PRICES.dinner * bookingData.totalGuests * bookingData.nights).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm font-medium text-secondary-700">Subtotal</span>
            <span className="font-body text-sm font-semibold text-primary-900">
              ₹{breakdown.subtotal.toLocaleString()}
            </span>
          </div>

          {/* Platform Fee */}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-secondary-600">
              Platform Fee <span className="text-xs">(Free)</span>
            </span>
            <span className="font-body text-sm font-medium text-primary-900">
              ₹{breakdown.platformFee.toLocaleString()}
            </span>
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between">
            <span className="font-body text-sm text-secondary-600">
              GST <span className="text-xs">(Included)</span>
            </span>
            <span className="font-body text-sm font-medium text-primary-900">
              ₹{breakdown.tax.toLocaleString()}
            </span>
          </div>

          <Separator className="my-4" />

          {/* Total */}
          <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-primary-900">
                Total Amount
              </span>
              <span className="font-display text-2xl font-bold text-primary-600">
                ₹{breakdown.total.toLocaleString()}
              </span>
            </div>
            <p className="font-body text-xs text-secondary-600 mt-2">
              All taxes and fees included
            </p>
          </div>

          {/* Security Badges */}
          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-secondary-600">
              <Shield className="h-4 w-4 text-blue-600" />
              <span>Secured by 256-bit SSL encryption</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-secondary-600">
              <Lock className="h-4 w-4 text-blue-600" />
              <span>PCI DSS compliant payment processing</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-secondary-600">
              <Award className="h-4 w-4 text-blue-600" />
              <span>100% secure payment guarantee</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Security Badges Component
  const SecurityBadges = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="font-body font-semibold text-blue-900">
          Your Payment is Secure
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Lock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-body text-sm font-medium text-blue-900">SSL Encrypted</div>
            <div className="font-body text-xs text-blue-700">Bank-grade security</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Shield className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-body text-sm font-medium text-blue-900">PCI Compliant</div>
            <div className="font-body text-xs text-blue-700">Industry standard</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2">
            <Award className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-body text-sm font-medium text-blue-900">Verified</div>
            <div className="font-body text-xs text-blue-700">Trusted platform</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Trust Indicators Component
  const TrustIndicators = () => (
    <div className="bg-surface-50 rounded-lg p-6 space-y-4">
      <h3 className="font-body font-semibold text-sm text-secondary-700 uppercase tracking-wide">
        Why Book With Us
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <div className="bg-emerald-100 rounded-full p-2 mt-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <div className="font-body text-sm font-medium text-primary-900">Instant Confirmation</div>
            <div className="font-body text-xs text-secondary-600">Get booking confirmation immediately</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 rounded-full p-2 mt-1">
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-body text-sm font-medium text-primary-900">24/7 Support</div>
            <div className="font-body text-xs text-secondary-600">We're here to help anytime</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 rounded-full p-2 mt-1">
            <Award className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <div className="font-body text-sm font-medium text-primary-900">Best Price Guarantee</div>
            <div className="font-body text-xs text-secondary-600">Lowest rates guaranteed</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="bg-purple-100 rounded-full p-2 mt-1">
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="font-body text-sm font-medium text-primary-900">Premium Experience</div>
            <div className="font-body text-xs text-secondary-600">Luxury wilderness camping</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Social Proof Component
  const SocialProof = () => (
    <Alert className="bg-emerald-50 border-emerald-200">
      <TrendingUp className="h-4 w-4 text-emerald-600" />
      <AlertDescription className="text-emerald-900">
        <strong>127 bookings</strong> made in the last 7 days. Join hundreds of happy campers!
      </AlertDescription>
    </Alert>
  );

  // Show success state
  if (paymentState === 'success') {
    return <SuccessState />;
  }

  // Show loading state
  if (paymentState === 'processing') {
    return <LoadingState />;
  }

  // Main checkout UI
  if (!bookingData || !breakdown) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-surface-50 via-white to-primary-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-surface-200">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="font-body text-sm">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/availability" className="font-body text-sm">Availability</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/booking" className="font-body text-sm">Booking</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-body text-sm font-medium">Checkout</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-900 mb-2">
            Complete Your Booking
          </h1>
          <p className="font-body text-lg text-secondary-600">
            You're just one step away from your wilderness adventure
          </p>
        </div>

        {/* Social Proof */}
        <div className="max-w-4xl mx-auto mb-8">
          <SocialProof />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Summary & Breakdown */}
          <div className="lg:col-span-2 space-y-6">
            <BookingSummaryCard />
            <PaymentBreakdownCard />
            <TrustIndicators />
          </div>

          {/* Right Column - Payment */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Payment Card */}
              <Card className="border-primary-200 shadow-level-3">
                <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Secure Payment
                  </CardTitle>
                  <CardDescription className="text-primary-100">
                    Complete your reservation
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Amount Display */}
                  <div className="text-center py-6 bg-primary-50 rounded-lg border-2 border-primary-200">
                    <div className="font-body text-sm text-secondary-600 mb-2">
                      Total Amount to Pay
                    </div>
                    <div className="font-display text-4xl font-bold text-primary-600">
                      ₹{breakdown.total.toLocaleString()}
                    </div>
                    <div className="font-body text-xs text-secondary-500 mt-2">
                      All taxes and fees included
                    </div>
                  </div>

                  {/* Terms and Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        className="mt-1"
                      />
                      <label
                        htmlFor="terms"
                        className="font-body text-sm text-secondary-700 leading-relaxed cursor-pointer"
                      >
                        I agree to the{' '}
                        <a href="/terms" className="text-primary-600 hover:underline font-medium">
                          Terms & Conditions
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-primary-600 hover:underline font-medium">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Cancellation Policy */}
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Cancellation Policy:</strong>Call us at 
                        <a href="tel:+919876543210" className="text-primary-600 hover:underline font-medium">
                         +91 98765 43210
                      </a>
                      </AlertDescription>
                    </Alert>
                  </div>

                  {/* Error Message */}
                  {paymentState === 'error' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {errorMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Payment Button */}
                  <RazorpayButton
                    amount={breakdown.total}
                    bookingDetails={{
                      id: generateBookingReference(),
                      customerName: bookingData.guestDetails.fullName,
                      customerEmail: bookingData.guestDetails.email,
                      customerPhone: bookingData.guestDetails.phone,
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    disabled={!termsAccepted}
                    className="w-full h-14 text-lg font-semibold bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl transition-all"
                  />

                  {/* Back Button */}
                  <Button
                    onClick={() => router.push('/booking')}
                    variant="outline"
                    className="w-full border-surface-300 text-secondary-700 hover:bg-surface-50"
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Booking
                  </Button>

                  {/* Help Text */}
                  <div className="text-center pt-4 border-t border-surface-200">
                    <p className="font-body text-xs text-secondary-500">
                      Need help? Call us at{' '}
                      <a href="tel:+919876543210" className="text-primary-600 hover:underline font-medium">
                        +91 98765 43210
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Security Badges */}
              <SecurityBadges />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
