/**
 * Validation Schemas for Date-Specific Pricing
 * Using Zod for runtime validation
 */

import { z } from 'zod';

/**
 * Date string validation (YYYY-MM-DD format)
 */
const dateStringSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}$/,
  'Date must be in YYYY-MM-DD format'
);

/**
 * UUID validation
 */
const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Price validation (must be non-negative)
 */
const priceSchema = z.number().min(0, 'Price must be non-negative').finite();

/**
 * Schema for creating a single date-specific price
 */
export const createDatePricingSchema = z.object({
  tentTypeId: uuidSchema,
  date: dateStringSchema.refine(
    (date) => {
      const d = new Date(date);
      return d >= new Date(new Date().setHours(0, 0, 0, 0));
    },
    { message: 'Date cannot be in the past' }
  ),
  customPrice: priceSchema,
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export type CreateDatePricingInput = z.infer<typeof createDatePricingSchema>;

/**
 * Schema for bulk upserting date-specific prices
 */
export const bulkUpsertPricingSchema = z.object({
  tentTypeId: uuidSchema,
  dates: z
    .array(dateStringSchema)
    .min(1, 'At least one date is required')
    .max(365, 'Cannot set prices for more than 365 dates at once')
    .refine(
      (dates) => {
        // Check for duplicates
        const uniqueDates = new Set(dates);
        return uniqueDates.size === dates.length;
      },
      { message: 'Duplicate dates are not allowed' }
    )
    .refine(
      (dates) => {
        // Check that all dates are not in the past
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        return dates.every((date) => new Date(date) >= today);
      },
      { message: 'Dates cannot be in the past' }
    ),
  customPrice: priceSchema,
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export type BulkUpsertPricingInput = z.infer<typeof bulkUpsertPricingSchema>;

/**
 * Schema for updating date-specific pricing
 */
export const updateDatePricingSchema = z.object({
  customPrice: priceSchema.optional(),
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
}).refine(
  (data) => data.customPrice !== undefined || data.notes !== undefined,
  { message: 'At least one field (customPrice or notes) must be provided' }
);

export type UpdateDatePricingInput = z.infer<typeof updateDatePricingSchema>;

/**
 * Schema for date range
 */
export const dateRangeSchema = z.object({
  startDate: dateStringSchema,
  endDate: dateStringSchema,
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date' }
);

export type DateRangeInput = z.infer<typeof dateRangeSchema>;

/**
 * Schema for querying date-specific pricing
 */
export const datePricingFiltersSchema = z.object({
  tentTypeId: uuidSchema.optional(),
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
  hasCustomPrice: z.boolean().optional(),
}).refine(
  (data) => {
    // If startDate is provided, endDate must also be provided
    if (data.startDate && !data.endDate) return false;
    if (!data.startDate && data.endDate) return false;
    return true;
  },
  { message: 'Both startDate and endDate must be provided together' }
).refine(
  (data) => {
    // If both dates provided, endDate must be after startDate
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) > new Date(data.startDate);
    }
    return true;
  },
  { message: 'End date must be after start date' }
);

export type DatePricingFiltersInput = z.infer<typeof datePricingFiltersSchema>;

/**
 * Schema for deleting pricing in a date range
 */
export const deletePricingRangeSchema = z.object({
  tentTypeId: uuidSchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema,
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date' }
);

export type DeletePricingRangeInput = z.infer<typeof deletePricingRangeSchema>;

/**
 * Schema for getting prices for a date range
 */
export const getPricesForRangeSchema = z.object({
  tentTypeId: uuidSchema,
  startDate: dateStringSchema,
  endDate: dateStringSchema,
  quantity: z.number().int().min(1).max(10).optional().default(1),
}).refine(
  (data) => new Date(data.endDate) > new Date(data.startDate),
  { message: 'End date must be after start date' }
).refine(
  (data) => {
    // Limit date range to 1 year
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 365;
  },
  { message: 'Date range cannot exceed 365 days' }
);

export type GetPricesForRangeInput = z.infer<typeof getPricesForRangeSchema>;

/**
 * Schema for pricing template
 */
export const pricingTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  tentTypeId: uuidSchema.optional(),
  priceMultiplier: z.number().min(0.1).max(10).optional(),
  fixedPrice: priceSchema.optional(),
  datePattern: z.enum(['weekends', 'weekdays', 'specific-dates', 'date-range']),
  dates: z.array(dateStringSchema).optional(),
  dateRange: dateRangeSchema.optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => {
    // Must have either priceMultiplier or fixedPrice
    return data.priceMultiplier !== undefined || data.fixedPrice !== undefined;
  },
  { message: 'Either priceMultiplier or fixedPrice must be provided' }
).refine(
  (data) => {
    // Cannot have both priceMultiplier and fixedPrice
    return !(data.priceMultiplier !== undefined && data.fixedPrice !== undefined);
  },
  { message: 'Cannot provide both priceMultiplier and fixedPrice' }
).refine(
  (data) => {
    // If datePattern is specific-dates, dates array is required
    if (data.datePattern === 'specific-dates') {
      return data.dates && data.dates.length > 0;
    }
    return true;
  },
  { message: 'Dates array is required for specific-dates pattern' }
).refine(
  (data) => {
    // If datePattern is date-range, dateRange is required
    if (data.datePattern === 'date-range') {
      return data.dateRange !== undefined;
    }
    return true;
  },
  { message: 'Date range is required for date-range pattern' }
);

export type PricingTemplateInput = z.infer<typeof pricingTemplateSchema>;

/**
 * Validation helper functions
 */

/**
 * Validate that a date is not in the past
 */
export function isDateInFuture(date: string): boolean {
  const today = new Date(new Date().setHours(0, 0, 0, 0));
  const checkDate = new Date(date);
  return checkDate >= today;
}

/**
 * Validate date range duration
 */
export function isValidDateRangeDuration(
  startDate: string,
  endDate: string,
  maxDays: number = 365
): boolean {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= maxDays;
}

/**
 * Check for duplicate dates in array
 */
export function hasDuplicateDates(dates: string[]): boolean {
  const uniqueDates = new Set(dates);
  return uniqueDates.size !== dates.length;
}

/**
 * Validate price value
 */
export function isValidPrice(price: number): boolean {
  return typeof price === 'number' && 
         price >= 0 && 
         isFinite(price) && 
         !isNaN(price);
}

/**
 * Generate date array for a range
 */
export function generateDateArray(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  let current = new Date(start);
  while (current < end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

/**
 * Check if date is weekend
 */
export function isWeekend(date: string): boolean {
  const d = new Date(date);
  const day = d.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

/**
 * Check if date is weekday
 */
export function isWeekday(date: string): boolean {
  return !isWeekend(date);
}

// Made with Bob