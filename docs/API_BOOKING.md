# Booking API Documentation

## Overview

This API handles the complete booking creation process with integrated payment verification and atomic transactions.

## Endpoint

### Create Booking with Payment

```
POST /api/bookings/create
```

Creates a new campsite booking with payment verification. All operations are performed atomically in a single PostgreSQL transaction with row-level locking to prevent race conditions.

## Request

### Headers

```
Content-Type: application/json
```

### Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `customerName` | string | Yes | Customer's full name (2-100 chars) |
| `customerEmail` | string | Yes | Valid email address |
| `customerPhone` | string | Yes | Phone number with country code |
| `checkIn` | string | Yes | Check-in date (YYYY-MM-DD) |
| `checkOut` | string | Yes | Check-out date (YYYY-MM-DD) |
| `tentType` | string | Yes | Tent type slug |
| `tentQuantity` | number | Yes | Number of tents (1-10) |
| `adults` | number | Yes | Number of adults (1-40) |
| `children` | number | Yes | Number of children (0-40) |
| `addOns` | array | No | Array of add-on items |
| `activities` | array | No | Array of activity IDs |
| `razorpayOrderId` | string | Yes | Razorpay order ID |
| `razorpayPaymentId` | string | Yes | Razorpay payment ID |
| `razorpaySignature` | string | Yes | Razorpay signature |
| `totalAmount` | number | Yes | Total amount in INR |
| `specialRequests` | string | No | Special requests (max 500 chars) |

### Tent Types

| Slug | Name | Capacity |
|------|------|----------|
| `twin_sharing_small` | Twin Sharing Small | 2 guests |
| `twin_sharing_semi_big` | Twin Sharing Semi Big | 2 guests |
| `three_sharing_jungle` | Three Sharing Jungle | 3 guests |
| `four_sharing_jungle` | Four Sharing Jungle | 4 guests |

### Validation Rules

**Dates:**
- Check-in date cannot be in the past
- Check-out date must be after check-in date
- Dates must be in YYYY-MM-DD format

**Guests:**
- At least 1 adult required
- Maximum 40 adults per booking
- Maximum 40 children per booking

**Tents:**
- Minimum 1 tent
- Maximum 10 tents per booking

**Payment:**
- All Razorpay fields are required
- Payment signature must be valid
- Amount must be positive

### Example Request

```json
{
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "+919876543210",
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-27",
  "tentType": "twin_sharing_small",
  "tentQuantity": 2,
  "adults": 2,
  "children": 1,
  "addOns": [
    {
      "addOnId": "uuid-lunch",
      "quantity": 6
    },
    {
      "addOnId": "uuid-dinner",
      "quantity": 6
    }
  ],
  "activities": [
    "uuid-bonfire",
    "uuid-boating"
  ],
  "razorpayOrderId": "order_MNxyz123456789",
  "razorpayPaymentId": "pay_ABCxyz987654321",
  "razorpaySignature": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "totalAmount": 11598.00,
  "specialRequests": "Please arrange tents close to each other"
}
```

## Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "id": "uuid-booking-id",
    "bookingNumber": "WE-20241225-0001",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+919876543210",
    "checkIn": "2024-12-25",
    "checkOut": "2024-12-27",
    "tentType": "twin_sharing_small",
    "tentQuantity": 2,
    "adults": 2,
    "children": 1,
    "totalAmount": 11598.00,
    "bookingStatus": "confirmed",
    "paymentStatus": "paid",
    "assignedTents": [
      {
        "tentId": "uuid-tent-1",
        "tentNumber": "TS-001"
      },
      {
        "tentId": "uuid-tent-2",
        "tentNumber": "TS-002"
      }
    ],
    "paymentDetails": {
      "razorpayOrderId": "order_MNxyz123456789",
      "razorpayPaymentId": "pay_ABCxyz987654321",
      "amount": 11598.00,
      "status": "paid"
    },
    "createdAt": "2024-12-20T10:30:00.000Z"
  },
  "message": "Booking created successfully"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique booking ID (UUID) |
| `bookingNumber` | string | Human-readable booking number |
| `customerName` | string | Customer's name |
| `customerEmail` | string | Customer's email |
| `customerPhone` | string | Customer's phone |
| `checkIn` | string | Check-in date |
| `checkOut` | string | Check-out date |
| `tentType` | string | Tent type slug |
| `tentQuantity` | number | Number of tents booked |
| `adults` | number | Number of adults |
| `children` | number | Number of children |
| `totalAmount` | number | Total amount paid |
| `bookingStatus` | string | Booking status (confirmed) |
| `paymentStatus` | string | Payment status (paid) |
| `assignedTents` | array | List of assigned tents |
| `paymentDetails` | object | Payment information |
| `createdAt` | string | Booking creation timestamp |

## Error Responses

### Validation Error (400 Bad Request)

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid booking data",
  "details": [
    {
      "field": "customerEmail",
      "message": "Invalid email address"
    },
    {
      "field": "checkOut",
      "message": "Check-out date must be after check-in date"
    }
  ]
}
```

### Payment Verification Failed (400 Bad Request)

```json
{
  "success": false,
  "error": "Payment verification failed",
  "message": "Invalid payment signature. Payment may be fraudulent."
}
```

### Insufficient Tents (409 Conflict)

```json
{
  "success": false,
  "error": "Insufficient tents available",
  "message": "Not enough tents available for the selected dates and type."
}
```

### Duplicate Payment (409 Conflict)

```json
{
  "success": false,
  "error": "Duplicate payment",
  "message": "This payment has already been processed."
}
```

### Internal Server Error (500)

```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred while creating the booking"
}
```

## Atomic Transaction Flow

The booking creation process follows these steps in a single atomic transaction:

```
1. Verify Razorpay payment signature
   ↓
2. Check if payment already processed (prevent duplicates)
   ↓
3. Get tent type ID from slug
   ↓
4. Find available tents with row-level locking (FOR UPDATE)
   ↓
5. Validate sufficient tents available
   ↓
6. Create booking record (status: confirmed, payment: paid)
   ↓
7. Assign tents to booking (booking_tents table)
   ↓
8. Create payment record
   ↓
9. Return booking details with assigned tents
```

**If any step fails, the entire transaction is rolled back.**

## Race Condition Prevention

The system uses PostgreSQL row-level locking to prevent race conditions:

```sql
SELECT * FROM tents
WHERE tent_type_id = ?
  AND status = 'available'
  AND id NOT IN (conflicting bookings)
FOR UPDATE; -- Locks the rows until transaction completes
```

This ensures that:
- Two simultaneous bookings cannot assign the same tent
- Tent availability is checked and locked atomically
- No double bookings can occur

## Usage Examples

### JavaScript/TypeScript (fetch)

```typescript
async function createBooking(bookingData: any) {
  try {
    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Booking creation failed');
    }

    return result.data;
  } catch (error) {
    console.error('Booking error:', error);
    throw error;
  }
}

// Usage
const booking = await createBooking({
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+919876543210',
  checkIn: '2024-12-25',
  checkOut: '2024-12-27',
  tentType: 'twin_sharing_small',
  tentQuantity: 2,
  adults: 2,
  children: 1,
  razorpayOrderId: 'order_xxx',
  razorpayPaymentId: 'pay_xxx',
  razorpaySignature: 'signature_xxx',
  totalAmount: 11598.00,
});

console.log('Booking created:', booking.bookingNumber);
console.log('Assigned tents:', booking.assignedTents);
```

### React Component with Complete Flow

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RazorpayButton } from '@/components/payment/razorpay-button';

export default function BookingPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    checkIn: '',
    checkOut: '',
    tentType: 'twin_sharing_small',
    tentQuantity: 1,
    adults: 2,
    children: 0,
    totalAmount: 3999.00,
  });

  const handlePaymentSuccess = async (
    paymentId: string,
    orderId: string,
    signature: string
  ) => {
    try {
      // Create booking with payment verification
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...bookingData,
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      // Redirect to success page
      router.push(`/booking/success?booking=${result.data.bookingNumber}`);
    } catch (error) {
      console.error('Booking creation failed:', error);
      alert('Failed to create booking. Please contact support.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Complete Your Booking</h1>

      {/* Booking form here */}

      <RazorpayButton
        amount={bookingData.totalAmount}
        bookingDetails={{
          id: 'temp-id', // Temporary ID for payment
          customerName: bookingData.customerName,
          customerEmail: bookingData.customerEmail,
          customerPhone: bookingData.customerPhone,
        }}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/bookings/create \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+919876543210",
    "checkIn": "2024-12-25",
    "checkOut": "2024-12-27",
    "tentType": "twin_sharing_small",
    "tentQuantity": 2,
    "adults": 2,
    "children": 1,
    "razorpayOrderId": "order_MNxyz123456789",
    "razorpayPaymentId": "pay_ABCxyz987654321",
    "razorpaySignature": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    "totalAmount": 11598.00
  }'
```

## Database Schema

### bookings Table

```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  tent_type_id UUID REFERENCES tent_types(id),
  adults INTEGER NOT NULL,
  children INTEGER NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  booking_status TEXT NOT NULL DEFAULT 'pending_payment',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### booking_tents Table (Junction)

```sql
CREATE TABLE booking_tents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  tent_id UUID REFERENCES tents(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(booking_id, tent_id)
);
```

### payments Table

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  razorpay_order_id TEXT UNIQUE NOT NULL,
  razorpay_payment_id TEXT UNIQUE NOT NULL,
  razorpay_signature TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL,
  payment_method TEXT DEFAULT 'razorpay',
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

### Test Scenario 1: Successful Booking

```typescript
const testBooking = {
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerPhone: '+919876543210',
  checkIn: '2024-12-25',
  checkOut: '2024-12-27',
  tentType: 'twin_sharing_small',
  tentQuantity: 1,
  adults: 2,
  children: 0,
  razorpayOrderId: 'order_test_123',
  razorpayPaymentId: 'pay_test_123',
  razorpaySignature: 'valid_signature',
  totalAmount: 3999.00,
};

// Should return 201 with booking details
```

### Test Scenario 2: Insufficient Tents

```typescript
const testBooking = {
  // ... same as above
  tentQuantity: 100, // More than available
};

// Should return 409 with "Insufficient tents available"
```

### Test Scenario 3: Invalid Payment

```typescript
const testBooking = {
  // ... same as above
  razorpaySignature: 'invalid_signature',
};

// Should return 400 with "Payment verification failed"
```

## Security Considerations

1. **Payment Verification** - Always verify signature on backend
2. **Atomic Transactions** - All operations in single transaction
3. **Row-Level Locking** - Prevents race conditions
4. **Duplicate Prevention** - Check payment ID before processing
5. **Input Validation** - Validate all inputs with Zod
6. **SQL Injection** - Use parameterized queries
7. **Error Handling** - Don't expose sensitive information

## Performance Optimization

1. **Database Indexes** - On frequently queried columns
2. **Connection Pooling** - Supabase handles this
3. **Transaction Timeout** - Set appropriate timeout
4. **Concurrent Requests** - Row-level locking handles this
5. **Query Optimization** - Use efficient SQL queries

## Monitoring

Track these metrics:
- Booking creation success rate
- Average transaction time
- Failed payment verifications
- Insufficient tent errors
- Database deadlocks (should be zero)

## Support

For issues:
- Check database logs in Supabase
- Review API logs
- Check Razorpay dashboard
- Contact support@wildearth.com

---

**API Version:** 1.0.0  
**Last Updated:** June 9, 2026

## Comprehensive Testing Guide

### Database Test Scenarios

This section provides SQL queries and test scenarios to validate the booking system's functionality.

#### 1. Single Tent Type Booking Validation

**Test Scenario:** Create a booking with one tent type and verify all tables are correctly populated.

```sql
-- Step 1: Create a test booking
SELECT create_booking_with_payment(
  'WE-20241225-TEST1',
  'John Doe',
  'john@example.com',
  '+919876543210',
  '2024-12-25'::DATE,
  '2024-12-27'::DATE,
  '[{"tentTypeSlug": "twin_sharing_small", "quantity": 1, "pricePerNight": 3999.00}]'::JSONB,
  2, -- adults
  0, -- children
  7998.00, -- total amount (3999 * 2 nights)
  'Test booking',
  'order_test_001',
  'pay_test_001',
  'sig_test_001'
);

-- Step 2: Verify booking record
SELECT 
  id,
  booking_number,
  customer_name,
  customer_email,
  check_in,
  check_out,
  adults,
  children,
  total_amount,
  booking_status,
  payment_status
FROM bookings
WHERE booking_number = 'WE-20241225-TEST1';

-- Expected Result:
-- 1 row with booking_status = 'confirmed', payment_status = 'paid'

-- Step 3: Verify booking_tents junction table
SELECT 
  bt.id,
  bt.booking_id,
  bt.tent_id,
  bt.tent_type_id,
  bt.price_per_night,
  bt.nights,
  bt.subtotal,
  t.tent_number,
  tt.name as tent_type_name
FROM booking_tents bt
JOIN tents t ON bt.tent_id = t.id
JOIN tent_types tt ON bt.tent_type_id = tt.id
WHERE bt.booking_id = (
  SELECT id FROM bookings WHERE booking_number = 'WE-20241225-TEST1'
);

-- Expected Result:
-- 1 row with nights = 2, subtotal = 7998.00

-- Step 4: Verify payment record
SELECT 
  id,
  booking_id,
  razorpay_order_id,
  razorpay_payment_id,
  amount,
  status
FROM payments
WHERE razorpay_payment_id = 'pay_test_001';

-- Expected Result:
-- 1 row with amount = 7998.00, status = 'paid'

-- Step 5: Verify tent is no longer available for overlapping dates
SELECT COUNT(*) as available_tents
FROM tents t
WHERE t.tent_type_id = (SELECT id FROM tent_types WHERE slug = 'twin_sharing_small')
  AND t.status = 'available'
  AND t.id NOT IN (
    SELECT bt.tent_id
    FROM booking_tents bt
    JOIN bookings b ON bt.booking_id = b.id
    WHERE b.booking_status NOT IN ('cancelled', 'no_show')
      AND (b.check_in < '2024-12-27'::DATE AND b.check_out > '2024-12-25'::DATE)
  );

-- Expected Result:
-- Count should be 1 less than total available tents of this type
```

#### 2. Multiple Tent Types Booking Validation

**Test Scenario:** Create a booking with multiple tent types and verify correct storage.

```sql
-- Step 1: Create booking with 3 different tent types
SELECT create_booking_with_payment(
  'WE-20241226-TEST2',
  'Jane Smith',
  'jane@example.com',
  '+919876543211',
  '2024-12-26'::DATE,
  '2024-12-28'::DATE,
  '[
    {"tentTypeSlug": "twin_sharing_small", "quantity": 2, "pricePerNight": 3999.00},
    {"tentTypeSlug": "three_sharing_jungle", "quantity": 1, "pricePerNight": 7500.00},
    {"tentTypeSlug": "four_sharing_jungle", "quantity": 1, "pricePerNight": 8000.00}
  ]'::JSONB,
  10, -- adults
  2,  -- children
  47996.00, -- total: (3999*2 + 7500 + 8000) * 2 nights
  NULL,
  'order_test_002',
  'pay_test_002',
  'sig_test_002'
);

-- Step 2: Verify all tent types are assigned
SELECT 
  tt.slug as tent_type,
  tt.name as tent_type_name,
  COUNT(*) as quantity,
  bt.price_per_night,
  bt.nights,
  SUM(bt.subtotal) as total_for_type
FROM booking_tents bt
JOIN tent_types tt ON bt.tent_type_id = tt.id
WHERE bt.booking_id = (
  SELECT id FROM bookings WHERE booking_number = 'WE-20241226-TEST2'
)
GROUP BY tt.slug, tt.name, bt.price_per_night, bt.nights
ORDER BY tt.slug;

-- Expected Result:
-- 3 rows:
-- four_sharing_jungle  | 1 | 8000.00 | 2 | 16000.00
-- three_sharing_jungle | 1 | 7500.00 | 2 | 15000.00
-- twin_sharing_small   | 2 | 3999.00 | 2 | 15996.00

-- Step 3: Verify total tent count
SELECT COUNT(*) as total_tents_assigned
FROM booking_tents
WHERE booking_id = (
  SELECT id FROM bookings WHERE booking_number = 'WE-20241226-TEST2'
);

-- Expected Result: 4 tents (2 + 1 + 1)

-- Step 4: Verify total amount calculation
SELECT 
  b.total_amount,
  SUM(bt.subtotal) as calculated_total,
  b.total_amount = SUM(bt.subtotal) as amounts_match
FROM bookings b
JOIN booking_tents bt ON b.id = bt.booking_id
WHERE b.booking_number = 'WE-20241226-TEST2'
GROUP BY b.id, b.total_amount;

-- Expected Result: amounts_match = true
```

#### 3. Availability Checking Queries

**Test Scenario:** Check tent availability for various date ranges.

```sql
-- Query 1: Check available tents for specific type and dates
SELECT 
  tt.name as tent_type,
  tt.slug,
  COUNT(t.id) as total_tents,
  COUNT(t.id) FILTER (WHERE t.status = 'available') as available_tents,
  COUNT(t.id) FILTER (WHERE t.id IN (
    SELECT bt.tent_id
    FROM booking_tents bt
    JOIN bookings b ON bt.booking_id = b.id
    WHERE b.booking_status NOT IN ('cancelled', 'no_show')
      AND (b.check_in < '2024-12-27'::DATE AND b.check_out > '2024-12-25'::DATE)
  )) as booked_tents
FROM tent_types tt
LEFT JOIN tents t ON tt.id = t.tent_type_id
WHERE tt.slug = 'twin_sharing_small'
GROUP BY tt.id, tt.name, tt.slug;

-- Expected Result: Shows total, available, and booked tent counts

-- Query 2: Find all available tents for date range (all types)
SELECT 
  tt.slug as tent_type,
  tt.name,
  t.tent_number,
  t.status
FROM tents t
JOIN tent_types tt ON t.tent_type_id = tt.id
WHERE t.status = 'available'
  AND t.id NOT IN (
    SELECT bt.tent_id
    FROM booking_tents bt
    JOIN bookings b ON bt.booking_id = b.id
    WHERE b.booking_status NOT IN ('cancelled', 'no_show')
      AND (b.check_in < '2024-12-28'::DATE AND b.check_out > '2024-12-26'::DATE)
  )
ORDER BY tt.slug, t.tent_number;

-- Query 3: Check capacity limits
SELECT 
  tt.slug,
  tt.name,
  tt.capacity as max_guests_per_tent,
  COUNT(t.id) as total_tents,
  tt.capacity * COUNT(t.id) as total_capacity
FROM tent_types tt
LEFT JOIN tents t ON tt.id = t.tent_type_id AND t.status = 'available'
GROUP BY tt.id, tt.slug, tt.name, tt.capacity
ORDER BY tt.slug;

-- Expected Result: Shows capacity calculations for each tent type
```

#### 4. Payment Verification Queries

**Test Scenario:** Validate payment records and their relationships.

```sql
-- Query 1: Verify payment-booking relationship
SELECT 
  b.booking_number,
  b.customer_name,
  b.total_amount as booking_amount,
  p.amount as payment_amount,
  p.razorpay_order_id,
  p.razorpay_payment_id,
  p.status as payment_status,
  b.payment_status as booking_payment_status,
  p.amount = b.total_amount as amounts_match
FROM bookings b
JOIN payments p ON b.id = p.booking_id
WHERE b.booking_number LIKE 'WE-20241226-TEST%'
ORDER BY b.created_at DESC;

-- Expected Result: amounts_match = true for all rows

-- Query 2: Find duplicate payments (should be none)
SELECT 
  razorpay_payment_id,
  COUNT(*) as occurrence_count
FROM payments
GROUP BY razorpay_payment_id
HAVING COUNT(*) > 1;

-- Expected Result: 0 rows (no duplicates)

-- Query 3: Verify payment status consistency
SELECT 
  b.booking_number,
  b.booking_status,
  b.payment_status as booking_payment_status,
  p.status as payment_status,
  CASE 
    WHEN b.payment_status = 'paid' AND p.status = 'paid' THEN 'Consistent'
    ELSE 'Inconsistent'
  END as status_check
FROM bookings b
LEFT JOIN payments p ON b.id = p.booking_id
WHERE b.booking_status = 'confirmed';

-- Expected Result: All rows should show 'Consistent'
```

#### 5. Booking Status Transitions

**Test Scenario:** Test booking lifecycle from pending to confirmed to cancelled.

```sql
-- Step 1: Create pending booking (without payment)
INSERT INTO bookings (
  booking_number,
  customer_name,
  customer_email,
  customer_phone,
  check_in,
  check_out,
  adults,
  children,
  total_amount,
  booking_status,
  payment_status
) VALUES (
  'WE-20241227-TEST3',
  'Test User',
  'test@example.com',
  '+919876543212',
  '2024-12-27',
  '2024-12-29',
  2,
  0,
  7998.00,
  'pending_payment',
  'pending'
) RETURNING id;

-- Step 2: Verify pending status
SELECT booking_number, booking_status, payment_status
FROM bookings
WHERE booking_number = 'WE-20241227-TEST3';

-- Expected Result: booking_status = 'pending_payment', payment_status = 'pending'

-- Step 3: Update to confirmed (simulate payment completion)
UPDATE bookings
SET 
  booking_status = 'confirmed',
  payment_status = 'paid',
  updated_at = NOW()
WHERE booking_number = 'WE-20241227-TEST3';

-- Step 4: Verify confirmed status
SELECT booking_number, booking_status, payment_status
FROM bookings
WHERE booking_number = 'WE-20241227-TEST3';

-- Expected Result: booking_status = 'confirmed', payment_status = 'paid'

-- Step 5: Cancel booking
UPDATE bookings
SET 
  booking_status = 'cancelled',
  cancelled_at = NOW(),
  updated_at = NOW()
WHERE booking_number = 'WE-20241227-TEST3';

-- Step 6: Verify cancelled status
SELECT 
  booking_number, 
  booking_status, 
  payment_status,
  cancelled_at IS NOT NULL as has_cancellation_date
FROM bookings
WHERE booking_number = 'WE-20241227-TEST3';

-- Expected Result: booking_status = 'cancelled', has_cancellation_date = true
```

#### 6. Concurrent Booking Conflict Detection

**Test Scenario:** Simulate race condition and verify locking prevents double booking.

```sql
-- Query 1: Find overlapping bookings for same tent
SELECT 
  b1.booking_number as booking_1,
  b2.booking_number as booking_2,
  bt1.tent_id,
  t.tent_number,
  b1.check_in as booking_1_checkin,
  b1.check_out as booking_1_checkout,
  b2.check_in as booking_2_checkin,
  b2.check_out as booking_2_checkout,
  'CONFLICT!' as status
FROM bookings b1
JOIN booking_tents bt1 ON b1.id = bt1.booking_id
JOIN bookings b2 ON b2.id != b1.id
JOIN booking_tents bt2 ON b2.id = bt2.booking_id AND bt2.tent_id = bt1.tent_id
JOIN tents t ON bt1.tent_id = t.id
WHERE b1.booking_status NOT IN ('cancelled', 'no_show')
  AND b2.booking_status NOT IN ('cancelled', 'no_show')
  AND (b1.check_in < b2.check_out AND b1.check_out > b2.check_in);

-- Expected Result: 0 rows (no conflicts should exist)

-- Query 2: Test date overlap logic
WITH test_dates AS (
  SELECT 
    '2024-12-25'::DATE as check_in_1,
    '2024-12-27'::DATE as check_out_1,
    '2024-12-26'::DATE as check_in_2,
    '2024-12-28'::DATE as check_out_2
)
SELECT 
  check_in_1,
  check_out_1,
  check_in_2,
  check_out_2,
  (check_in_1 < check_out_2 AND check_out_1 > check_in_2) as has_overlap
FROM test_dates;

-- Expected Result: has_overlap = true

-- Query 3: Verify row-level locking (run in separate transactions)
-- Transaction 1:
BEGIN;
SELECT * FROM tents
WHERE tent_type_id = (SELECT id FROM tent_types WHERE slug = 'twin_sharing_small')
  AND status = 'available'
LIMIT 1
FOR UPDATE;
-- Keep transaction open...

-- Transaction 2 (should wait):
BEGIN;
SELECT * FROM tents
WHERE tent_type_id = (SELECT id FROM tent_types WHERE slug = 'twin_sharing_small')
  AND status = 'available'
LIMIT 1
FOR UPDATE;
-- This will wait until Transaction 1 commits/rollbacks

-- Commit Transaction 1:
COMMIT;
-- Now Transaction 2 can proceed
```

#### 7. Tent Assignment Integrity Checks

**Test Scenario:** Verify foreign key relationships and data integrity.

```sql
-- Query 1: Check for orphaned booking_tents records
SELECT bt.id, bt.booking_id, bt.tent_id
FROM booking_tents bt
LEFT JOIN bookings b ON bt.booking_id = b.id
WHERE b.id IS NULL;

-- Expected Result: 0 rows (no orphaned records)

-- Query 2: Check for invalid tent references
SELECT bt.id, bt.tent_id
FROM booking_tents bt
LEFT JOIN tents t ON bt.tent_id = t.id
WHERE t.id IS NULL;

-- Expected Result: 0 rows (all tent references valid)

-- Query 3: Verify tent_type_id consistency
SELECT 
  bt.id,
  bt.tent_type_id as booking_tent_type,
  t.tent_type_id as actual_tent_type,
  bt.tent_type_id = t.tent_type_id as types_match
FROM booking_tents bt
JOIN tents t ON bt.tent_id = t.id
WHERE bt.tent_type_id != t.tent_type_id;

-- Expected Result: 0 rows (all types should match)

-- Query 4: Check for duplicate tent assignments in same booking
SELECT 
  booking_id,
  tent_id,
  COUNT(*) as assignment_count
FROM booking_tents
GROUP BY booking_id, tent_id
HAVING COUNT(*) > 1;

-- Expected Result: 0 rows (no duplicates due to UNIQUE constraint)
```

#### 8. Guest Count Validation

**Test Scenario:** Ensure total guests match tent capacities.

```sql
-- Query 1: Validate guest count vs tent capacity
SELECT 
  b.booking_number,
  b.adults,
  b.children,
  b.adults + b.children as total_guests,
  SUM(tt.capacity) as total_capacity,
  (b.adults + b.children) <= SUM(tt.capacity) as capacity_sufficient,
  CASE 
    WHEN (b.adults + b.children) > SUM(tt.capacity) THEN 'OVER CAPACITY!'
    WHEN (b.adults + b.children) < SUM(tt.capacity) * 0.5 THEN 'Under-utilized'
    ELSE 'OK'
  END as capacity_status
FROM bookings b
JOIN booking_tents bt ON b.id = bt.booking_id
JOIN tent_types tt ON bt.tent_type_id = tt.id
WHERE b.booking_status NOT IN ('cancelled', 'no_show')
GROUP BY b.id, b.booking_number, b.adults, b.children
ORDER BY capacity_status DESC, b.booking_number;

-- Expected Result: All rows should have capacity_sufficient = true

-- Query 2: Find bookings exceeding capacity
SELECT 
  b.booking_number,
  b.adults + b.children as total_guests,
  SUM(tt.capacity) as total_capacity,
  (b.adults + b.children) - SUM(tt.capacity) as excess_guests
FROM bookings b
JOIN booking_tents bt ON b.id = bt.booking_id
JOIN tent_types tt ON bt.tent_type_id = tt.id
WHERE b.booking_status NOT IN ('cancelled', 'no_show')
GROUP BY b.id, b.booking_number, b.adults, b.children
HAVING (b.adults + b.children) > SUM(tt.capacity);

-- Expected Result: 0 rows (no over-capacity bookings)
```

#### 9. Date Range Validation

**Test Scenario:** Verify date constraints and validations.

```sql
-- Query 1: Check for invalid date ranges (check_out before check_in)
SELECT 
  booking_number,
  check_in,
  check_out,
  check_out - check_in as nights
FROM bookings
WHERE check_out <= check_in;

-- Expected Result: 0 rows (constraint should prevent this)

-- Query 2: Find bookings with past check-in dates
SELECT 
  booking_number,
  check_in,
  check_out,
  booking_status,
  CURRENT_DATE - check_in as days_past
FROM bookings
WHERE check_in < CURRENT_DATE
  AND booking_status = 'pending_payment'
ORDER BY check_in;

-- Expected Result: Should show any expired pending bookings

-- Query 3: Validate nights calculation
SELECT 
  b.booking_number,
  b.check_in,
  b.check_out,
  b.check_out - b.check_in as calculated_nights,
  bt.nights as stored_nights,
  (b.check_out - b.check_in) = bt.nights as nights_match
FROM bookings b
JOIN booking_tents bt ON b.id = bt.booking_id
GROUP BY b.id, b.booking_number, b.check_in, b.check_out, bt.nights
HAVING (b.check_out - b.check_in) != bt.nights;

-- Expected Result: 0 rows (all nights calculations should match)
```

#### 10. Pricing Calculation Verification

**Test Scenario:** Validate total amount calculations.

```sql
-- Query 1: Verify booking total matches sum of tent subtotals
SELECT 
  b.booking_number,
  b.total_amount as booking_total,
  SUM(bt.subtotal) as tents_subtotal,
  b.total_amount - SUM(bt.subtotal) as difference,
  ABS(b.total_amount - SUM(bt.subtotal)) < 0.01 as amounts_match
FROM bookings b
JOIN booking_tents bt ON b.id = bt.booking_id
GROUP BY b.id, b.booking_number, b.total_amount
HAVING ABS(b.total_amount - SUM(bt.subtotal)) >= 0.01;

-- Expected Result: 0 rows (all amounts should match)

-- Query 2: Verify subtotal calculations
SELECT 
  bt.id,
  b.booking_number,
  bt.price_per_night,
  bt.nights,
  bt.subtotal as stored_subtotal,
  bt.price_per_night * bt.nights as calculated_subtotal,
  bt.subtotal = (bt.price_per_night * bt.nights) as subtotal_correct
FROM booking_tents bt
JOIN bookings b ON bt.booking_id = b.id
WHERE bt.subtotal != (bt.price_per_night * bt.nights);

-- Expected Result: 0 rows (all subtotals should be correct)

-- Query 3: Compare booking amount with payment amount
SELECT 
  b.booking_number,
  b.total_amount as booking_amount,
  p.amount as payment_amount,
  b.total_amount - p.amount as difference
FROM bookings b
JOIN payments p ON b.id = p.booking_id
WHERE ABS(b.total_amount - p.amount) >= 0.01;

-- Expected Result: 0 rows (amounts should match)
```

### Comprehensive Seed Data

```sql
-- ============================================================================
-- SEED DATA FOR TESTING
-- ============================================================================

-- Clear existing test data
DELETE FROM booking_tents WHERE booking_id IN (
  SELECT id FROM bookings WHERE booking_number LIKE 'WE-TEST-%'
);
DELETE FROM payments WHERE booking_id IN (
  SELECT id FROM bookings WHERE booking_number LIKE 'WE-TEST-%'
);
DELETE FROM bookings WHERE booking_number LIKE 'WE-TEST-%';

-- Insert test tent types (if not exists)
INSERT INTO tent_types (name, slug, capacity, base_price, description, is_active)
VALUES 
  ('Twin Sharing Small Tent', 'twin_sharing_small', 2, 3999.00, 'Cozy twin sharing tent', true),
  ('Twin Sharing Semi Big Tent', 'twin_sharing_semi_big', 2, 4999.00, 'Spacious twin tent', true),
  ('Three Sharing Jungle Tent', 'three_sharing_jungle', 3, 7500.00, 'Comfortable three-person tent', true),
  ('Four Sharing Jungle Tent', 'four_sharing_jungle', 4, 8000.00, 'Large family tent', true),
  ('Six Sharing Deluxe Tent', 'six_sharing_deluxe', 6, 12000.00, 'Deluxe tent for large groups', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert test tents (multiple of each type)
INSERT INTO tents (tent_type_id, tent_number, status)
SELECT 
  tt.id,
  'TEST-' || tt.slug || '-' || generate_series,
  'available'
FROM tent_types tt
CROSS JOIN generate_series(1, 5)
WHERE tt.slug IN ('twin_sharing_small', 'twin_sharing_semi_big', 'three_sharing_jungle', 'four_sharing_jungle', 'six_sharing_deluxe')
ON CONFLICT DO NOTHING;

-- Test Booking 1: Single tent type, confirmed
INSERT INTO bookings (
  booking_number, customer_name, customer_email, customer_phone,
  check_in, check_out, adults, children, total_amount,
  booking_status, payment_status, created_at
) VALUES (
  'WE-TEST-001',
  'Alice Johnson',
  'alice@example.com',
  '+919876543210',
  CURRENT_DATE + INTERVAL '5 days',
  CURRENT_DATE + INTERVAL '7 days',
  2, 0, 7998.00,
  'confirmed', 'paid',
  NOW()
) RETURNING id;

-- Assign tent to booking 1
INSERT INTO booking_tents (booking_id, tent_id, tent_type_id, price_per_night, nights, subtotal)
SELECT 
  (SELECT id FROM bookings WHERE booking_number = 'WE-TEST-001'),
  t.id,
  t.tent_type_id,
  3999.00,
  2,
  7998.00
FROM tents t
WHERE t.tent_type_id = (SELECT id FROM tent_types WHERE slug = 'twin_sharing_small')
  AND t.tent_number LIKE 'TEST-%'
  AND t.status = 'available'
LIMIT 1;

-- Payment for booking 1
INSERT INTO payments (
  booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature,
  amount, currency, status, payment_method, paid_at
) VALUES (
  (SELECT id FROM bookings WHERE booking_number = 'WE-TEST-001'),
  'order_test_001',
  'pay_test_001',
  'sig_test_001',
  7998.00, 'INR', 'paid', 'razorpay', NOW()
);

-- Test Booking 2: Multiple tent types, confirmed
-- Calculation: (3999 * 3 nights * 2 tents) + (8000 * 3 nights * 1 tent) = 23994 + 24000 = 47994
INSERT INTO bookings (
  booking_number, customer_name, customer_email, customer_phone,
  check_in, check_out, adults, children, total_amount,
  booking_status, payment_status, created_at
) VALUES (
  'WE-TEST-002',
  'Bob Smith',
  'bob@example.com',
  '+919876543211',
  CURRENT_DATE + INTERVAL '10 days',
  CURRENT_DATE + INTERVAL '13 days',
  8, 2, 47994.00,
  'confirmed', 'paid',
  NOW()
);

-- Assign multiple tents to booking 2
INSERT INTO booking_tents (booking_id, tent_id, tent_type_id, price_per_night, nights, subtotal)
SELECT 
  (SELECT id FROM bookings WHERE booking_number = 'WE-TEST-002'),
  t.id,
  t.tent_type_id,
  3999.00,
  3,
  11997.00
FROM tents t
WHERE t.tent_type_id = (SELECT id FROM tent_types WHERE slug = 'twin_sharing_small')
  AND t.tent_number LIKE 'TEST-%'
  AND t.status = 'available'
  AND t.id NOT IN (SELECT tent_id FROM booking_tents)
LIMIT 2;

INSERT INTO booking_tents (booking_id, tent_id, tent_type_id, price_per_night, nights, subtotal)
SELECT 
  (SELECT id FROM bookings WHERE booking_number = 'WE-TEST-002'),
  t.id,
  t.tent_type_id,
  8000.00,
  3,
  24000.00
FROM tents t
WHERE t.tent_type_id = (SELECT id FROM tent_types WHERE slug = 'four_sharing_jungle')
  AND t.tent_number LIKE 'TEST-%'
  AND t.status = 'available'
LIMIT 1;

-- Payment for booking 2
INSERT INTO payments (
  booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature,
  amount, currency, status, payment_method, paid_at
) VALUES (
  (SELECT id FROM bookings WHERE booking_number = 'WE-TEST-002'),
  'order_test_002',
  'pay_test_002',
  'sig_test_002',
  47994.00, 'INR', 'paid', 'razorpay', NOW()
);

-- Test Booking 3: Pending payment
INSERT INTO bookings (
  booking_number, customer_name, customer_email, customer_phone,
  check_in, check_out, adults, children, total_amount,
  booking_status, payment_status, created_at
) VALUES (
  'WE-TEST-003',
  'Charlie Brown',
  'charlie@example.com',
  '+919876543212',
  CURRENT_DATE + INTERVAL '15 days',
  CURRENT_DATE + INTERVAL '17 days',
  3, 1, 15000.00,
  'pending_payment', 'pending',
  NOW()
);

-- Test Booking 4: Cancelled booking
INSERT INTO bookings (
  booking_number, customer_name, customer_email, customer_phone,
  check_in, check_out, adults, children, total_amount,
  booking_status, payment_status, cancelled_at, created_at
) VALUES (
  'WE-TEST-004',
  'Diana Prince',
  'diana@example.com',
  '+919876543213',
  CURRENT_DATE + INTERVAL '20 days',
  CURRENT_DATE + INTERVAL '22 days',
  2, 0, 7998.00,
  'cancelled', 'refunded',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '2 days'
);

-- Test Booking 5: Overlapping dates (should fail if attempted)
-- This demonstrates date conflict detection
INSERT INTO bookings (
  booking_number, customer_name, customer_email, customer_phone,
  check_in, check_out, adults, children, total_amount,
  booking_status, payment_status, created_at
) VALUES (
  'WE-TEST-005',
  'Eve Adams',
  'eve@example.com',
  '+919876543214',
  CURRENT_DATE + INTERVAL '6 days',
  CURRENT_DATE + INTERVAL '8 days',
  2, 0, 7998.00,
  'confirmed', 'paid',
  NOW()
);

-- Test Booking 6: Maximum capacity scenario
INSERT INTO bookings (
  booking_number, customer_name, customer_email, customer_phone,
  check_in, check_out, adults, children, total_amount,
  booking_status, payment_status, created_at
) VALUES (
  'WE-TEST-006',
  'Frank Castle',
  'frank@example.com',
  '+919876543215',
  CURRENT_DATE + INTERVAL '25 days',
  CURRENT_DATE + INTERVAL '27 days',
  6, 0, 24000.00,
  'confirmed', 'paid',
  NOW()
);

-- Assign six-sharing tent
INSERT INTO booking_tents (booking_id, tent_id, tent_type_id, price_per_night, nights, subtotal)
SELECT 
  (SELECT id FROM bookings WHERE booking_number = 'WE-TEST-006'),
  t.id,
  t.tent_type_id,
  12000.00,
  2,
  24000.00
FROM tents t
WHERE t.tent_type_id = (SELECT id FROM tent_types WHERE slug = 'six_sharing_deluxe')
  AND t.tent_number LIKE 'TEST-%'
  AND t.status = 'available'
LIMIT 1;

-- Payment for booking 6
INSERT INTO payments (
  booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature,
  amount, currency, status, payment_method, paid_at
) VALUES (
  (SELECT id FROM bookings WHERE booking_number = 'WE-TEST-006'),
  'order_test_006',
  'pay_test_006',
  'sig_test_006',
  24000.00, 'INR', 'paid', 'razorpay', NOW()
);

-- Verify seed data
SELECT 
  'Bookings Created' as metric,
  COUNT(*) as count
FROM bookings
WHERE booking_number LIKE 'WE-TEST-%'
UNION ALL
SELECT 
  'Tent Assignments',
  COUNT(*)
FROM booking_tents bt
JOIN bookings b ON bt.booking_id = b.id
WHERE b.booking_number LIKE 'WE-TEST-%'
UNION ALL
SELECT 
  'Payments Recorded',
  COUNT(*)
FROM payments p
JOIN bookings b ON p.booking_id = b.id
WHERE b.booking_number LIKE 'WE-TEST-%';
```

### SQL Query Examples

#### Check Available Tents for Date Range

```sql
-- Find all available tents for specific dates
SELECT 
  tt.slug,
  tt.name,
  tt.capacity,
  tt.base_price,
  COUNT(t.id) as available_count
FROM tent_types tt
LEFT JOIN tents t ON tt.id = t.tent_type_id
WHERE t.status = 'available'
  AND t.id NOT IN (
    SELECT bt.tent_id
    FROM booking_tents bt
    JOIN bookings b ON bt.booking_id = b.id
    WHERE b.booking_status NOT IN ('cancelled', 'no_show')
      AND (
        b.check_in < '2024-12-28'::DATE 
        AND b.check_out > '2024-12-26'::DATE
      )
  )
GROUP BY tt.id, tt.slug, tt.name, tt.capacity, tt.base_price
ORDER BY tt.slug;

-- Expected Result: List of tent types with available counts
```

#### Retrieve Complete Booking Details

```sql
-- Get complete booking information with all related data
SELECT 
  b.booking_number,
  b.customer_name,
  b.customer_email,
  b.customer_phone,
  b.check_in,
  b.check_out,
  b.check_out - b.check_in as nights,
  b.adults,
  b.children,
  b.total_amount,
  b.booking_status,
  b.payment_status,
  json_agg(
    json_build_object(
      'tent_type', tt.name,
      'tent_number', t.tent_number,
      'price_per_night', bt.price_per_night,
      'subtotal', bt.subtotal
    )
  ) as tents,
  p.razorpay_payment_id,
  p.paid_at
FROM bookings b
LEFT JOIN booking_tents bt ON b.id = bt.booking_id
LEFT JOIN tents t ON bt.tent_id = t.id
LEFT JOIN tent_types tt ON bt.tent_type_id = tt.id
LEFT JOIN payments p ON b.id = p.booking_id
WHERE b.booking_number = 'WE-TEST-002'
GROUP BY b.id, b.booking_number, b.customer_name, b.customer_email, 
         b.customer_phone, b.check_in, b.check_out, b.adults, b.children,
         b.total_amount, b.booking_status, b.payment_status,
         p.razorpay_payment_id, p.paid_at;

-- Expected Result: Complete booking details with tent array
```

#### Calculate Occupancy Rates

```sql
-- Calculate occupancy rate for date range
WITH date_range AS (
  SELECT 
    generate_series(
      CURRENT_DATE,
      CURRENT_DATE + INTERVAL '30 days',
      INTERVAL '1 day'
    )::DATE as date
),
daily_occupancy AS (
  SELECT 
    dr.date,
    COUNT(DISTINCT bt.tent_id) as occupied_tents,
    (SELECT COUNT(*) FROM tents WHERE status = 'available') as total_tents
  FROM date_range dr
  LEFT JOIN bookings b ON dr.date >= b.check_in AND dr.date < b.check_out
  LEFT JOIN booking_tents bt ON b.id = bt.booking_id
  WHERE b.booking_status NOT IN ('cancelled', 'no_show') OR b.id IS NULL
  GROUP BY dr.date
)
SELECT 
  date,
  occupied_tents,
  total_tents,
  ROUND((occupied_tents::DECIMAL / NULLIF(total_tents, 0)) * 100, 2) as occupancy_percentage
FROM daily_occupancy
ORDER BY date;

-- Expected Result: Daily occupancy percentages
```

#### Find Conflicting Bookings

```sql
-- Find any bookings with overlapping dates for same tent
SELECT 
  b1.booking_number as booking_1,
  b2.booking_number as booking_2,
  t.tent_number,
  tt.name as tent_type,
  b1.check_in as b1_checkin,
  b1.check_out as b1_checkout,
  b2.check_in as b2_checkin,
  b2.check_out as b2_checkout
FROM bookings b1
JOIN booking_tents bt1 ON b1.id = bt1.booking_id
JOIN tents t ON bt1.tent_id = t.id
JOIN tent_types tt ON t.tent_type_id = tt.id
JOIN booking_tents bt2 ON bt2.tent_id = bt1.tent_id AND bt2.booking_id != bt1.booking_id
JOIN bookings b2 ON bt2.booking_id = b2.id
WHERE b1.booking_status NOT IN ('cancelled', 'no_show')
  AND b2.booking_status NOT IN ('cancelled', 'no_show')
  AND (b1.check_in < b2.check_out AND b1.check_out > b2.check_in)
ORDER BY t.tent_number, b1.check_in;

-- Expected Result: 0 rows (no conflicts should exist)
```

#### Validate Data Integrity

```sql
-- Comprehensive data integrity check
WITH integrity_checks AS (
  -- Check 1: Orphaned booking_tents
  SELECT 'Orphaned booking_tents' as check_name, COUNT(*) as issue_count
  FROM booking_tents bt
  LEFT JOIN bookings b ON bt.booking_id = b.id
  WHERE b.id IS NULL
  
  UNION ALL
  
  -- Check 2: Mismatched amounts
  SELECT 'Booking/Payment amount mismatch', COUNT(*)
  FROM bookings b
  JOIN payments p ON b.id = p.booking_id
  WHERE ABS(b.total_amount - p.amount) >= 0.01
  
  UNION ALL
  
  -- Check 3: Invalid subtotals
  SELECT 'Invalid tent subtotals', COUNT(*)
  FROM booking_tents
  WHERE subtotal != (price_per_night * nights)
  
  UNION ALL
  
  -- Check 4: Duplicate tent assignments
  SELECT 'Duplicate tent assignments', COUNT(*)
  FROM (
    SELECT booking_id, tent_id, COUNT(*) as cnt
    FROM booking_tents
    GROUP BY booking_id, tent_id
    HAVING COUNT(*) > 1
  ) duplicates
  
  UNION ALL
  
  -- Check 5: Over-capacity bookings
  SELECT 'Over-capacity bookings', COUNT(*)
  FROM (
    SELECT b.id
    FROM bookings b
    JOIN booking_tents bt ON b.id = bt.booking_id
    JOIN tent_types tt ON bt.tent_type_id = tt.id
    WHERE b.booking_status NOT IN ('cancelled', 'no_show')
    GROUP BY b.id, b.adults, b.children
    HAVING (b.adults + b.children) > SUM(tt.capacity)
  ) over_capacity
)
SELECT 
  check_name,
  issue_count,
  CASE WHEN issue_count = 0 THEN '✓ PASS' ELSE '✗ FAIL' END as status
FROM integrity_checks
ORDER BY issue_count DESC, check_name;

-- Expected Result: All checks should show 0 issues
```

#### Test Stored Procedure

```sql
-- Test create_booking_with_payment with various inputs

-- Test 1: Single tent type
SELECT create_booking_with_payment(
  'WE-TEST-SP-001',
  'Test User 1',
  'test1@example.com',
  '+919876543220',
  (CURRENT_DATE + INTERVAL '30 days')::DATE,
  (CURRENT_DATE + INTERVAL '32 days')::DATE,
  '[{"tentTypeSlug": "twin_sharing_small", "quantity": 1, "pricePerNight": 3999.00}]'::JSONB,
  2, 0, 7998.00, NULL,
  'order_sp_test_001', 'pay_sp_test_001', 'sig_sp_test_001'
);

-- Test 2: Multiple tent types
SELECT create_booking_with_payment(
  'WE-TEST-SP-002',
  'Test User 2',
  'test2@example.com',
  '+919876543221',
  (CURRENT_DATE + INTERVAL '35 days')::DATE,
  (CURRENT_DATE + INTERVAL '37 days')::DATE,
  '[
    {"tentTypeSlug": "twin_sharing_small", "quantity": 2, "pricePerNight": 3999.00},
    {"tentTypeSlug": "four_sharing_jungle", "quantity": 1, "pricePerNight": 8000.00}
  ]'::JSONB,
  8, 0, 31996.00, 'Group booking',
  'order_sp_test_002', 'pay_sp_test_002', 'sig_sp_test_002'
);

-- Test 3: Should fail - insufficient tents
SELECT create_booking_with_payment(
  'WE-TEST-SP-003',
  'Test User 3',
  'test3@example.com',
  '+919876543222',
  (CURRENT_DATE + INTERVAL '40 days')::DATE,
  (CURRENT_DATE + INTERVAL '42 days')::DATE,
  '[{"tentTypeSlug": "twin_sharing_small", "quantity": 100, "pricePerNight": 3999.00}]'::JSONB,
  200, 0, 799800.00, NULL,
  'order_sp_test_003', 'pay_sp_test_003', 'sig_sp_test_003'
);
-- Expected: Error with "insufficient_tents"

-- Test 4: Should fail - duplicate payment
SELECT create_booking_with_payment(
  'WE-TEST-SP-004',
  'Test User 4',
  'test4@example.com',
  '+919876543223',
  (CURRENT_DATE + INTERVAL '45 days')::DATE,
  (CURRENT_DATE + INTERVAL '47 days')::DATE,
  '[{"tentTypeSlug": "twin_sharing_small", "quantity": 1, "pricePerNight": 3999.00}]'::JSONB,
  2, 0, 7998.00, NULL,
  'order_sp_test_001', 'pay_sp_test_001', 'sig_sp_test_001'  -- Reusing payment IDs
);
-- Expected: Error with "duplicate_payment"
```

#### Cleanup Test Data

```sql
-- Remove all test data
BEGIN;

-- Delete in correct order (respecting foreign keys)
DELETE FROM booking_tents 
WHERE booking_id IN (
  SELECT id FROM bookings WHERE booking_number LIKE 'WE-TEST-%'
);

DELETE FROM payments 
WHERE booking_id IN (
  SELECT id FROM bookings WHERE booking_number LIKE 'WE-TEST-%'
);

DELETE FROM bookings 
WHERE booking_number LIKE 'WE-TEST-%';

DELETE FROM tents 
WHERE tent_number LIKE 'TEST-%';

-- Verify cleanup
SELECT 
  'Test bookings remaining' as metric,
  COUNT(*) as count
FROM bookings
WHERE booking_number LIKE 'WE-TEST-%'
UNION ALL
SELECT 
  'Test tents remaining',
  COUNT(*)
FROM tents
WHERE tent_number LIKE 'TEST-%';

-- Expected Result: Both counts should be 0

COMMIT;
```

### Test Execution Checklist

- [ ] Run all database test scenarios
- [ ] Verify seed data is inserted correctly
- [ ] Execute availability checking queries
- [ ] Test payment verification queries
- [ ] Validate booking status transitions
- [ ] Check for concurrent booking conflicts
- [ ] Verify tent assignment integrity
- [ ] Validate guest count calculations
- [ ] Test date range validations
- [ ] Verify pricing calculations
- [ ] Test stored procedure with various inputs
- [ ] Run data integrity checks
- [ ] Clean up test data after testing
