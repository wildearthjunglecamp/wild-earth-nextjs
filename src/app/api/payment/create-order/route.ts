/**
 * Create Razorpay Order API Route
 * POST /api/payment/create-order
 * 
 * Creates a Razorpay order for payment processing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder, convertToPaise } from '../../../../lib/payment/razorpay';
import { createOrderSchema } from '../../../../validations/payment.schema';
import { ZodError } from 'zod';

/**
 * POST /api/payment/create-order
 * Create a new Razorpay order
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validatedData = createOrderSchema.parse(body);

    // Create Razorpay order
    const order = await createRazorpayOrder({
      amount: validatedData.amount,
      currency: validatedData.currency || 'INR',
      receipt: validatedData.receipt,
      notes: validatedData.notes,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount, // Amount in paise
          amountInINR: validatedData.amount, // Amount in INR
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          createdAt: order.created_at,
        },
        message: 'Order created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Invalid input data',
          details: formattedErrors,
        },
        { status: 400 }
      );
    }

    // Handle Razorpay errors
    if (error instanceof Error) {
      // Check if it's a Razorpay-specific error
      if (error.message.includes('Razorpay')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Payment gateway error',
            message: error.message,
          },
          { status: 502 } // Bad Gateway
        );
      }

      // Check for configuration errors
      if (error.message.includes('credentials not configured')) {
        console.error('Razorpay configuration error:', error);
        return NextResponse.json(
          {
            success: false,
            error: 'Configuration error',
            message: 'Payment gateway is not properly configured',
          },
          { status: 500 }
        );
      }
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in create-order API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payment/create-order
 * Return API documentation
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/payment/create-order',
      method: 'POST',
      description: 'Create a Razorpay order for payment processing',
      requestBody: {
        amount: 'number (required) - Amount in INR (e.g., 3999.00)',
        currency: 'string (optional) - Currency code (default: INR)',
        receipt: 'string (optional) - Receipt identifier (max 40 chars)',
        notes: 'object (optional) - Additional notes as key-value pairs',
      },
      example: {
        amount: 3999.00,
        currency: 'INR',
        receipt: 'booking_12345',
        notes: {
          bookingId: 'uuid',
          customerEmail: 'customer@example.com',
        },
      },
      response: {
        success: 'boolean',
        data: {
          orderId: 'string - Razorpay order ID',
          amount: 'number - Amount in paise',
          amountInINR: 'number - Amount in INR',
          currency: 'string - Currency code',
          receipt: 'string - Receipt identifier',
          status: 'string - Order status',
          createdAt: 'number - Unix timestamp',
        },
      },
      notes: [
        'Amount is automatically converted to paise (1 INR = 100 paise)',
        'Minimum amount: ₹1',
        'Maximum amount: ₹500,000',
        'Amount can have at most 2 decimal places',
      ],
    },
    { status: 200 }
  );
}

/**
 * OPTIONS /api/payment/create-order
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

// Made with Bob
