/**
 * Pricing Repository
 * Data access layer for date-specific pricing operations
 */

import { createClient } from '../lib/supabase/server';
import type {
  DateSpecificPricing,
  DatePrice,
  PriceRange,
  PricingOverview,
  BulkUpsertResult,
  DeletePricingResult,
  DatePricingFilters,
} from '../types/pricing.types';

/**
 * Convert database row to DateSpecificPricing type
 */
function mapDbRowToPricing(row: any): DateSpecificPricing {
  return {
    id: row.id,
    tentTypeId: row.tent_type_id,
    date: row.date,
    customPrice: parseFloat(row.custom_price),
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PricingRepository {
  /**
   * Get date-specific pricing by ID
   */
  async findById(id: string): Promise<DateSpecificPricing | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('date_specific_pricing')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return mapDbRowToPricing(data);
  }

  /**
   * Get date-specific pricing for a tent type on a specific date
   */
  async findByTentTypeAndDate(
    tentTypeId: string,
    date: string
  ): Promise<DateSpecificPricing | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('date_specific_pricing')
      .select('*')
      .eq('tent_type_id', tentTypeId)
      .eq('date', date)
      .single();

    if (error || !data) {
      return null;
    }

    return mapDbRowToPricing(data);
  }

  /**
   * Get all date-specific pricing with optional filters
   */
  async findAll(filters?: DatePricingFilters): Promise<DateSpecificPricing[]> {
    const supabase = await createClient();

    let query = supabase
      .from('date_specific_pricing')
      .select('*')
      .order('date', { ascending: true });

    if (filters?.tentTypeId) {
      query = query.eq('tent_type_id', filters.tentTypeId);
    }

    if (filters?.startDate) {
      query = query.gte('date', filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lt('date', filters.endDate);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data.map(mapDbRowToPricing);
  }

  /**
   * Get price for a tent type on a specific date (custom or base)
   */
  async getPriceForDate(
    tentTypeId: string,
    date: string
  ): Promise<number | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_tent_price_for_date', {
      p_tent_type_id: tentTypeId,
      p_date: date,
    });

    if (error || data === null) {
      return null;
    }

    return parseFloat(data);
  }

  /**
   * Get prices for a tent type across a date range
   */
  async getPricesForRange(
    tentTypeId: string,
    startDate: string,
    endDate: string
  ): Promise<DatePrice[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_tent_prices_for_range', {
      p_tent_type_id: tentTypeId,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      date: row.date,
      price: parseFloat(row.price),
      isCustomPrice: row.is_custom_price,
    }));
  }

  /**
   * Calculate total price for a tent type across a date range
   */
  async calculateTotalForRange(
    tentTypeId: string,
    startDate: string,
    endDate: string,
    quantity: number = 1
  ): Promise<number | null> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      'calculate_tent_total_for_range',
      {
        p_tent_type_id: tentTypeId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_quantity: quantity,
      }
    );

    if (error || data === null) {
      return null;
    }

    return parseFloat(data);
  }

  /**
   * Create a new date-specific price
   */
  async create(
    tentTypeId: string,
    date: string,
    customPrice: number,
    notes?: string,
    createdBy?: string
  ): Promise<DateSpecificPricing | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('date_specific_pricing')
      .insert({
        tent_type_id: tentTypeId,
        date,
        custom_price: customPrice,
        notes,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create pricing');
    }

    return mapDbRowToPricing(data);
  }

  /**
   * Bulk upsert date-specific prices
   */
  async bulkUpsert(
    tentTypeId: string,
    dates: string[],
    customPrice: number,
    notes?: string,
    createdBy?: string
  ): Promise<BulkUpsertResult> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc('upsert_date_specific_pricing', {
      p_tent_type_id: tentTypeId,
      p_dates: dates,
      p_custom_price: customPrice,
      p_notes: notes,
      p_created_by: createdBy,
    });

    if (error) {
      throw new Error(error.message || 'Failed to bulk upsert pricing');
    }

    return {
      insertedCount: data.inserted_count || 0,
      updatedCount: data.updated_count || 0,
      totalCount: (data.inserted_count || 0) + (data.updated_count || 0),
    };
  }

  /**
   * Update date-specific pricing
   */
  async update(
    id: string,
    updates: { customPrice?: number; notes?: string }
  ): Promise<DateSpecificPricing | null> {
    const supabase = await createClient();

    const updateData: any = {};
    if (updates.customPrice !== undefined) {
      updateData.custom_price = updates.customPrice;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }

    const { data, error } = await supabase
      .from('date_specific_pricing')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update pricing');
    }

    return mapDbRowToPricing(data);
  }

  /**
   * Delete date-specific pricing by ID
   */
  async delete(id: string): Promise<boolean> {
    const supabase = await createClient();

    const { error } = await supabase
      .from('date_specific_pricing')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message || 'Failed to delete pricing');
    }

    return true;
  }

  /**
   * Delete date-specific pricing for a date range
   */
  async deleteRange(
    tentTypeId: string,
    startDate: string,
    endDate: string
  ): Promise<DeletePricingResult> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      'delete_date_specific_pricing_range',
      {
        p_tent_type_id: tentTypeId,
        p_start_date: startDate,
        p_end_date: endDate,
      }
    );

    if (error) {
      throw new Error(error.message || 'Failed to delete pricing range');
    }

    return {
      deletedCount: data || 0,
    };
  }

  /**
   * Get pricing overview for all tent types
   */
  async getPricingOverview(): Promise<PricingOverview[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('pricing_overview')
      .select('*')
      .order('tent_type_name');

    if (error || !data) {
      return [];
    }

    return data.map((row: any) => ({
      tentTypeId: row.tent_type_id,
      tentTypeName: row.tent_type_name,
      tentTypeSlug: row.tent_type_slug,
      basePrice: parseFloat(row.base_price),
      customPriceCount: row.custom_price_count || 0,
      earliestCustomDate: row.earliest_custom_date,
      latestCustomDate: row.latest_custom_date,
    }));
  }

  /**
   * Get pricing overview for a specific tent type
   */
  async getPricingOverviewByTentType(
    tentTypeId: string
  ): Promise<PricingOverview | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('pricing_overview')
      .select('*')
      .eq('tent_type_id', tentTypeId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      tentTypeId: data.tent_type_id,
      tentTypeName: data.tent_type_name,
      tentTypeSlug: data.tent_type_slug,
      basePrice: parseFloat(data.base_price),
      customPriceCount: data.custom_price_count || 0,
      earliestCustomDate: data.earliest_custom_date,
      latestCustomDate: data.latest_custom_date,
    };
  }

  /**
   * Check if custom pricing exists for a date
   */
  async hasCustomPricing(tentTypeId: string, date: string): Promise<boolean> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('date_specific_pricing')
      .select('id')
      .eq('tent_type_id', tentTypeId)
      .eq('date', date)
      .single();

    return !error && data !== null;
  }

  /**
   * Get count of custom prices for a tent type
   */
  async getCustomPriceCount(
    tentTypeId: string,
    startDate?: string,
    endDate?: string
  ): Promise<number> {
    const supabase = await createClient();

    let query = supabase
      .from('date_specific_pricing')
      .select('id', { count: 'exact', head: true })
      .eq('tent_type_id', tentTypeId);

    if (startDate) {
      query = query.gte('date', startDate);
    }

    if (endDate) {
      query = query.lt('date', endDate);
    }

    const { count, error } = await query;

    if (error) {
      return 0;
    }

    return count || 0;
  }
}

// Export singleton instance
export const pricingRepository = new PricingRepository();

// Made with Bob