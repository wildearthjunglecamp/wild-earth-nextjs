import { NextRequest, NextResponse } from 'next/server';
import { createBookingWithPayment } from '../../../../services/booking.service';
import { createBookingSchema } from '../../../../validations/booking.schema';
import { sendBookingConfirmationEmail } from '@/src/lib/email/sendBookingEmails';
import { resend } from '@/src/lib/email/resend';
import { EmailTemplate } from '@/src/components/email/confirmationEmailTemplate';

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

    // Return success response and confirmation email
try {

  if(result.data){
    const { data, error } = await resend.emails.send({
      from: 'Wildearth Jungle Camp <onboarding@resend.dev>',
      to: [bookingInput.customerEmail],
      subject: 'Your Wild Earth Jungle Camp Booking is Confirmed 🌿',
      react: EmailTemplate(
        {
          to: bookingInput.customerEmail, 
          name: bookingInput.customerName, 
          bookingId: result.data.bookingNumber, 
          checkIn: bookingInput.checkIn, 
          checkOut: bookingInput.checkOut, 
          tent: result.data.tentTypes.map(t => `${t.tentTypeName} (x${t.quantity})`).join(', '), 
          amount: bookingInput.totalAmount
        })
    })
  }
} catch (error) {
  // Log but don't fail the booking if email fails
  console.error('Failed to send confirmation email:', error);
}
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
