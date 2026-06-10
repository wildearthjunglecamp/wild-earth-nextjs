import { NextRequest, NextResponse } from 'next/server';
import { createBookingWithPayment } from '../../../../services/booking.service';
import { createBookingSchema } from '../../../../validations/booking.schema';

/**
 * POST /api/bookings/create
 * 
 * Creates a new booking with payment verification and atomic transaction.
 * 
 * This endpoint:
 * 1. Validates input data
 * 2. Verifies Razorpay payment signature
 * 3. Checks tent availability
 * 4. Assigns available tents
 * 5. Creates booking record
 * 6. Creates payment record
 * 
 * All operations are performed atomically in a single PostgreSQL transaction.
 * 
 * @param request - Contains booking details and payment verification data
 * @returns Created booking with assigned tents or error
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input
    const validationResult = createBookingSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Invalid booking data',
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    const bookingInput = validationResult.data;

    // Create booking with payment verification
    const result = await createBookingWithPayment(bookingInput);

    if (!result.success) {
      // Determine appropriate status code based on error type
      let statusCode = 500;

      if (result.error === 'Payment verification failed') {
        statusCode = 400;
      } else if (result.error === 'Insufficient tents available') {
        statusCode = 409; // Conflict
      } else if (result.error === 'Duplicate payment') {
        statusCode = 409; // Conflict
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          message: result.details || result.error,
        },
        { status: statusCode }
      );
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        message: 'Booking created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Booking creation error:', error);

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
        message: 'An unexpected error occurred while creating the booking',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings/create
 * 
 * Method not allowed - this endpoint only accepts POST requests
 */
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests',
    },
    { status: 405 }
  );
}

// Made with Bob
