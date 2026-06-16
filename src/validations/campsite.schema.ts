import { z } from 'zod';

// Admin-settable tent statuses (not 'occupied' — that's derived from bookings).
export const TENT_STATUSES = ['available', 'maintenance', 'out_of_service'] as const;

export const tentSchema = z.object({
  tentNumber: z.string().min(1, 'Tent number is required').max(50),
  tentTypeId: z.string().uuid('Invalid tent type'),
  status: z.enum(TENT_STATUSES).default('available'),
});
export type TentInput = z.infer<typeof tentSchema>;

export const tentUpdateSchema = z.object({
  tentNumber: z.string().min(1).max(50).optional(),
  tentTypeId: z.string().uuid().optional(),
  status: z.enum(TENT_STATUSES).optional(),
});
export type TentUpdateInput = z.infer<typeof tentUpdateSchema>;

// Editable tent-type fields (not slug/capacity — those are tied to the booking
// validation; see admin-build-plan note).
export const tentTypeUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  basePrice: z.number().nonnegative().optional(),
  description: z.string().max(1000).optional(),
  isActive: z.boolean().optional(),
});
export type TentTypeUpdateInput = z.infer<typeof tentTypeUpdateSchema>;

// Made with Bob
