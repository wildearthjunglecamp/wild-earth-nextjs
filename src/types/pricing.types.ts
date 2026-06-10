/**
 * Date-Specific Pricing Type Definitions
 */

/**
 * Date-specific pricing record from database
 */
export interface DateSpecificPricing {
  id: string;
  tentTypeId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  customPrice: number;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Input for creating date-specific pricing
 */
export interface CreateDatePricingInput {
  tentTypeId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  customPrice: number;
  notes?: string;
}

/**
 * Input for bulk creating/updating date-specific pricing
 */
export interface BulkUpsertPricingInput {
  tentTypeId: string;
  dates: string[]; // Array of ISO date strings
  customPrice: number;
  notes?: string;
}

/**
 * Input for updating date-specific pricing
 */
export interface UpdateDatePricingInput {
  customPrice?: number;
  notes?: string;
}

/**
 * Query filters for fetching date-specific pricing
 */
export interface DatePricingFilters {
  tentTypeId?: string;
  startDate?: string;
  endDate?: string;
  hasCustomPrice?: boolean;
}

/**
 * Price information for a specific date
 */
export interface DatePrice {
  date: string; // ISO date string
  price: number;
  isCustomPrice: boolean;
  notes?: string;
}

/**
 * Price range information for a tent type
 */
export interface PriceRange {
  tentTypeId: string;
  tentTypeName: string;
  tentTypeSlug: string;
  basePrice: number;
  startDate: string;
  endDate: string;
  dailyPrices: DatePrice[];
  totalPrice: number;
  averagePrice: number;
  hasCustomPricing: boolean;
}

/**
 * Pricing overview for a tent type
 */
export interface PricingOverview {
  tentTypeId: string;
  tentTypeName: string;
  tentTypeSlug: string;
  basePrice: number;
  customPriceCount: number;
  earliestCustomDate?: string;
  latestCustomDate?: string;
}

/**
 * Result from bulk upsert operation
 */
export interface BulkUpsertResult {
  insertedCount: number;
  updatedCount: number;
  totalCount: number;
}

/**
 * Result from delete operation
 */
export interface DeletePricingResult {
  deletedCount: number;
}

/**
 * Date range for pricing operations
 */
export interface DateRange {
  startDate: string; // ISO date string
  endDate: string; // ISO date string
}

/**
 * Pricing calendar data for UI
 */
export interface PricingCalendarData {
  tentTypeId: string;
  tentTypeName: string;
  month: string; // YYYY-MM format
  year: number;
  basePrice: number;
  dates: Array<{
    date: string;
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    price: number;
    isCustomPrice: boolean;
    notes?: string;
    isWeekend: boolean;
    isHoliday?: boolean;
  }>;
}

/**
 * Pricing statistics for reporting
 */
export interface PricingStatistics {
  tentTypeId: string;
  tentTypeName: string;
  period: DateRange;
  basePrice: number;
  customPriceDays: number;
  totalDays: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalRevenuePotential: number;
}

/**
 * Pricing conflict detection
 */
export interface PricingConflict {
  date: string;
  tentTypeId: string;
  existingPrice: number;
  newPrice: number;
  notes?: string;
}

/**
 * Pricing validation result
 */
export interface PricingValidation {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  conflicts?: PricingConflict[];
}

/**
 * Pricing template for bulk operations
 */
export interface PricingTemplate {
  name: string;
  description?: string;
  tentTypeId?: string; // If null, applies to all tent types
  priceMultiplier?: number; // Multiply base price by this
  fixedPrice?: number; // Or use fixed price
  datePattern: 'weekends' | 'weekdays' | 'specific-dates' | 'date-range';
  dates?: string[]; // For specific-dates pattern
  dateRange?: DateRange; // For date-range pattern
  notes?: string;
}

/**
 * Response from pricing API operations
 */
export interface PricingApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Made with Bob