import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '../../../../lib/payment/razorpay';
import { createClient } from '../../../../lib/supabase/server';

/**
 * POST /api/webhooks/payment
 * 
 * Handles Razorpay webhook events for payment notifications.
 * This endpoint receives real-time updates about payment status changes.
 * 
 * Supported events:
 * - payment.authorized: Payment authorized by customer
 * - payment.captured: Payment captured successfully
 * - payment.failed: Payment failed
 * - order.paid: Order fully paid
 * 
 * @param request - Webhook payload from Razorpay
 * @returns 200 OK response to acknowledge receipt
 */
export async function POST(request: NextRequest) {
  try {
    // Get webhook signature from headers
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('Webhook signature missing');
      return NextResponse.json(
        {
          success: false,
          error: 'Missing signature',
          message: 'Webhook signature is required',
        },
        { status: 400 }
      );
    }

    // Get raw body for signature verification
    const body = await request.text();

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature);

    if (!isValid) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid signature',
          message: 'Webhook signature verification failed',
        },
        { status: 400 }
      );
    }

    // Parse webhook payload
    const payload = JSON.parse(body);
    const { event, payload: eventPayload } = payload;

    console.log('Webhook event received:', event);

    // Handle different webhook events
    switch (event) {
      case 'payment.authorized':
        await handlePaymentAuthorized(eventPayload);
        break;

      case 'payment.captured':
        await handlePaymentCaptured(eventPayload);
        break;

      case 'payment.failed':
        await handlePaymentFailed(eventPayload);
        break;

      case 'order.paid':
        await handleOrderPaid(eventPayload);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json(
      {
        success: true,
        message: 'Webhook processed successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Webhook processing error:', error);

    // Return 200 even on error to prevent Razorpay from retrying
    // Log the error for manual investigation
    return NextResponse.json(
      {
        success: false,
        error: 'Processing error',
        message: 'Webhook received but processing failed',
      },
      { status: 200 }
    );
  }
}

/**
 * Handle payment.authorized event
 * Payment has been authorized by the customer
 */
async function handlePaymentAuthorized(payload: any) {
  const { payment } = payload;
  const supabase = await createClient();

  console.log('Payment authorized:', payment.entity.id);

  // Update booking payment status to authorized
  const { error } = await supabase
    .from('bookings')
    .update({
      payment_status: 'authorized',
      razorpay_payment_id: payment.entity.id,
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', payment.entity.order_id);

  if (error) {
    console.error('Error updating booking for authorized payment:', error);
  }
}

/**
 * Handle payment.captured event
 * Payment has been successfully captured
 */
async function handlePaymentCaptured(payload: any) {
  const { payment } = payload;
  const supabase = await createClient();

  console.log('Payment captured:', payment.entity.id);

  // Update booking payment status to paid and booking status to confirmed
  const { error } = await supabase
    .from('bookings')
    .update({
      payment_status: 'paid',
      booking_status: 'confirmed',
      razorpay_payment_id: payment.entity.id,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', payment.entity.order_id);

  if (error) {
    console.error('Error updating booking for captured payment:', error);
    return;
  }

  // TODO: Send confirmation email to customer
  // TODO: Send notification to admin
  // TODO: Update inventory/availability
}

/**
 * Handle payment.failed event
 * Payment attempt has failed
 */
async function handlePaymentFailed(payload: any) {
  const { payment } = payload;
  const supabase = await createClient();

  console.log('Payment failed:', payment.entity.id);

  // Update booking payment status to failed
  const { error } = await supabase
    .from('bookings')
    .update({
      payment_status: 'failed',
      razorpay_payment_id: payment.entity.id,
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', payment.entity.order_id);

  if (error) {
    console.error('Error updating booking for failed payment:', error);
  }

  // TODO: Send payment failure notification to customer
}

/**
 * Handle order.paid event
 * Order has been fully paid
 */
async function handleOrderPaid(payload: any) {
  const { order } = payload;
  const supabase = await createClient();

  console.log('Order paid:', order.entity.id);

  // Update booking status to confirmed
  const { error } = await supabase
    .from('bookings')
    .update({
      booking_status: 'confirmed',
      payment_status: 'paid',
      updated_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', order.entity.id);

  if (error) {
    console.error('Error updating booking for paid order:', error);
  }
}

// Made with Bob
