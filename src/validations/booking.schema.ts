import { z } from 'zod';

/**
 * Schema for a single tent item in a booking
 */
export const tentItemSchema = z.object({
  tentTypeSlug: z.enum([
    'twin_sharing_small',
    'twin_sharing_semi_big',
    'three_sharing_jungle',
    'four_sharing_jungle',
  ]),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(10, 'Maximum 10 tents per type'),
  pricePerNight: z.number().positive('Price per night must be positive'),
});

export type TentItem = z.infer<typeof tentItemSchema>;

/**
 * Schema for creating a new booking with payment verification
 * Supports multiple tent types in a single booking
 */
export const createBookingSchema = z.object({
  // Customer Information
  customerName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),

  // Booking Dates
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),

  // Tent Items - Array of tent types with quantities
  tentItems: z.array(tentItemSchema)
    .min(1, 'At least one tent type must be specified')
    .max(5, 'Maximum 5 different tent types per booking'),

  // Guest Information
  adults: z.number().int().min(1, 'At least 1 adult required').max(40),
  children: z.number().int().min(0).max(40),

  // Add-ons (optional)
  addOns: z.array(z.object({
    addOnId: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).optional(),

  // Activities (optional)
  activities: z.array(z.string().uuid()).optional(),

  // Payment Verification Data
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),

  // Total Amount (for verification)
  totalAmount: z.number().positive('Total amount must be positive'),

  // Special Requests (optional)
  specialRequests: z.string().max(500).optional(),
}).refine(
  (data) => {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    return checkOut > checkIn;
  },
  {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  }
).refine(
  (data) => {
    const checkIn = new Date(data.checkIn);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIn >= today;
  },
  {
    message: 'Check-in date cannot be in the past',
    path: ['checkIn'],
  }
).refine(
  (data) => {
    // Validate total tents doesn't exceed maximum
    const totalTents = data.tentItems.reduce((sum, item) => sum + item.quantity, 0);
    return totalTents <= 20;
  },
  {
    message: 'Maximum 20 total tents per booking',
    path: ['tentItems'],
  }
).refine(
  (data) => {
    // Validate no duplicate tent types
    const tentTypes = data.tentItems.map(item => item.tentTypeSlug);
    const uniqueTentTypes = new Set(tentTypes);
    return tentTypes.length === uniqueTentTypes.size;
  },
  {
    message: 'Duplicate tent types are not allowed. Combine quantities for the same tent type.',
    path: ['tentItems'],
  }
);

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Schema for assigned tent details in response
 */
export const assignedTentSchema = z.object({
  tentId: z.string().uuid(),
  tentNumber: z.string(),
  tentTypeSlug: z.string(),
  tentTypeName: z.string(),
  pricePerNight: z.number(),
  nights: z.number(),
  subtotal: z.number(),
});

export type AssignedTent = z.infer<typeof assignedTentSchema>;

/**
 * Schema for tent type summary in response
 */
export const tentTypeSummarySchema = z.object({
  tentTypeSlug: z.string(),
  tentTypeName: z.string(),
  quantity: z.number(),
  pricePerNight: z.number(),
  nights: z.number(),
  subtotal: z.number(),
  assignedTents: z.array(z.object({
    tentId: z.string().uuid(),
    tentNumber: z.string(),
  })),
});

export type TentTypeSummary = z.infer<typeof tentTypeSummarySchema>;

/**
 * Schema for booking response
 */
export const bookingResponseSchema = z.object({
  id: z.string().uuid(),
  bookingNumber: z.string(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  nights: z.number(),
  adults: z.number(),
  children: z.number(),
  totalAmount: z.number(),
  bookingStatus: z.string(),
  paymentStatus: z.string(),
  tentTypes: z.array(tentTypeSummarySchema),
  assignedTents: z.array(assignedTentSchema),
  paymentDetails: z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    amount: z.number(),
    status: z.string(),
  }),
  createdAt: z.string(),
});

export type BookingResponse = z.infer<typeof bookingResponseSchema>;

/**
 * Helper function to calculate total tents in a booking
 */
export function calculateTotalTents(tentItems: TentItem[]): number {
  return tentItems.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Helper function to calculate total amount for tent items
 */
export function calculateTentItemsTotal(tentItems: TentItem[], nights: number): number {
  return tentItems.reduce((sum, item) => {
    return sum + (item.pricePerNight * item.quantity * nights);
  }, 0);
}

/**
 * Helper function to validate tent capacity matches guest count
 */
export function validateTentCapacity(
  tentItems: TentItem[],
  adults: number,
  children: number
): { valid: boolean; message?: string } {
  // Define capacity for each tent type
  const capacities: Record<string, number> = {
    twin_sharing_small: 2,
    twin_sharing_semi_big: 2,
    three_sharing_jungle: 3,
    four_sharing_jungle: 4,
  };

  const totalCapacity = tentItems.reduce((sum, item) => {
    const capacity = capacities[item.tentTypeSlug] || 0;
    return sum + (capacity * item.quantity);
  }, 0);

  const totalGuests = adults + children;

  if (totalGuests > totalCapacity) {
    return {
      valid: false,
      message: `Total guests (${totalGuests}) exceeds tent capacity (${totalCapacity})`,
    };
  }

  return { valid: true };
}

// Made with Bob
