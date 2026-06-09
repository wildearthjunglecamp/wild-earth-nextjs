/**
 * Availability Validation Schemas
 * Zod schemas for availability API requests
 */

import { z } from 'zod';

/**
 * Schema for availability check request
 */
export const availabilityRequestSchema = z.object({
  checkInDate: z.string()
    .min(1, 'Check-in date is required')
    .refine((date) => {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return dateRegex.test(date);
    }, 'Check-in date must be in YYYY-MM-DD format')
    .refine((date) => {
      // Validate it's a valid date
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Check-in date is invalid')
    .refine((date) => {
      // Check-in cannot be in the past
      const checkInDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate >= today;
    }, 'Check-in date cannot be in the past'),
  
  checkOutDate: z.string()
    .min(1, 'Check-out date is required')
    .refine((date) => {
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      return dateRegex.test(date);
    }, 'Check-out date must be in YYYY-MM-DD format')
    .refine((date) => {
      // Validate it's a valid date
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime());
    }, 'Check-out date is invalid'),
  
  guestCount: z.number()
    .int('Guest count must be an integer')
    .min(1, 'At least 1 guest is required')
    .max(10, 'Maximum 10 guests allowed')
    .optional(),
}).refine((data) => {
  // Check-out must be after check-in
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut'],
}).refine((data) => {
  // Maximum booking duration (30 nights)
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 30;
}, {
  message: 'Maximum booking duration is 30 nights',
  path: ['checkOut'],
}).refine((data) => {
  // Minimum booking duration (1 night)
  const checkIn = new Date(data.checkInDate);
  const checkOut = new Date(data.checkOutDate);
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 1;
}, {
  message: 'Minimum booking duration is 1 night',
  path: ['checkOut'],
});

/**
 * Type inference from schema
 */
export type AvailabilityRequest = z.infer<typeof availabilityRequestSchema>;

/**
 * Schema for availability response
 */
export const availabilityResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    tentTypeId: z.string().uuid(),
    tentTypeName: z.string(),
    capacity: z.number(),
    basePrice: z.number(),
    description: z.string().nullable(),
    amenities: z.array(z.string()),
    images: z.array(z.string()),
    availableCount: z.number(),
    totalCount: z.number(),
    availableTentIds: z.array(z.string().uuid()),
    availableTentNumbers: z.array(z.string()),
  })).optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;

// Made with Bob
