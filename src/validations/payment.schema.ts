/**
 * Payment Validation Schemas
 * Zod schemas for payment API requests
 */

import { z } from 'zod';

/**
 * Schema for create order request
 */
export const createOrderSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Minimum order amount is ₹1')
    .max(500000, 'Maximum order amount is ₹500,000')
    .refine((val) => {
      // Check if amount has at most 2 decimal places
      return Number.isInteger(val * 100);
    }, 'Amount can have at most 2 decimal places'),
  
  currency: z.string()
    .length(3, 'Currency must be 3 characters')
    .toUpperCase()
    .default('INR')
    .optional(),
  
  receipt: z.string()
    .max(40, 'Receipt must be at most 40 characters')
    .optional(),
  
  notes: z.record(z.string())
    .optional(),
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;

/**
 * Schema for verify payment request
 */
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string()
    .min(1, 'Order ID is required'),
  
  razorpay_payment_id: z.string()
    .min(1, 'Payment ID is required'),
  
  razorpay_signature: z.string()
    .min(1, 'Signature is required'),
});

export type VerifyPaymentRequest = z.infer<typeof verifyPaymentSchema>;

/**
 * Schema for refund request
 */
export const createRefundSchema = z.object({
  paymentId: z.string()
    .min(1, 'Payment ID is required'),
  
  amount: z.number()
    .positive('Amount must be positive')
    .optional(),
  
  notes: z.record(z.string())
    .optional(),
});

export type CreateRefundRequest = z.infer<typeof createRefundSchema>;

// Made with Bob
