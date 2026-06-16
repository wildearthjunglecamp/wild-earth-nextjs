'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Users, Check, X, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { Separator } from '@/src/components/ui/separator';
import Link from 'next/link';

// TypeScript interfaces
interface TentType {
  tentTypeId: string;
  tentTypeSlug: string;
  tentTypeName: string;
  capacity: number;
  basePrice: number;
  effectivePrice: number;  // per-night avg after date-specific overrides
  stayTotal: number;       // full-stay total for 1 tent
  description: string;
  amenities: string[];
  images: string[];
  availableCount: number;
  totalCount: number;
  availableTentIds: string[];
  availableTentNumbers: string[];
}

interface AvailabilityResponse {
  success: boolean;
  data: TentType[];
  meta: {
    checkIn: string;
    checkOut: string;
    nights: number;
    guestCount?: number;
    totalAvailable: number;
  };
}

interface SelectedTent {
  tentTypeId: string;
  tentTypeSlug: string;
  tentTypeName: string;
  capacity: number;
  basePrice: number;
  effectivePrice: number;
  stayTotal: number;
  quantity: number;
}

export default function AvailabilityPage() {
  // Form state
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  
  // API state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availabilityData, setAvailabilityData] = useState<AvailabilityResponse | null>(null);
  
  // Selection state
  const [selectedTents, setSelectedTents] = useState<Map<string, SelectedTent>>(new Map());
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    checkIn?: string;
    checkOut?: string;
  }>({});

  // Set minimum date to today
  const today = format(new Date(), 'yyyy-MM-dd');

  // Validate dates
  const validateDates = (): boolean => {
    const errors: { checkIn?: string; checkOut?: string } = {};
    
    if (!checkInDate) {
      errors.checkIn = 'Check-in date is required';
    } else if (new Date(checkInDate) < new Date(today)) {
      errors.checkIn = 'Check-in date cannot be in the past';
    }
    
    if (!checkOutDate) {
      errors.checkOut = 'Check-out date is required';
    } else if (checkInDate && new Date(checkOutDate) <= new Date(checkInDate)) {
      errors.checkOut = 'Check-out must be after check-in';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle search
  const handleSearch = async () => {
    if (!validateDates()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedTents(new Map()); // Clear selections on new search

    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check availability');
      }

      setAvailabilityData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle tent selection
  const handleTentSelection = (tent: TentType) => {
    const newSelections = new Map(selectedTents);
    
    if (newSelections.has(tent.tentTypeId)) {
      // Deselect
      newSelections.delete(tent.tentTypeId);
    } else {
      // Select (default quantity: 1)
      newSelections.set(tent.tentTypeId, {
        tentTypeId: tent.tentTypeId,
        tentTypeSlug: tent.tentTypeSlug,
        tentTypeName: tent.tentTypeName,
        capacity: tent.capacity,
        basePrice: tent.basePrice,
        effectivePrice: tent.effectivePrice,
        stayTotal: tent.stayTotal,
        quantity: 1,
      });
    }
    
    setSelectedTents(newSelections);
  };

  // Update tent quantity
  const updateTentQuantity = (tentTypeId: string, quantity: number) => {
    const newSelections = new Map(selectedTents);
    const tent = newSelections.get(tentTypeId);
    
    if (tent && quantity > 0) {
      tent.quantity = quantity;
      newSelections.set(tentTypeId, tent);
      setSelectedTents(newSelections);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalGuests = 0;
    let totalPrice = 0;

    selectedTents.forEach((tent) => {
      totalGuests += tent.capacity * tent.quantity;
      totalPrice += tent.stayTotal * tent.quantity;
    });

    return { totalGuests, totalPrice };
  };

  const { totalGuests, totalPrice } = calculateTotals();

  // Get tent status
  const getTentStatus = (tent: TentType): 'available' | 'limited' | 'soldout' => {
    if (tent.availableCount === 0) return 'soldout';
    if (tent.availableCount <= 2) return 'limited';
    return 'available';
  };

  // Get status badge
  const getStatusBadge = (status: 'available' | 'limited' | 'soldout') => {
    switch (status) {
      case 'available':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Available</Badge>;
      case 'limited':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Limited</Badge>;
      case 'soldout':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Sold Out</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Check Availability
            </h1>
            <p className="font-body text-xl text-primary-100">
              Find the perfect dates for your wilderness adventure
            </p>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-12">
        <div className="container px-4">
          <Card className="max-w-4xl mx-auto border-surface-200 shadow-level-2">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-primary-900 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary-600" />
                Select Your Dates
              </CardTitle>
              <CardDescription className="font-body text-secondary-600">
                Choose your check-in and check-out dates to see available tents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Check-in Date */}
                <div className="space-y-2">
                  <Label htmlFor="check-in" className="font-body text-label-sm text-secondary-700">
                    Check-in Date
                  </Label>
                  <Input
                    id="check-in"
                    type="date"
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      setValidationErrors({ ...validationErrors, checkIn: undefined });
                    }}
                    min={today}
                    className={`font-body text-body-md ${validationErrors.checkIn ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.checkIn && (
                    <p className="font-body text-sm text-red-600">{validationErrors.checkIn}</p>
                  )}
                </div>

                {/* Check-out Date */}
                <div className="space-y-2">
                  <Label htmlFor="check-out" className="font-body text-label-sm text-secondary-700">
                    Check-out Date
                  </Label>
                  <Input
                    id="check-out"
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => {
                      setCheckOutDate(e.target.value);
                      setValidationErrors({ ...validationErrors, checkOut: undefined });
                    }}
                    min={checkInDate || today}
                    className={`font-body text-body-md ${validationErrors.checkOut ? 'border-red-500' : ''}`}
                  />
                  {validationErrors.checkOut && (
                    <p className="font-body text-sm text-red-600">{validationErrors.checkOut}</p>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={loading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Checking Availability...
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-5 w-5" />
                    Check Availability
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Error Message */}
      {error && (
        <section className="pb-12">
          <div className="container px-4">
            <Alert variant="destructive" className="max-w-4xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="font-body text-body-md">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        </section>
      )}

      {/* Results Section */}
      {availabilityData && (
        <section className="pb-12">
          <div className="container px-4">
            <div className="max-w-6xl mx-auto">
              {/* Results Header */}
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold text-primary-900 mb-2">
                  Available Tents
                </h2>
                <p className="font-body text-lg text-secondary-600">
                  {availabilityData.meta.nights} {availabilityData.meta.nights === 1 ? 'night' : 'nights'} • {' '}
                  {format(new Date(availabilityData.meta.checkIn), 'MMM dd, yyyy')} - {' '}
                  {format(new Date(availabilityData.meta.checkOut), 'MMM dd, yyyy')}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tent Cards */}
                <div className="lg:col-span-2 space-y-6">
                  {availabilityData.data.length === 0 ? (
                    <Card className="border-surface-200 shadow-level-1">
                      <CardContent className="p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-secondary-400 mx-auto mb-4" />
                        <h3 className="font-display text-xl font-bold text-primary-900 mb-2">
                          No Tents Available
                        </h3>
                        <p className="font-body text-secondary-600">
                          Sorry, there are no tents available for the selected dates. Please try different dates.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    availabilityData.data.map((tent) => {
                      const status = getTentStatus(tent);
                      const isSelected = selectedTents.has(tent.tentTypeId);
                      const isSoldOut = status === 'soldout';
                      const selectedTent = selectedTents.get(tent.tentTypeId);

                      return (
                        <Card
                          key={tent.tentTypeId}
                          className={`border-surface-200 shadow-level-1 hover:shadow-level-2 transition-all duration-300 ${
                            isSelected ? 'ring-2 ring-primary-600' : ''
                          } ${isSoldOut ? 'opacity-60' : ''}`}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Tent Info */}
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-display text-xl font-bold text-primary-900 mb-1">
                                      {tent.tentTypeName}
                                    </h3>
                                    <div className="flex items-center gap-2 text-secondary-600">
                                      <Users className="h-4 w-4" />
                                      <span className="font-body text-sm">
                                        Up to {tent.capacity} guests
                                      </span>
                                    </div>
                                  </div>
                                  {getStatusBadge(status)}
                                </div>

                                <p className="font-body text-sm text-secondary-700 mb-4">
                                  {tent.description}
                                </p>

                                {/* Amenities */}
                                {tent.amenities.length > 0 && (
                                  <div className="mb-4">
                                    <div className="flex flex-wrap gap-2">
                                      {tent.amenities.slice(0, 3).map((amenity, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="font-body text-xs border-surface-300 text-secondary-700"
                                        >
                                          {amenity}
                                        </Badge>
                                      ))}
                                      {tent.amenities.length > 3 && (
                                        <Badge
                                          variant="outline"
                                          className="font-body text-xs border-surface-300 text-secondary-700"
                                        >
                                          +{tent.amenities.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Availability Count */}
                                <div className="flex items-center gap-2 text-sm">
                                  {!isSoldOut ? (
                                    <>
                                      <Check className="h-4 w-4 text-emerald-600" />
                                      <span className="font-body text-secondary-700">
                                        {tent.availableCount} {tent.availableCount === 1 ? 'tent' : 'tents'} available
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-4 w-4 text-red-600" />
                                      <span className="font-body text-secondary-700">
                                        No tents available
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Price and Action */}
                              <div className="flex flex-col items-end justify-between md:w-48">
                                <div className="text-right mb-4">
                                  <div className="font-display text-3xl font-bold text-primary-900">
                                    ₹{tent.effectivePrice.toLocaleString()}
                                  </div>
                                  <div className="font-body text-sm text-secondary-600">
                                    per night
                                    {tent.effectivePrice !== tent.basePrice && (
                                      <span className="ml-1 text-xs text-amber-600">(custom)</span>
                                    )}
                                  </div>
                                  <div className="font-body text-xs text-secondary-500 mt-1">
                                    ₹{tent.stayTotal.toLocaleString()} total
                                  </div>
                                </div>

                                {!isSoldOut && (
                                  <div className="w-full space-y-2">
                                    {isSelected && selectedTent && (
                                      <div className="flex items-center gap-2 mb-2">
                                        <Label className="font-body text-xs text-secondary-700">Qty:</Label>
                                        <Input
                                          type="number"
                                          min="1"
                                          max={tent.availableCount}
                                          value={selectedTent.quantity}
                                          onChange={(e) => updateTentQuantity(tent.tentTypeId, parseInt(e.target.value) || 1)}
                                          className="w-20 h-8 text-center"
                                        />
                                      </div>
                                    )}
                                    <Button
                                      onClick={() => handleTentSelection(tent)}
                                      className={`w-full ${
                                        isSelected
                                          ? 'bg-primary-600 hover:bg-primary-700'
                                          : 'bg-white border-2 border-primary-600 text-primary-600 hover:bg-primary-50'
                                      }`}
                                    >
                                      {isSelected ? (
                                        <>
                                          <Check className="mr-2 h-4 w-4" />
                                          Selected
                                        </>
                                      ) : (
                                        'Select Tent'
                                      )}
                                    </Button>
                                  </div>
                                )}

                                {isSoldOut && (
                                  <Button disabled className="w-full">
                                    Sold Out
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>

                {/* Selection Summary */}
                <div className="lg:col-span-1">
                  <div className="sticky top-4">
                    <Card className="border-surface-200 shadow-level-2">
                      <CardHeader className="bg-primary-50">
                        <CardTitle className="font-display text-xl text-primary-900">
                          Booking Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {selectedTents.size === 0 ? (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
                            <p className="font-body text-sm text-secondary-600">
                              Select tents to see your booking summary
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Selected Tents */}
                            <div className="space-y-3">
                              {Array.from(selectedTents.values()).map((tent) => (
                                <div key={tent.tentTypeId} className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="font-body text-sm font-medium text-primary-900">
                                      {tent.tentTypeName}
                                    </div>
                                    <div className="font-body text-xs text-secondary-600">
                                      {tent.quantity} × ₹{tent.effectivePrice.toLocaleString()} × {availabilityData.meta.nights} nights
                                    </div>
                                    <div className="font-body text-xs text-secondary-500">
                                      {tent.capacity * tent.quantity} guests
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-body text-sm font-semibold text-primary-900">
                                      ₹{(tent.stayTotal * tent.quantity).toLocaleString()}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleTentSelection({ tentTypeId: tent.tentTypeId } as TentType)}
                                      className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <Separator />

                            {/* Totals */}
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-body text-sm text-secondary-700">Total Guests</span>
                                <span className="font-body text-sm font-semibold text-primary-900">
                                  {totalGuests}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="font-body text-sm text-secondary-700">Nights</span>
                                <span className="font-body text-sm font-semibold text-primary-900">
                                  {availabilityData.meta.nights}
                                </span>
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center pt-2">
                                <span className="font-display text-lg font-bold text-primary-900">Total</span>
                                <span className="font-display text-2xl font-bold text-primary-600">
                                  ₹{totalPrice.toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Proceed Button */}
                            <Button
                              onClick={() => {
                                // Store booking data in localStorage for the booking page
                                const bookingData = {
                                  checkIn: availabilityData.meta.checkIn,
                                  checkOut: availabilityData.meta.checkOut,
                                  nights: availabilityData.meta.nights,
                                  selectedTents: Array.from(selectedTents.values()),
                                  totalGuests,
                                  totalPrice,
                                };
                                localStorage.setItem('bookingData', JSON.stringify(bookingData));
                                window.location.href = '/booking';
                              }}
                              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-6 text-lg font-semibold mt-4"
                            >
                              Proceed to Booking
                              <ChevronRight className="ml-2 h-5 w-5" />
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// Made with Bob
