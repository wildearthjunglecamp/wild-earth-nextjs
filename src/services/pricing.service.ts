/**
 * Pricing Service
 * Business logic layer for date-specific pricing operations
 */

import { pricingRepository } from '../repositories/pricing.repository';
import type {
  DateSpecificPricing,
  DatePrice,
  PriceRange,
  PricingOverview,
  BulkUpsertResult,
  DeletePricingResult,
  DatePricingFilters,
  PricingCalendarData,
  PricingStatistics,
  PricingValidation,
  PricingConflict,
} from '../types/pricing.types';
import {
  generateDateArray,
  isWeekend,
  isValidPrice,
} from '../validations/pricing.schema';

/**
 * Pricing Service Class
 */
export class PricingService {
  /**
   * Get date-specific pricing by ID
   */
  async getPricingById(id: string): Promise<DateSpecificPricing | null> {
    return await pricingRepository.findById(id);
  }

  /**
   * Get all date-specific pricing with filters
   */
  async getAllPricing(
    filters?: DatePricingFilters
  ): Promise<DateSpecificPricing[]> {
    return await pricingRepository.findAll(filters);
  }

  /**
   * Get price for a tent type on a specific date
   */
  async getPriceForDate(
    tentTypeId: string,
    date: string
  ): Promise<number | null> {
    return await pricingRepository.getPriceForDate(tentTypeId, date);
  }

  /**
   * Get prices for a tent type across a date range
   */
  async getPricesForRange(
    tentTypeId: string,
    startDate: string,
    endDate: string
  ): Promise<DatePrice[]> {
    return await pricingRepository.getPricesForRange(
      tentTypeId,
      startDate,
      endDate
    );
  }

  /**
   * Get detailed price range information
   */
  async getPriceRangeDetails(
    tentTypeId: string,
    tentTypeName: string,
    tentTypeSlug: string,
    basePrice: number,
    startDate: string,
    endDate: string
  ): Promise<PriceRange> {
    const dailyPrices = await this.getPricesForRange(
      tentTypeId,
      startDate,
      endDate
    );

    const totalPrice = dailyPrices.reduce((sum, dp) => sum + dp.price, 0);
    const averagePrice = dailyPrices.length > 0 ? totalPrice / dailyPrices.length : basePrice;
    const hasCustomPricing = dailyPrices.some((dp) => dp.isCustomPrice);

    return {
      tentTypeId,
      tentTypeName,
      tentTypeSlug,
      basePrice,
      startDate,
      endDate,
      dailyPrices,
      totalPrice,
      averagePrice,
      hasCustomPricing,
    };
  }

  /**
   * Calculate total price for a tent type across a date range
   */
  async calculateTotalForRange(
    tentTypeId: string,
    startDate: string,
    endDate: string,
    quantity: number = 1
  ): Promise<number> {
    const total = await pricingRepository.calculateTotalForRange(
      tentTypeId,
      startDate,
      endDate,
      quantity
    );

    if (total === null) {
      throw new Error('Failed to calculate total price');
    }

    return total;
  }

  /**
   * Create a new date-specific price
   */
  async createPricing(
    tentTypeId: string,
    date: string,
    customPrice: number,
    notes?: string,
    createdBy?: string
  ): Promise<DateSpecificPricing> {
    // Validate price
    if (!isValidPrice(customPrice)) {
      throw new Error('Invalid price value');
    }

    // Check if pricing already exists
    const existing = await pricingRepository.findByTentTypeAndDate(
      tentTypeId,
      date
    );

    if (existing) {
      throw new Error(
        `Pricing already exists for this tent type on ${date}. Use update instead.`
      );
    }

    const pricing = await pricingRepository.create(
      tentTypeId,
      date,
      customPrice,
      notes,
      createdBy
    );

    if (!pricing) {
      throw new Error('Failed to create pricing');
    }

    return pricing;
  }

  /**
   * Bulk upsert date-specific prices
   */
  async bulkUpsertPricing(
    tentTypeId: string,
    dates: string[],
    customPrice: number,
    notes?: string,
    createdBy?: string
  ): Promise<BulkUpsertResult> {
    // Validate price
    if (!isValidPrice(customPrice)) {
      throw new Error('Invalid price value');
    }

    // Validate dates array
    if (!dates || dates.length === 0) {
      throw new Error('At least one date is required');
    }

    return await pricingRepository.bulkUpsert(
      tentTypeId,
      dates,
      customPrice,
      notes,
      createdBy
    );
  }

  /**
   * Update date-specific pricing
   */
  async updatePricing(
    id: string,
    updates: { customPrice?: number; notes?: string }
  ): Promise<DateSpecificPricing> {
    // Validate price if provided
    if (updates.customPrice !== undefined && !isValidPrice(updates.customPrice)) {
      throw new Error('Invalid price value');
    }

    // Check if at least one field is being updated
    if (updates.customPrice === undefined && updates.notes === undefined) {
      throw new Error('At least one field must be provided for update');
    }

    const pricing = await pricingRepository.update(id, updates);

    if (!pricing) {
      throw new Error('Failed to update pricing');
    }

    return pricing;
  }

  /**
   * Delete date-specific pricing by ID
   */
  async deletePricing(id: string): Promise<boolean> {
    return await pricingRepository.delete(id);
  }

  /**
   * Delete date-specific pricing for a date range
   */
  async deletePricingRange(
    tentTypeId: string,
    startDate: string,
    endDate: string
  ): Promise<DeletePricingResult> {
    return await pricingRepository.deleteRange(tentTypeId, startDate, endDate);
  }

  /**
   * Get pricing overview for all tent types
   */
  async getPricingOverview(): Promise<PricingOverview[]> {
    return await pricingRepository.getPricingOverview();
  }

  /**
   * Get pricing overview for a specific tent type
   */
  async getPricingOverviewByTentType(
    tentTypeId: string
  ): Promise<PricingOverview | null> {
    return await pricingRepository.getPricingOverviewByTentType(tentTypeId);
  }

  /**
   * Get pricing calendar data for a specific month
   */
  async getPricingCalendar(
    tentTypeId: string,
    tentTypeName: string,
    basePrice: number,
    year: number,
    month: number
  ): Promise<PricingCalendarData> {
    // Generate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get prices for the month
    const dailyPrices = await this.getPricesForRange(
      tentTypeId,
      startDateStr,
      endDateStr
    );

    // Get custom pricing records for notes
    const customPricing = await pricingRepository.findAll({
      tentTypeId,
      startDate: startDateStr,
      endDate: endDateStr,
    });

    const customPricingMap = new Map(
      customPricing.map((cp) => [cp.date, cp])
    );

    // Build calendar data
    const dates = dailyPrices.map((dp) => {
      const date = new Date(dp.date);
      const customRecord = customPricingMap.get(dp.date);

      return {
        date: dp.date,
        dayOfWeek: date.getDay(),
        price: dp.price,
        isCustomPrice: dp.isCustomPrice,
        notes: customRecord?.notes,
        isWeekend: isWeekend(dp.date),
      };
    });

    return {
      tentTypeId,
      tentTypeName,
      month: `${year}-${String(month).padStart(2, '0')}`,
      year,
      basePrice,
      dates,
    };
  }

  /**
   * Get pricing statistics for a date range
   */
  async getPricingStatistics(
    tentTypeId: string,
    tentTypeName: string,
    basePrice: number,
    startDate: string,
    endDate: string
  ): Promise<PricingStatistics> {
    const dailyPrices = await this.getPricesForRange(
      tentTypeId,
      startDate,
      endDate
    );

    const customPriceDays = dailyPrices.filter((dp) => dp.isCustomPrice).length;
    const totalDays = dailyPrices.length;
    const totalRevenuePotential = dailyPrices.reduce(
      (sum, dp) => sum + dp.price,
      0
    );
    const averagePrice = totalDays > 0 ? totalRevenuePotential / totalDays : basePrice;
    const prices = dailyPrices.map((dp) => dp.price);
    const minPrice = prices.length > 0 ? Math.min(...prices) : basePrice;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : basePrice;

    return {
      tentTypeId,
      tentTypeName,
      period: { startDate, endDate },
      basePrice,
      customPriceDays,
      totalDays,
      averagePrice,
      minPrice,
      maxPrice,
      totalRevenuePotential,
    };
  }

  /**
   * Validate pricing before bulk operations
   */
  async validatePricing(
    tentTypeId: string,
    dates: string[],
    customPrice: number
  ): Promise<PricingValidation> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const conflicts: PricingConflict[] = [];

    // Validate price
    if (!isValidPrice(customPrice)) {
      errors.push('Invalid price value');
    }

    // Check for existing pricing (conflicts)
    for (const date of dates) {
      const existing = await pricingRepository.findByTentTypeAndDate(
        tentTypeId,
        date
      );

      if (existing) {
        conflicts.push({
          date,
          tentTypeId,
          existingPrice: existing.customPrice,
          newPrice: customPrice,
          notes: existing.notes,
        });
      }
    }

    if (conflicts.length > 0) {
      warnings.push(
        `${conflicts.length} date(s) already have custom pricing and will be updated`
      );
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    };
  }

  /**
   * Apply pricing template (e.g., weekend pricing, holiday pricing)
   */
  async applyPricingTemplate(
    tentTypeId: string,
    startDate: string,
    endDate: string,
    pattern: 'weekends' | 'weekdays',
    priceMultiplier?: number,
    fixedPrice?: number,
    notes?: string,
    createdBy?: string
  ): Promise<BulkUpsertResult> {
    // Generate all dates in range
    const allDates = generateDateArray(startDate, endDate);

    // Filter dates based on pattern
    let targetDates: string[];
    if (pattern === 'weekends') {
      targetDates = allDates.filter((date) => isWeekend(date));
    } else {
      targetDates = allDates.filter((date) => !isWeekend(date));
    }

    if (targetDates.length === 0) {
      throw new Error('No dates match the specified pattern');
    }

    // Determine price
    let price: number;
    if (fixedPrice !== undefined) {
      price = fixedPrice;
    } else if (priceMultiplier !== undefined) {
      // Get base price for tent type
      const overview = await this.getPricingOverviewByTentType(tentTypeId);
      if (!overview) {
        throw new Error('Tent type not found');
      }
      price = overview.basePrice * priceMultiplier;
    } else {
      throw new Error('Either fixedPrice or priceMultiplier must be provided');
    }

    // Apply pricing
    return await this.bulkUpsertPricing(
      tentTypeId,
      targetDates,
      price,
      notes,
      createdBy
    );
  }

  /**
   * Copy pricing from one tent type to another
   */
  async copyPricing(
    sourceTentTypeId: string,
    targetTentTypeId: string,
    startDate: string,
    endDate: string,
    priceMultiplier: number = 1.0,
    createdBy?: string
  ): Promise<BulkUpsertResult> {
    // Get source pricing
    const sourcePricing = await pricingRepository.findAll({
      tentTypeId: sourceTentTypeId,
      startDate,
      endDate,
    });

    if (sourcePricing.length === 0) {
      throw new Error('No pricing found for source tent type in date range');
    }

    // Apply to target with multiplier
    let totalInserted = 0;
    let totalUpdated = 0;

    for (const sp of sourcePricing) {
      const result = await this.bulkUpsertPricing(
        targetTentTypeId,
        [sp.date],
        sp.customPrice * priceMultiplier,
        sp.notes ? `Copied from source: ${sp.notes}` : 'Copied from another tent type',
        createdBy
      );

      totalInserted += result.insertedCount;
      totalUpdated += result.updatedCount;
    }

    return {
      insertedCount: totalInserted,
      updatedCount: totalUpdated,
      totalCount: totalInserted + totalUpdated,
    };
  }
}

// Export singleton instance
export const pricingService = new PricingService();

// Made with Bob