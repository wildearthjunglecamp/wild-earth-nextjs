'use client';

/**
 * New Booking (Admin)
 * Manual / walk-in / phone booking creation. Looks up availability for the
 * chosen dates, lets staff pick tent quantities, captures guest + payment
 * details, then posts to /api/admin/bookings.
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Search, Loader2, Users, Minus, Plus } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { useToast } from '@/src/hooks/use-toast';

const CHILDREN_PER_TENT = 2;

interface AvailableType {
  tentTypeSlug: string;
  tentTypeName: string;
  capacity: number;
  basePrice: number;
  availableCount: number;
}

function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return ms > 0 ? Math.round(ms / (1000 * 60 * 60 * 24)) : 0;
}

export default function NewBookingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [availability, setAvailability] = useState<AvailableType[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('paid');
  const [specialRequests, setSpecialRequests] = useState('');

  const [total, setTotal] = useState('');
  const [totalTouched, setTotalTouched] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nights = nightsBetween(checkIn, checkOut);

  const selected = useMemo(
    () => availability.filter((t) => (quantities[t.tentTypeSlug] ?? 0) > 0),
    [availability, quantities]
  );

  const suggestedTotal = useMemo(
    () =>
      selected.reduce(
        (sum, t) => sum + t.basePrice * (quantities[t.tentTypeSlug] ?? 0) * nights,
        0
      ),
    [selected, quantities, nights]
  );

  const adultCapacity = useMemo(
    () => selected.reduce((s, t) => s + t.capacity * (quantities[t.tentTypeSlug] ?? 0), 0),
    [selected, quantities]
  );
  const childCapacity = useMemo(
    () => selected.reduce((s, t) => s + (quantities[t.tentTypeSlug] ?? 0), 0) * CHILDREN_PER_TENT,
    [selected, quantities]
  );

  // Keep the total in sync with the suggested value until the admin edits it.
  const effectiveTotal = totalTouched ? total : suggestedTotal ? String(suggestedTotal) : '';

  const handleSearch = async () => {
    setError(null);
    if (!checkIn || !checkOut || nights <= 0) {
      setError('Enter a valid check-in and check-out date.');
      return;
    }
    setSearching(true);
    setSearched(false);
    setQuantities({});
    setTotalTouched(false);
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkInDate: checkIn, checkOutDate: checkOut }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to check availability');
      }
      setAvailability(data.data ?? []);
      setSearched(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to check availability');
    } finally {
      setSearching(false);
    }
  };

  const setQty = (slug: string, value: number, max: number) => {
    const q = Math.max(0, Math.min(max, Number.isNaN(value) ? 0 : value));
    setQuantities((prev) => ({ ...prev, [slug]: q }));
  };

  const validate = (): string | null => {
    if (selected.length === 0) return 'Select at least one tent.';
    if (fullName.trim().length < 2) return 'Enter the guest name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email.';
    if (!/^\+?[1-9]\d{9,14}$/.test(phone.replace(/[\s-]/g, ''))) return 'Enter a valid phone number.';
    if (adults < 1) return 'At least one adult is required.';
    if (adults > adultCapacity) return `Adults exceed tent capacity (${adultCapacity}).`;
    if (children > childCapacity) return `Children under 5 exceed the limit (${childCapacity}).`;
    const totalNum = Number(effectiveTotal);
    if (!totalNum || totalNum <= 0) return 'Enter a valid total amount.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);

    const payload = {
      customerName: fullName.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.replace(/[\s-]/g, ''),
      checkIn,
      checkOut,
      tentItems: selected.map((t) => ({
        tentTypeSlug: t.tentTypeSlug,
        quantity: quantities[t.tentTypeSlug],
        pricePerNight: t.basePrice,
      })),
      adults,
      children,
      totalAmount: Number(effectiveTotal),
      paymentStatus,
      specialRequests: specialRequests.trim() || undefined,
    };

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        const detail =
          typeof data.details === 'string'
            ? data.details
            : data.error || 'Failed to create booking';
        throw new Error(detail);
      }
      toast({ title: 'Booking created', description: `Reference ${data.bookingNumber}` });
      router.push(`/admin/bookings/${encodeURIComponent(data.bookingNumber)}`);
    } catch (err: any) {
      setError(err?.message || 'Failed to create booking');
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/bookings">
          <Button variant="ghost" size="sm" className="font-display">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Bookings
          </Button>
        </Link>
      </div>
      <div>
        <h1 className="text-headline-md font-display text-on-surface">Create Booking</h1>
        <p className="text-body-md font-sans text-on-surface-variant mt-1">
          Manually record a walk-in or phone reservation.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Dates + availability */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-surface">Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <Label htmlFor="checkIn" className="text-label-sm">Check-in</Label>
              <Input
                id="checkIn"
                type="date"
                min={today}
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="checkOut" className="text-label-sm">Check-out</Label>
              <Input
                id="checkOut"
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch} disabled={searching} className="bg-primary text-on-primary font-display rounded-md">
              {searching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Check Availability
            </Button>
          </div>
          {nights > 0 && (
            <p className="text-label-sm font-sans text-on-surface-variant">
              {nights} {nights === 1 ? 'night' : 'nights'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tent selection */}
      {searched && (
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader>
            <CardTitle className="text-headline-sm font-display text-on-surface">Select Tents</CardTitle>
          </CardHeader>
          <CardContent>
            {availability.length === 0 ? (
              <p className="text-body-md font-sans text-on-surface-variant">
                No tents available for these dates.
              </p>
            ) : (
              <div className="space-y-3">
                {availability.map((t) => (
                  <div
                    key={t.tentTypeSlug}
                    className="flex items-center justify-between gap-4 p-4 bg-surface-container rounded-lg border border-outline-variant"
                  >
                    <div>
                      <p className="text-body-md font-sans font-semibold text-on-surface">{t.tentTypeName}</p>
                      <p className="text-label-sm font-sans text-on-surface-variant">
                        Capacity {t.capacity} • ₹{t.basePrice.toLocaleString('en-IN')}/night •{' '}
                        {t.availableCount} available
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(t.tentTypeSlug, (quantities[t.tentTypeSlug] ?? 0) - 1, t.availableCount)}
                        disabled={(quantities[t.tentTypeSlug] ?? 0) <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        min={0}
                        max={t.availableCount}
                        value={quantities[t.tentTypeSlug] ?? 0}
                        onChange={(e) => setQty(t.tentTypeSlug, parseInt(e.target.value, 10), t.availableCount)}
                        className="w-16 text-center"
                      />
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setQty(t.tentTypeSlug, (quantities[t.tentTypeSlug] ?? 0) + 1, t.availableCount)}
                        disabled={(quantities[t.tentTypeSlug] ?? 0) >= t.availableCount}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Guest + payment details (only once tents are selected) */}
      {selected.length > 0 && (
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader>
            <CardTitle className="text-headline-sm font-display text-on-surface">Guest & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="name" className="text-label-sm">Full Name</Label>
                <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Guest name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email" className="text-label-sm">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="guest@email.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-label-sm">Phone</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>

            {/* Guest split */}
            <div className="space-y-2">
              <Label className="text-label-sm flex items-center gap-2">
                <Users className="h-4 w-4" /> Guests
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="adults" className="text-xs text-on-surface-variant">Adults (5+)</Label>
                  <Input id="adults" type="number" min={1} max={adultCapacity} value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value, 10) || 0)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="children" className="text-xs text-on-surface-variant">Children (under 5)</Label>
                  <Input id="children" type="number" min={0} max={childCapacity} value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value, 10) || 0)} />
                </div>
              </div>
              <p className="text-xs text-on-surface-variant">
                Holds up to {adultCapacity} adults and {childCapacity} children under 5.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-label-sm">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as 'paid' | 'pending')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid (collected offline)</SelectItem>
                    <SelectItem value="pending">Pending (collect later)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="total" className="text-label-sm">
                  Total Amount (₹){suggestedTotal > 0 && !totalTouched ? ' — auto' : ''}
                </Label>
                <Input
                  id="total"
                  type="number"
                  min={0}
                  value={effectiveTotal}
                  onChange={(e) => {
                    setTotalTouched(true);
                    setTotal(e.target.value);
                  }}
                />
                {totalTouched && suggestedTotal > 0 && (
                  <button
                    type="button"
                    className="text-xs text-primary"
                    onClick={() => setTotalTouched(false)}
                  >
                    Reset to suggested (₹{suggestedTotal.toLocaleString('en-IN')})
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="notes" className="text-label-sm">Special Requests (optional)</Label>
              <Textarea id="notes" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={3} />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Link href="/admin/bookings">
                <Button variant="outline" className="font-display rounded-md">Cancel</Button>
              </Link>
              <Button onClick={handleSubmit} disabled={submitting} className="bg-primary text-on-primary font-display rounded-md">
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Booking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Made with Bob
