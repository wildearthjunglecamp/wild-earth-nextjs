# Payment API Documentation

## Overview

This API handles Razorpay payment integration for the Wild Earth Jungle Camp booking system.

## Endpoints

### 1. Create Razorpay Order

```
POST /api/payment/create-order
```

Creates a Razorpay order that can be used to initiate payment.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | number | Yes | Amount in INR (e.g., 3999.00) |
| `currency` | string | No | Currency code (default: INR) |
| `receipt` | string | No | Receipt identifier (max 40 chars) |
| `notes` | object | No | Additional notes as key-value pairs |

**Validation Rules:**
- **amount**: 
  - Must be positive
  - Minimum: ₹1
  - Maximum: ₹500,000
  - Can have at most 2 decimal places
  - Automatically converted to paise (1 INR = 100 paise)

- **currency**: 
  - Must be 3 characters
  - Uppercase (e.g., INR, USD)

- **receipt**: 
  - Maximum 40 characters
  - Used for tracking purposes

- **notes**: 
  - Key-value pairs
  - Useful for storing booking ID, customer info, etc.

#### Example Request

```json
{
  "amount": 3999.00,
  "currency": "INR",
  "receipt": "booking_12345",
  "notes": {
    "bookingId": "uuid-here",
    "customerEmail": "customer@example.com",
    "tentType": "Twin Sharing Small Tent"
  }
}
```

#### Success Response (201 Created)

```json
{
  "success": true,
  "data": {
    "orderId": "order_MNxyz123456789",
    "amount": 399900,
    "amountInINR": 3999.00,
    "currency": "INR",
    "receipt": "booking_12345",
    "status": "created",
    "createdAt": 1717843200
  },
  "message": "Order created successfully"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `orderId` | string | Razorpay order ID (use this for payment) |
| `amount` | number | Amount in paise (399900 = ₹3999) |
| `amountInINR` | number | Amount in INR (3999.00) |
| `currency` | string | Currency code |
| `receipt` | string | Receipt identifier |
| `status` | string | Order status (usually "created") |
| `createdAt` | number | Unix timestamp |

#### Error Responses

**Validation Error (400 Bad Request)**

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid input data",
  "details": [
    {
      "field": "amount",
      "message": "Amount must be positive"
    }
  ]
}
```

**Invalid JSON (400 Bad Request)**

```json
{
  "success": false,
  "error": "Invalid JSON",
  "message": "Request body must be valid JSON"
}
```

**Configuration Error (500 Internal Server Error)**

```json
{
  "success": false,
  "error": "Configuration error",
  "message": "Payment gateway is not properly configured"
}
```

**Payment Gateway Error (502 Bad Gateway)**

```json
{
  "success": false,
  "error": "Payment gateway error",
  "message": "Failed to create Razorpay order"
}
### 2. Verify Payment

```
POST /api/payment/verify
```

Verifies the authenticity of a Razorpay payment using signature verification.

#### Request

**Headers:**
```
Content-Type: application/json
```

**Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `razorpay_order_id` | string | Yes | Order ID from Razorpay |
| `razorpay_payment_id` | string | Yes | Payment ID from Razorpay |
| `razorpay_signature` | string | Yes | Signature from Razorpay |

**Validation Rules:**
- All fields are required
- Must be non-empty strings
- Signature must match expected format

#### Example Request

```json
{
  "razorpay_order_id": "order_MNxyz123456789",
  "razorpay_payment_id": "pay_ABCxyz987654321",
  "razorpay_signature": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0"
}
```

#### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "orderId": "order_MNxyz123456789",
    "paymentId": "pay_ABCxyz987654321",
    "verified": true
  },
  "message": "Payment verified successfully"
}
```

#### Error Responses

**Invalid Signature (400 Bad Request)**

```json
{
  "success": false,
  "error": "Invalid signature",
  "message": "Payment signature verification failed"
}
```

**Validation Error (400 Bad Request)**

```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid payment verification data",
  "details": [
    {
      "field": "razorpay_signature",
      "message": "Required"
    }
  ]
}
```

### 3. Payment Webhook

```
POST /api/webhooks/payment
```

Receives real-time payment notifications from Razorpay.

**Important:** This endpoint is called by Razorpay, not your frontend.

#### Supported Events

| Event | Description |
|-------|-------------|
| `payment.authorized` | Payment authorized by customer |
| `payment.captured` | Payment captured successfully |
| `payment.failed` | Payment attempt failed |
| `order.paid` | Order fully paid |

#### Request

**Headers:**
```
x-razorpay-signature: <webhook_signature>
Content-Type: application/json
```

**Body:** Razorpay webhook payload (varies by event)

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Note:** Always returns 200 to acknowledge receipt, even if processing fails.

#### Webhook Configuration

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/payment`
3. Select events: `payment.authorized`, `payment.captured`, `payment.failed`, `order.paid`
4. Copy webhook secret and add to `.env.local`:

```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

```

## Usage Examples

### JavaScript/TypeScript (fetch)

```typescript
async function createPaymentOrder(amount: number, bookingId: string) {
  try {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: `booking_${bookingId}`,
        notes: {
          bookingId,
          timestamp: new Date().toISOString(),
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create order');
    }

    return data.data;
  } catch (error) {
    console.error('Error creating payment order:', error);
    throw error;
  }
}

// Usage
const order = await createPaymentOrder(3999.00, 'uuid-booking-id');
console.log('Order ID:', order.orderId);
```

### React Component with Razorpay Checkout

```typescript
'use client';

import { useState } from 'react';
import Script from 'next/script';

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentButton({ amount, bookingDetails }: any) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Step 1: Create Razorpay order
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          receipt: `booking_${bookingDetails.id}`,
          notes: {
            bookingId: bookingDetails.id,
            customerEmail: bookingDetails.email,
          },
        }),
      });

      const { data } = await response.json();

      // Step 2: Initialize Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: 'Wild Earth Jungle Camp',
        description: 'Campsite Booking',
        order_id: data.orderId,
        handler: async (response) => {
          // Step 3: Verify payment on backend
          await verifyPayment(response);
        },
        prefill: {
          name: bookingDetails.name,
          email: bookingDetails.email,
          contact: bookingDetails.phone,
        },
        theme: {
          color: '#10b981',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (response: any) => {
    // Verify payment signature on backend
    const verifyResponse = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(response),
    });

    const result = await verifyResponse.json();

    if (result.success) {
      // Payment successful
      window.location.href = '/booking-success';
    } else {
      alert('Payment verification failed');
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-primary text-white px-6 py-3 rounded-lg"
      >
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </>
  );
}
```

### cURL

```bash
curl -X POST http://localhost:3000/api/payment/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 3999.00,
    "currency": "INR",
    "receipt": "booking_12345",
    "notes": {
      "bookingId": "uuid-here",
      "customerEmail": "customer@example.com"
    }
  }'
```

### Python

```python
import requests
import json

def create_payment_order(amount, booking_id, customer_email):
    url = "http://localhost:3000/api/payment/create-order"
    
    payload = {
        "amount": amount,
        "currency": "INR",
        "receipt": f"booking_{booking_id}",
        "notes": {
            "bookingId": booking_id,
            "customerEmail": customer_email
        }
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, json=payload, headers=headers)
    
    if response.status_code == 201:
        return response.json()
    else:
        raise Exception(f"Error: {response.json().get('message')}")

# Usage
order = create_payment_order(3999.00, "uuid-booking-id", "customer@example.com")
print(f"Order ID: {order['data']['orderId']}")
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Public key for frontend
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

**Important:**
- Use test keys for development (`rzp_test_`)
- Use live keys for production (`rzp_live_`)
- Never expose `RAZORPAY_KEY_SECRET` to the frontend

## Payment Flow

### Complete Payment Flow

```
1. User fills booking form
   ↓
2. Frontend calls /api/payment/create-order
   ↓
3. Backend creates Razorpay order
   ↓
4. Backend returns order_id
   ↓
5. Frontend initializes Razorpay checkout with order_id
   ↓
6. User completes payment on Razorpay
   ↓
7. Razorpay calls frontend handler with payment details
   ↓
8. Frontend calls /api/payment/verify
   ↓
9. Backend verifies payment signature
   ↓
10. Backend updates booking status
   ↓
11. Redirect to success page
```

## Amount Conversion

**Important:** Razorpay uses paise (smallest currency unit).

- **1 INR = 100 paise**
- **₹3,999 = 399,900 paise**

The API automatically handles conversion:
- **Input:** Amount in INR (3999.00)
- **Stored:** Amount in paise (399900)
- **Display:** Amount in INR (₹3,999)

```typescript
// Conversion functions
function convertToPaise(amountInINR: number): number {
  return Math.round(amountInINR * 100);
}

function convertToINR(amountInPaise: number): number {
  return amountInPaise / 100;
}

// Example
const inr = 3999.00;
const paise = convertToPaise(inr); // 399900
const backToInr = convertToINR(paise); // 3999.00
```

## Error Handling

### Common Errors

1. **Invalid Amount**
   - Negative amount
   - Amount too small (< ₹1)
   - Amount too large (> ₹500,000)
   - More than 2 decimal places

2. **Configuration Errors**
   - Missing Razorpay credentials
   - Invalid API keys

3. **Network Errors**
   - Razorpay API timeout
   - Connection issues

4. **Validation Errors**
   - Invalid currency code
   - Receipt too long (> 40 chars)

### Error Handling Example

```typescript
try {
  const order = await createPaymentOrder(amount, bookingId);
  // Proceed with payment
} catch (error) {
  if (error.message.includes('Validation error')) {
    // Handle validation errors
    alert('Please check your input');
  } else if (error.message.includes('Configuration error')) {
    // Handle configuration errors
    alert('Payment system is temporarily unavailable');
  } else if (error.message.includes('Payment gateway error')) {
    // Handle Razorpay errors
    alert('Payment gateway error. Please try again');
  } else {
    // Handle unexpected errors
    alert('An unexpected error occurred');
  }
}
```

## Testing

### Test Mode

Use Razorpay test keys for development:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

### Test Cards

Razorpay provides test cards for testing:

**Success:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card: 4000 0000 0000 0002
- CVV: Any 3 digits
- Expiry: Any future date

### Test Cases

```typescript
describe('POST /api/payment/create-order', () => {
  it('should create order for valid amount', async () => {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 3999.00 }),
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.orderId).toBeDefined();
  });

  it('should reject negative amount', async () => {
    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: -100 }),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});
```

## Security Considerations

1. **Never expose secret key** - Keep `RAZORPAY_KEY_SECRET` server-side only
2. **Verify payments** - Always verify payment signature on backend
3. **Use HTTPS** - Always use HTTPS in production
4. **Validate amounts** - Validate amounts on both frontend and backend
5. **Log transactions** - Log all payment attempts for audit trail
6. **Handle webhooks** - Implement webhook handler for payment notifications

## Webhook Integration

Create a webhook endpoint to receive payment notifications:

```typescript
// /api/payment/webhook/route.ts
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-razorpay-signature');
  const body = await request.text();
  
  // Verify webhook signature
  const isValid = verifyWebhookSignature(body, signature);
  
  if (isValid) {
    const event = JSON.parse(body);
    // Handle payment events
    await handlePaymentEvent(event);
  }
  
  return NextResponse.json({ status: 'ok' });
}
```

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Enable HTTPS
- [ ] Implement webhook handler
- [ ] Add rate limiting
- [ ] Set up monitoring and alerts
- [ ] Test payment flow end-to-end
- [ ] Implement refund handling
- [ ] Add transaction logging
- [ ] Configure proper error tracking
- [ ] Test with real payment methods