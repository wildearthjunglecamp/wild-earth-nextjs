/**
 * Razorpay Integration
 * Handles Razorpay payment gateway operations
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

/**
 * Initialize Razorpay instance
 */
export function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Create Razorpay order
 */
export interface CreateOrderParams {
  amount: number; // Amount in INR
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number; // Amount in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export async function createRazorpayOrder(
  params: CreateOrderParams
): Promise<RazorpayOrder> {
  const razorpay = getRazorpayInstance();

  // Convert amount to paise (1 INR = 100 paise)
  const amountInPaise = Math.round(params.amount * 100);

  // Validate amount
  if (amountInPaise < 100) {
    throw new Error('Minimum order amount is ₹1');
  }

  if (amountInPaise > 50000000) {
    throw new Error('Maximum order amount is ₹500,000');
  }

  const orderOptions = {
    amount: amountInPaise,
    currency: params.currency || 'INR',
    receipt: params.receipt || `receipt_${Date.now()}`,
    notes: params.notes || {},
  };

  try {
    const order = await razorpay.orders.create(orderOptions);
    return order as RazorpayOrder;
  } catch (error: any) {
    console.error('Razorpay order creation error:', error);
    throw new Error(error.error?.description || 'Failed to create Razorpay order');
  }
}

/**
 * Verify Razorpay payment signature
 */
export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export function verifyPaymentSignature(params: VerifyPaymentParams): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keySecret) {
    throw new Error('Razorpay key secret not configured');
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params;

  // Create signature
  const text = `${razorpay_order_id}|${razorpay_payment_id}`;
  const generated_signature = crypto
    .createHmac('sha256', keySecret)
    .update(text)
    .digest('hex');

  // Compare signatures
  return generated_signature === razorpay_signature;
}

/**
 * Fetch payment details
 */
export async function fetchPaymentDetails(paymentId: string) {
  const razorpay = getRazorpayInstance();

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error: any) {
    console.error('Error fetching payment details:', error);
    throw new Error(error.error?.description || 'Failed to fetch payment details');
  }
}

/**
 * Fetch order details
 */
export async function fetchOrderDetails(orderId: string) {
  const razorpay = getRazorpayInstance();

  try {
    const order = await razorpay.orders.fetch(orderId);
    return order;
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    throw new Error(error.error?.description || 'Failed to fetch order details');
  }
}

/**
 * Create refund
 */
export interface CreateRefundParams {
  paymentId: string;
  amount?: number; // Amount in paise (optional for full refund)
  notes?: Record<string, string>;
}

export async function createRefund(params: CreateRefundParams) {
  const razorpay = getRazorpayInstance();

  const refundOptions: any = {
    payment_id: params.paymentId,
  };

  if (params.amount) {
    refundOptions.amount = params.amount;
  }

  if (params.notes) {
    refundOptions.notes = params.notes;
  }

  try {
    const refund = await razorpay.payments.refund(params.paymentId, refundOptions);
    return refund;
  } catch (error: any) {
    console.error('Error creating refund:', error);
    throw new Error(error.error?.description || 'Failed to create refund');
  }
}

/**
 * Convert amount from INR to paise
 */
export function convertToPaise(amountInINR: number): number {
  return Math.round(amountInINR * 100);
}

/**
 * Convert amount from paise to INR
 */
export function convertToINR(amountInPaise: number): number {
  return amountInPaise / 100;
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
  }).format(amount);
}

// Made with Bob
