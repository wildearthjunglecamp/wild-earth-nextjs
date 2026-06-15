'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Calendar, 
  Users, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Phone, 
  User,
  Utensils,
  Coffee,
  Activity,
  CreditCard,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Checkbox } from '@/src/components/ui/checkbox';
import { Separator } from '@/src/components/ui/separator';
import { Alert, AlertDescription } from '@/src/components/ui/alert';

// TypeScript interfaces
interface SelectedTent {
  tentTypeId: string;
  tentTypeSlug: string;
  tentTypeName: string;
  capacity: number;
  basePrice: number;
  quantity: number;
}

// Children under 5 don't count against a tent's (adult) capacity; each tent
// can additionally hold up to this many young children.
const CHILDREN_PER_TENT = 2;

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

const ADDON_PRICES = {
  lunch: 300,
  dinner: 400,
};

export default function BookingPage() {
  const router = useRouter();
  
  // Booking data from availability page
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  
  // Current step (1-5)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Guest details
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    fullName: '',
    phone: '',
    email: '',
  });

  // Guest details validation errors
  const [guestErrors, setGuestErrors] = useState<Partial<GuestDetails>>({});

  // Guest split: adults (age 5+) and young children (under 5).
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [guestCountError, setGuestCountError] = useState<string | null>(null);
  
  // Add-ons selection
  const [addOns, setAddOns] = useState<AddOns>({
    lunch: false,
    dinner: false,
  });
  
  // Loading state
  const [isProcessing, setIsProcessing] = useState(false);

  // Load booking data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('bookingData');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setBookingData(parsed);
      } catch (error) {
        console.error('Failed to parse booking data:', error);
        router.push('/availability');
      }
    } else {
      // No booking data, redirect to availability
      router.push('/availability');
    }
  }, [router]);

  // Validate guest details
  const validateGuestDetails = (): boolean => {
    const errors: Partial<GuestDetails> = {};
    
    if (!guestDetails.fullName || guestDetails.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!guestDetails.phone || !/^\+?[\d\s-]{10,}$/.test(guestDetails.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!guestDetails.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestDetails.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    setGuestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Calculate add-ons total
  const calculateAddOnsTotal = () => {
    if (!bookingData) return 0;
    
    let total = 0;
    const { totalGuests, nights } = bookingData;
    
    if (addOns.lunch) {
      total += ADDON_PRICES.lunch * totalGuests * nights;
    }
    
    if (addOns.dinner) {
      total += ADDON_PRICES.dinner * totalGuests * nights;
    }
    
    return total;
  };

  // Calculate grand total
  const calculateGrandTotal = () => {
    if (!bookingData) return 0;
    return bookingData.totalPrice + calculateAddOnsTotal();
  };

  // Capacity limits derived from the selected tents.
  // Adults fill each tent's stated capacity; children (under 5) get
  // CHILDREN_PER_TENT extra slots per tent, on top of capacity.
  const getCapacityLimits = () => {
    const tents = bookingData?.selectedTents ?? [];
    const adultCapacity = tents.reduce(
      (sum, tent) => sum + tent.capacity * tent.quantity,
      0
    );
    const totalTents = tents.reduce((sum, tent) => sum + tent.quantity, 0);
    return { adultCapacity, childCapacity: totalTents * CHILDREN_PER_TENT };
  };

  // Validate the adults/children split against tent capacity.
  const validateGuestCounts = (): boolean => {
    const { adultCapacity, childCapacity } = getCapacityLimits();

    if (adults < 1) {
      setGuestCountError('At least one adult is required.');
      return false;
    }
    if (adults > adultCapacity) {
      setGuestCountError(
        `Your selected tents hold up to ${adultCapacity} adults. Add more tents or reduce the count.`
      );
      return false;
    }
    if (children > childCapacity) {
      setGuestCountError(
        `Your selected tents allow up to ${childCapacity} children under 5 (${CHILDREN_PER_TENT} per tent).`
      );
      return false;
    }

    setGuestCountError(null);
    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep === 2) {
      // Validate guest details and guest counts before proceeding
      const detailsValid = validateGuestDetails();
      const countsValid = validateGuestCounts();
      if (!detailsValid || !countsValid) {
        return;
      }
    }
    
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle payment
  const handleProceedToPayment = () => {
    setIsProcessing(true);
    
    // Prepare final booking object
    const finalBooking = {
      ...bookingData,
      guestDetails,
      adults,
      children,
      addOns,
      addOnsTotal: calculateAddOnsTotal(),
      grandTotal: calculateGrandTotal(),
    };
    
    // Store in localStorage for checkout page
    localStorage.setItem('finalBooking', JSON.stringify(finalBooking));
    
    // Navigate to checkout page
    router.push('/checkout');
  };

  // Step indicator component
  const StepIndicator = () => {
    const steps = [
      { number: 1, label: 'Booking Details' },
      { number: 2, label: 'Guest Info' },
      { number: 3, label: 'Add-ons' },
      { number: 4, label: 'Review' },
      { number: 5, label: 'Payment' },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep > step.number
                      ? 'bg-primary-600 text-white'
                      : currentStep === step.number
                      ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                      : 'bg-surface-200 text-secondary-500'
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium hidden sm:block ${
                    currentStep >= step.number ? 'text-primary-900' : 'text-secondary-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-all ${
                    currentStep > step.number ? 'bg-primary-600' : 'bg-surface-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Booking summary panel component
  const BookingSummary = () => {
    if (!bookingData) return null;

    return (
      <Card className="border-surface-200 shadow-level-2 sticky top-4">
        <CardHeader className="bg-primary-50">
          <CardTitle className="font-display text-xl text-primary-900">
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Dates */}
          <div>
            <div className="flex items-center gap-2 text-sm text-secondary-600 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="font-body font-medium">Stay Dates</span>
            </div>
            <div className="font-body text-sm text-primary-900">
              {format(new Date(bookingData.checkIn), 'MMM dd, yyyy')} - {format(new Date(bookingData.checkOut), 'MMM dd, yyyy')}
            </div>
            <div className="font-body text-xs text-secondary-600">
              {bookingData.nights} {bookingData.nights === 1 ? 'night' : 'nights'}
            </div>
          </div>

          <Separator />

          {/* Selected Tents */}
          <div>
            <div className="flex items-center gap-2 text-sm text-secondary-600 mb-3">
              <Users className="h-4 w-4" />
              <span className="font-body font-medium">Selected Tents</span>
            </div>
            <div className="space-y-3">
              {bookingData.selectedTents.map((tent) => (
                <div key={tent.tentTypeId}>
                  <div className="font-body text-sm font-medium text-primary-900">
                    {tent.tentTypeName}
                  </div>
                  <div className="font-body text-xs text-secondary-600">
                    {tent.quantity} × ₹{tent.basePrice.toLocaleString()} × {bookingData.nights} nights
                  </div>
                  <div className="font-body text-xs text-secondary-500">
                    {tent.capacity * tent.quantity} guests
                  </div>
                  <div className="font-body text-sm font-semibold text-primary-900 mt-1">
                    ₹{(tent.basePrice * tent.quantity * bookingData.nights).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Add-ons */}
          {(addOns.lunch || addOns.dinner) && (
            <>
              <div>
                <div className="flex items-center gap-2 text-sm text-secondary-600 mb-3">
                  <Utensils className="h-4 w-4" />
                  <span className="font-body font-medium">Add-ons</span>
                </div>
                <div className="space-y-2">
                  {addOns.lunch && (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-body text-sm text-primary-900">Lunch</div>
                        <div className="font-body text-xs text-secondary-600">
                          {bookingData.totalGuests} guests × {bookingData.nights} nights
                        </div>
                      </div>
                      <div className="font-body text-sm font-semibold text-primary-900">
                        ₹{(ADDON_PRICES.lunch * bookingData.totalGuests * bookingData.nights).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {addOns.dinner && (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-body text-sm text-primary-900">Dinner</div>
                        <div className="font-body text-xs text-secondary-600">
                          {bookingData.totalGuests} guests × {bookingData.nights} nights
                        </div>
                      </div>
                      <div className="font-body text-sm font-semibold text-primary-900">
                        ₹{(ADDON_PRICES.dinner * bookingData.totalGuests * bookingData.nights).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-body text-sm text-secondary-700">Accommodation</span>
              <span className="font-body text-sm font-semibold text-primary-900">
                ₹{bookingData.totalPrice.toLocaleString()}
              </span>
            </div>
            {calculateAddOnsTotal() > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-secondary-700">Add-ons</span>
                <span className="font-body text-sm font-semibold text-primary-900">
                  ₹{calculateAddOnsTotal().toLocaleString()}
                </span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between items-center pt-2">
              <span className="font-display text-lg font-bold text-primary-900">Grand Total</span>
              <span className="font-display text-2xl font-bold text-primary-600">
                ₹{calculateGrandTotal().toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading state while data is being loaded
  if (!bookingData) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="font-body text-secondary-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-12">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Complete Your Booking
            </h1>
            <p className="font-body text-lg text-primary-100">
              Just a few more steps to confirm your wilderness adventure
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            {/* Step Indicator */}
            <StepIndicator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area */}
              <div className="lg:col-span-2">
                {/* Step 1: Booking Details Review */}
                {currentStep === 1 && (
                  <Card className="border-surface-200 shadow-level-1">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl text-primary-900">
                        Review Booking Details
                      </CardTitle>
                      <CardDescription className="font-body text-secondary-600">
                        Verify your selected dates and accommodations
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Dates Display */}
                      <div className="bg-primary-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-5 w-5 text-primary-600" />
                          <h3 className="font-display text-lg font-semibold text-primary-900">
                            Stay Dates
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-body text-xs text-secondary-600 mb-1">Check-in</div>
                            <div className="font-body text-base font-semibold text-primary-900">
                              {format(new Date(bookingData.checkIn), 'EEEE, MMM dd, yyyy')}
                            </div>
                          </div>
                          <div>
                            <div className="font-body text-xs text-secondary-600 mb-1">Check-out</div>
                            <div className="font-body text-base font-semibold text-primary-900">
                              {format(new Date(bookingData.checkOut), 'EEEE, MMM dd, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-primary-200">
                          <span className="font-body text-sm text-primary-900">
                            {bookingData.nights} {bookingData.nights === 1 ? 'night' : 'nights'} • {bookingData.totalGuests} guests
                          </span>
                        </div>
                      </div>

                      {/* Selected Tents */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="h-5 w-5 text-primary-600" />
                          <h3 className="font-display text-lg font-semibold text-primary-900">
                            Selected Accommodations
                          </h3>
                        </div>
                        <div className="space-y-4">
                          {bookingData.selectedTents.map((tent) => (
                            <div key={tent.tentTypeId} className="border border-surface-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-body text-base font-semibold text-primary-900 mb-1">
                                    {tent.tentTypeName}
                                  </h4>
                                  <div className="font-body text-sm text-secondary-600">
                                    Quantity: {tent.quantity} • Capacity: {tent.capacity} guests each
                                  </div>
                                  <div className="font-body text-sm text-secondary-600">
                                    Total guests: {tent.capacity * tent.quantity}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-body text-sm text-secondary-600">
                                    ₹{tent.basePrice.toLocaleString()} × {tent.quantity} × {bookingData.nights}
                                  </div>
                                  <div className="font-display text-xl font-bold text-primary-900">
                                    ₹{(tent.basePrice * tent.quantity * bookingData.nights).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription className="font-body text-sm">
                          Your selected dates and accommodations look great! Click Next to continue with guest details.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Guest Details */}
                {currentStep === 2 && (
                  <Card className="border-surface-200 shadow-level-1">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl text-primary-900">
                        Guest Information
                      </CardTitle>
                      <CardDescription className="font-body text-secondary-600">
                        Please provide your contact details for booking confirmation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Full Name */}
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="font-body text-label-sm text-secondary-700 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="Enter your full name"
                          value={guestDetails.fullName}
                          onChange={(e) => {
                            setGuestDetails({ ...guestDetails, fullName: e.target.value });
                            setGuestErrors({ ...guestErrors, fullName: undefined });
                          }}
                          className={`font-body text-body-md ${guestErrors.fullName ? 'border-red-500' : ''}`}
                        />
                        {guestErrors.fullName && (
                          <p className="font-body text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {guestErrors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-body text-label-sm text-secondary-700 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={guestDetails.phone}
                          onChange={(e) => {
                            setGuestDetails({ ...guestDetails, phone: e.target.value });
                            setGuestErrors({ ...guestErrors, phone: undefined });
                          }}
                          className={`font-body text-body-md ${guestErrors.phone ? 'border-red-500' : ''}`}
                        />
                        {guestErrors.phone && (
                          <p className="font-body text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {guestErrors.phone}
                          </p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-body text-label-sm text-secondary-700 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={guestDetails.email}
                          onChange={(e) => {
                            setGuestDetails({ ...guestDetails, email: e.target.value });
                            setGuestErrors({ ...guestErrors, email: undefined });
                          }}
                          className={`font-body text-body-md ${guestErrors.email ? 'border-red-500' : ''}`}
                        />
                        {guestErrors.email && (
                          <p className="font-body text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {guestErrors.email}
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Guest Split */}
                      <div className="space-y-3">
                        <Label className="font-body text-label-sm text-secondary-700 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Number of Guests *
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label htmlFor="adults" className="font-body text-xs text-secondary-600">
                              Adults (age 5+)
                            </Label>
                            <Input
                              id="adults"
                              type="number"
                              min={1}
                              max={getCapacityLimits().adultCapacity}
                              value={adults}
                              onChange={(e) => {
                                setAdults(parseInt(e.target.value) || 0);
                                setGuestCountError(null);
                              }}
                              className="font-body text-body-md"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="children" className="font-body text-xs text-secondary-600">
                              Children (under 5)
                            </Label>
                            <Input
                              id="children"
                              type="number"
                              min={0}
                              max={getCapacityLimits().childCapacity}
                              value={children}
                              onChange={(e) => {
                                setChildren(parseInt(e.target.value) || 0);
                                setGuestCountError(null);
                              }}
                              className="font-body text-body-md"
                            />
                          </div>
                        </div>
                        <p className="font-body text-xs text-secondary-500">
                          Your selection holds up to {getCapacityLimits().adultCapacity} adults
                          and {getCapacityLimits().childCapacity} children under 5. Children aged 5
                          and above count as adults.
                        </p>
                        {guestCountError && (
                          <p className="font-body text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {guestCountError}
                          </p>
                        )}
                      </div>

                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="font-body text-sm">
                          We'll send your booking confirmation and important updates to these contact details.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Add-ons Selection */}
                {currentStep === 3 && (
                  <Card className="border-surface-200 shadow-level-1">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl text-primary-900">
                        Enhance Your Stay
                      </CardTitle>
                      <CardDescription className="font-body text-secondary-600">
                        Select additional services to make your experience even better
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Included Items */}
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                        <h3 className="font-body text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          Included in Your Booking
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 font-body text-sm text-emerald-800">
                            <Coffee className="h-4 w-4" />
                            <span>Breakfast & Evening Snacks</span>
                          </div>
                          <div className="flex items-center gap-2 font-body text-sm text-emerald-800">
                            <Activity className="h-4 w-4" />
                            <span>All Activities (Fishing, Boating, Jungle Walk, etc.)</span>
                          </div>
                        </div>
                      </div>

                      {/* Optional Add-ons */}
                      <div>
                        <h3 className="font-body text-base font-semibold text-primary-900 mb-4">
                          Optional Add-ons
                        </h3>
                        <div className="space-y-4">
                          {/* Lunch */}
                          <div className="border border-surface-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                            <div className="flex items-start gap-4">
                              <Checkbox
                                id="lunch"
                                checked={addOns.lunch}
                                onCheckedChange={(checked) => setAddOns({ ...addOns, lunch: checked as boolean })}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <Label htmlFor="lunch" className="font-body text-base font-semibold text-primary-900 cursor-pointer">
                                  Lunch
                                </Label>
                                <p className="font-body text-sm text-secondary-600 mt-1">
                                  Delicious lunch prepared with fresh, local ingredients
                                </p>
                                <div className="mt-2 font-body text-sm text-primary-900">
                                  ₹{ADDON_PRICES.lunch} per person per night
                                </div>
                                {addOns.lunch && (
                                  <div className="mt-2 bg-primary-50 rounded px-3 py-2 font-body text-sm text-primary-900">
                                    Total: ₹{(ADDON_PRICES.lunch * bookingData.totalGuests * bookingData.nights).toLocaleString()} 
                                    <span className="text-secondary-600 ml-1">
                                      ({bookingData.totalGuests} guests × {bookingData.nights} nights)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dinner */}
                          <div className="border border-surface-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                            <div className="flex items-start gap-4">
                              <Checkbox
                                id="dinner"
                                checked={addOns.dinner}
                                onCheckedChange={(checked) => setAddOns({ ...addOns, dinner: checked as boolean })}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <Label htmlFor="dinner" className="font-body text-base font-semibold text-primary-900 cursor-pointer">
                                  Dinner
                                </Label>
                                <p className="font-body text-sm text-secondary-600 mt-1">
                                  Enjoy a hearty dinner under the stars
                                </p>
                                <div className="mt-2 font-body text-sm text-primary-900">
                                  ₹{ADDON_PRICES.dinner} per person per night
                                </div>
                                {addOns.dinner && (
                                  <div className="mt-2 bg-primary-50 rounded px-3 py-2 font-body text-sm text-primary-900">
                                    Total: ₹{(ADDON_PRICES.dinner * bookingData.totalGuests * bookingData.nights).toLocaleString()}
                                    <span className="text-secondary-600 ml-1">
                                      ({bookingData.totalGuests} guests × {bookingData.nights} nights)
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!addOns.lunch && !addOns.dinner && (
                        <Alert>
                          <Utensils className="h-4 w-4" />
                          <AlertDescription className="font-body text-sm">
                            You can skip this step if you don't need additional meals. Breakfast and snacks are already included!
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Review Booking */}
                {currentStep === 4 && (
                  <Card className="border-surface-200 shadow-level-1">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl text-primary-900">
                        Review Your Booking
                      </CardTitle>
                      <CardDescription className="font-body text-secondary-600">
                        Please review all details before proceeding to payment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Guest Details */}
                      <div>
                        <h3 className="font-body text-base font-semibold text-primary-900 mb-3 flex items-center gap-2">
                          <User className="h-5 w-5 text-primary-600" />
                          Guest Information
                        </h3>
                        <div className="bg-surface-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="font-body text-sm text-secondary-600">Name:</span>
                            <span className="font-body text-sm font-medium text-primary-900">{guestDetails.fullName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-body text-sm text-secondary-600">Phone:</span>
                            <span className="font-body text-sm font-medium text-primary-900">{guestDetails.phone}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-body text-sm text-secondary-600">Email:</span>
                            <span className="font-body text-sm font-medium text-primary-900">{guestDetails.email}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stay Details */}
                      <div>
                        <h3 className="font-body text-base font-semibold text-primary-900 mb-3 flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary-600" />
                          Stay Details
                        </h3>
                        <div className="bg-surface-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between">
                            <span className="font-body text-sm text-secondary-600">Check-in:</span>
                            <span className="font-body text-sm font-medium text-primary-900">
                              {format(new Date(bookingData.checkIn), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-body text-sm text-secondary-600">Check-out:</span>
                            <span className="font-body text-sm font-medium text-primary-900">
                              {format(new Date(bookingData.checkOut), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-body text-sm text-secondary-600">Duration:</span>
                            <span className="font-body text-sm font-medium text-primary-900">
                              {bookingData.nights} {bookingData.nights === 1 ? 'night' : 'nights'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-body text-sm text-secondary-600">Total Guests:</span>
                            <span className="font-body text-sm font-medium text-primary-900">{bookingData.totalGuests}</span>
                          </div>
                        </div>
                      </div>

                      {/* Accommodations */}
                      <div>
                        <h3 className="font-body text-base font-semibold text-primary-900 mb-3 flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary-600" />
                          Accommodations
                        </h3>
                        <div className="space-y-3">
                          {bookingData.selectedTents.map((tent) => (
                            <div key={tent.tentTypeId} className="bg-surface-50 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-body text-sm font-medium text-primary-900">{tent.tentTypeName}</div>
                                  <div className="font-body text-xs text-secondary-600">
                                    {tent.quantity} tent(s) × {tent.capacity} guests
                                  </div>
                                </div>
                                <div className="font-body text-sm font-semibold text-primary-900">
                                  ₹{(tent.basePrice * tent.quantity * bookingData.nights).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Add-ons */}
                      {(addOns.lunch || addOns.dinner) && (
                        <div>
                          <h3 className="font-body text-base font-semibold text-primary-900 mb-3 flex items-center gap-2">
                            <Utensils className="h-5 w-5 text-primary-600" />
                            Selected Add-ons
                          </h3>
                          <div className="bg-surface-50 rounded-lg p-4 space-y-2">
                            {addOns.lunch && (
                              <div className="flex justify-between">
                                <span className="font-body text-sm text-secondary-600">Lunch</span>
                                <span className="font-body text-sm font-medium text-primary-900">
                                  ₹{(ADDON_PRICES.lunch * bookingData.totalGuests * bookingData.nights).toLocaleString()}
                                </span>
                              </div>
                            )}
                            {addOns.dinner && (
                              <div className="flex justify-between">
                                <span className="font-body text-sm text-secondary-600">Dinner</span>
                                <span className="font-body text-sm font-medium text-primary-900">
                                  ₹{(ADDON_PRICES.dinner * bookingData.totalGuests * bookingData.nights).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="bg-primary-50 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-display text-lg font-bold text-primary-900">Grand Total</span>
                          <span className="font-display text-2xl font-bold text-primary-600">
                            ₹{calculateGrandTotal().toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription className="font-body text-sm">
                          Everything looks good! Click Next to proceed to payment.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}

                {/* Step 5: Payment */}
                {currentStep === 5 && (
                  <Card className="border-surface-200 shadow-level-1">
                    <CardHeader>
                      <CardTitle className="font-display text-2xl text-primary-900">
                        Complete Payment
                      </CardTitle>
                      <CardDescription className="font-body text-secondary-600">
                        Secure payment to confirm your booking
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
                          <CreditCard className="h-8 w-8" />
                        </div>
                        <h3 className="font-display text-xl font-bold text-primary-900 mb-2">
                          Ready to Confirm Your Booking
                        </h3>
                        <p className="font-body text-secondary-600 mb-6 max-w-md mx-auto">
                          Click the button below to proceed to our secure payment gateway and complete your booking.
                        </p>
                        
                        <div className="bg-primary-50 rounded-lg p-6 mb-6 max-w-md mx-auto">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-body text-sm text-secondary-700">Amount to Pay</span>
                            <span className="font-display text-3xl font-bold text-primary-600">
                              ₹{calculateGrandTotal().toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={handleProceedToPayment}
                          disabled={isProcessing}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-6 text-lg font-semibold"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-5 w-5" />
                              Proceed to Payment
                            </>
                          )}
                        </Button>

                        <p className="font-body text-xs text-secondary-500 mt-4">
                          🔒 Secure payment powered by Razorpay
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-8">
                  <Button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="border-primary-600 text-primary-600 hover:bg-primary-50"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  {currentStep < 5 && (
                    <Button
                      onClick={handleNext}
                      className="bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Booking Summary Sidebar */}
              <div className="lg:col-span-1">
                <BookingSummary />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Made with Bob
