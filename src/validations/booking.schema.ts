/**
 * Booking Validation Schemas
 */

import { z } from 'zod';

export const createBookingSchema = z.object({
  guestName: z.string().min(2, 'Name must be at least 2 characters'),
  guestEmail: z.string().email('Invalid email address'),
  guestPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  checkInDate: z.date().min(new Date(), 'Check-in date must be in the future'),
  checkOutDate: z.date(),
  numberOfGuests: z.number().min(1, 'At least 1 guest required').max(10, 'Maximum 10 guests'),
  tentId: z.string().uuid('Invalid tent ID'),
  specialRequests: z.string().optional(),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOutDate'],
});

export const updateBookingSchema = createBookingSchema.partial();

export const bookingFiltersSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  guestEmail: z.string().email().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type BookingFilters = z.infer<typeof bookingFiltersSchema>;

// Made with Bob
