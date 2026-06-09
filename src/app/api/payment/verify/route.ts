import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '../../../../lib/payment/razorpay';
import { verifyPaymentSchema } from '../../../../validations/payment.schema';

/**
 * POST /api/payment/verify
 * 
 * Verifies Razorpay payment signature to ensure payment authenticity.
 * This endpoint should be called after receiving payment response from Razorpay checkout.
 * 
 * @param request - Contains razorpay_order_id, razorpay_payment_id, razorpay_signature
 * @returns Success/failure response with verification status
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = verifyPaymentSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Invalid payment verification data',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = validationResult.data;

    // Verify payment signature
    const isValid = verifyPaymentSignature({

        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    }
    );

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid signature',
          message: 'Payment signature verification failed',
        },
        { status: 400 }
      );
    }

    // Payment verified successfully
    return NextResponse.json(
      {
        success: true,
        data: {
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          verified: true,
        },
        message: 'Payment verified successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Payment verification error:', error);

    // Handle JSON parsing errors
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
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred during payment verification',
      },
      { status: 500 }
    );
  }
}

// Made with Bob
