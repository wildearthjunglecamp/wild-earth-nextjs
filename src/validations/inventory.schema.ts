import { z } from 'zod';

// inventory_items.condition check constraint values.
export const INVENTORY_CONDITIONS = [
  'excellent',
  'good',
  'fair',
  'poor',
  'damaged',
] as const;

export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  category: z.string().min(1, 'Category is required').max(50),
  quantity: z.number().int().min(0, 'Quantity cannot be negative'),
  condition: z.enum(INVENTORY_CONDITIONS),
});

export type InventoryItemInput = z.infer<typeof inventoryItemSchema>;

// Partial update (e.g. inline quantity edit, report damage).
export const inventoryItemUpdateSchema = inventoryItemSchema.partial();

// Made with Bob
