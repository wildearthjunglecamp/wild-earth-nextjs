# Razorpay Button Component - Usage Guide

## Overview

The `RazorpayButton` component provides a simple, reusable way to integrate Razorpay payment checkout in your Next.js application.

## Component Location

```
src/components/payment/razorpay-button.tsx
```

## Features

✅ **Automatic Order Creation** - Creates Razorpay order automatically  
✅ **Payment Verification** - Verifies payment signature on backend  
✅ **Error Handling** - Comprehensive error handling with toast notifications  
✅ **Loading States** - Shows loading state during payment process  
✅ **Script Loading** - Automatically loads Razorpay checkout script  
✅ **TypeScript Support** - Full type safety  
✅ **Customizable** - Accepts custom callbacks and styling  

## Installation

The component is already created. Make sure you have the required dependencies:

```bash
npm install next
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `amount` | number | Yes | Payment amount in INR (e.g., 3999.00) |
| `bookingDetails` | object | Yes | Customer and booking information |
| `bookingDetails.id` | string | Yes | Unique booking ID |
| `bookingDetails.customerName` | string | Yes | Customer's full name |
| `bookingDetails.customerEmail` | string | Yes | Customer's email |
| `bookingDetails.customerPhone` | string | Yes | Customer's phone number |
| `onSuccess` | function | No | Callback when payment succeeds |
| `onError` | function | No | Callback when payment fails |
| `disabled` | boolean | No | Disable the button (default: false) |
| `className` | string | No | Additional CSS classes |

## Basic Usage

```tsx
import { RazorpayButton } from '@/components/payment/razorpay-button';

export default function BookingPage() {
  const bookingDetails = {
    id: 'booking_123',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+919876543210',
  };

  return (
    <div>
      <h1>Complete Your Booking</h1>
      <RazorpayButton
        amount={3999.00}
        bookingDetails={bookingDetails}
      />
    </div>
  );
}
```

## Advanced Usage with Callbacks

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RazorpayButton } from '@/components/payment/razorpay-button';

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const bookingDetails = {
    id: 'booking_123',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+919876543210',
  };

  const handlePaymentSuccess = (paymentId: string, orderId: string) => {
    console.log('Payment successful!');
    console.log('Payment ID:', paymentId);
    console.log('Order ID:', orderId);

    setPaymentStatus('success');

    // Redirect to success page
    router.push(`/booking/success?payment_id=${paymentId}`);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment failed:', error);
    setPaymentStatus('error');

    // Show error message or retry option
    alert('Payment failed. Please try again.');
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Payment</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Tent Type:</span>
            <span className="font-medium">Twin Sharing Small</span>
          </div>
          <div className="flex justify-between">
            <span>Check-in:</span>
            <span className="font-medium">Dec 25, 2024</span>
          </div>
          <div className="flex justify-between">
            <span>Check-out:</span>
            <span className="font-medium">Dec 27, 2024</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Total Amount:</span>
            <span>₹3,999</span>
          </div>
        </div>
      </div>

      <RazorpayButton
        amount={3999.00}
        bookingDetails={bookingDetails}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        disabled={paymentStatus === 'processing'}
        className="w-full"
      />

      {paymentStatus === 'error' && (
        <p className="text-red-600 mt-4 text-center">
          Payment failed. Please try again.
        </p>
      )}
    </div>
  );
}
```

## Complete Booking Flow Example

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RazorpayButton } from '@/components/payment/razorpay-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  checkIn: string;
  checkOut: string;
  tentType: string;
  guests: number;
}

export default function BookingFlowPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'payment'>('form');
  const [bookingId, setBookingId] = useState<string>('');
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    checkIn: '',
    checkOut: '',
    tentType: 'twin_sharing_small',
    guests: 2,
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create booking (pending payment)
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    setBookingId(result.data.id);
    setStep('payment');
  };

  const handlePaymentSuccess = async (paymentId: string, orderId: string) => {
    // Update booking with payment details
    await fetch(`/api/bookings/${bookingId}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, orderId }),
    });

    // Redirect to success page
    router.push(`/booking/success?booking_id=${bookingId}`);
  };

  if (step === 'form') {
    return (
      <form onSubmit={handleFormSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Book Your Stay</h1>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Continue to Payment
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

      <RazorpayButton
        amount={3999.00}
        bookingDetails={{
          id: bookingId,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
        }}
        onSuccess={handlePaymentSuccess}
        className="w-full"
      />
    </div>
  );
}
```

## Payment Flow

```
1. User clicks "Pay" button
   ↓
2. Component calls /api/payment/create-order
   ↓
3. Backend creates Razorpay order
   ↓
4. Component opens Razorpay checkout popup
   ↓
5. User completes payment on Razorpay
   ↓
6. Razorpay calls success handler
   ↓
7. Component calls /api/payment/verify
   ↓
8. Backend verifies payment signature
   ↓
9. Component calls onSuccess callback
   ↓
10. Redirect to success page
```

## Customization

### Custom Button Styling

```tsx
<RazorpayButton
  amount={3999.00}
  bookingDetails={bookingDetails}
  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full"
/>
```

### Custom Success Handler

```tsx
const handleSuccess = async (paymentId: string, orderId: string) => {
  // Send confirmation email
  await fetch('/api/email/confirmation', {
    method: 'POST',
    body: JSON.stringify({ paymentId, orderId }),
  });

  // Update local state
  setBookingConfirmed(true);

  // Show success message
  toast({
    title: 'Booking Confirmed!',
    description: 'Check your email for confirmation.',
  });

  // Redirect after 2 seconds
  setTimeout(() => {
    router.push('/bookings');
  }, 2000);
};

<RazorpayButton
  amount={3999.00}
  bookingDetails={bookingDetails}
  onSuccess={handleSuccess}
/>
```

### Conditional Rendering

```tsx
{isFormValid ? (
  <RazorpayButton
    amount={totalAmount}
    bookingDetails={bookingDetails}
  />
) : (
  <Button disabled>
    Complete form to proceed
  </Button>
)}
```

## Error Handling

The component handles errors automatically with toast notifications:

- **Order Creation Failed** - Shows error message
- **Payment Cancelled** - Shows cancellation message
- **Verification Failed** - Shows verification error
- **Script Load Failed** - Shows gateway error

You can also handle errors with the `onError` callback:

```tsx
const handleError = (error: any) => {
  // Log to error tracking service
  console.error('Payment error:', error);

  // Show custom error UI
  setErrorMessage(error.message);

  // Send error notification to admin
  fetch('/api/admin/notify-error', {
    method: 'POST',
    body: JSON.stringify({ error }),
  });
};

<RazorpayButton
  amount={3999.00}
  bookingDetails={bookingDetails}
  onError={handleError}
/>
```

## Testing

### Test with Razorpay Test Cards

Use these test cards in development:

**Success:**
- Card: 4111 1111 1111 1111
- CVV: 123
- Expiry: Any future date

**Failure:**
- Card: 4000 0000 0000 0002
- CVV: 123
- Expiry: Any future date

### Test Mode Setup

Make sure you're using test keys in `.env.local`:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

## Environment Variables

Required environment variables:

```env
# Public key (exposed to frontend)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx

# Private keys (backend only)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

## Troubleshooting

### Button Not Working

1. Check if Razorpay script is loaded
2. Verify environment variables are set
3. Check browser console for errors
4. Ensure API endpoints are working

### Payment Verification Fails

1. Check webhook secret is correct
2. Verify signature verification logic
3. Check backend logs for errors
4. Ensure payment ID and order ID are correct

### Script Load Error

1. Check internet connection
2. Verify Razorpay CDN is accessible
3. Check browser console for errors
4. Try clearing browser cache

## Best Practices

1. **Always verify payments on backend** - Never trust frontend verification alone
2. **Handle all error cases** - Payment can fail for many reasons
3. **Show loading states** - Keep users informed during payment
4. **Use webhooks** - For reliable payment status updates
5. **Test thoroughly** - Test with different cards and scenarios
6. **Log everything** - Log all payment attempts for debugging
7. **Secure credentials** - Never expose secret keys to frontend

## Security Notes

⚠️ **Important Security Considerations:**

- Never expose `RAZORPAY_KEY_SECRET` to the frontend
- Always verify payment signature on the backend
- Use HTTPS in production
- Validate all inputs before processing
- Implement rate limiting on payment endpoints
- Log all payment attempts for audit trail

## Support

For issues or questions:
- Check [Razorpay Documentation](https://razorpay.com/docs)
- Review API logs in Supabase
- Check Razorpay dashboard for payment status
- Contact support@wildearth.com

---

**Component Version:** 1.0.0  
**Last Updated:** June 8, 2026