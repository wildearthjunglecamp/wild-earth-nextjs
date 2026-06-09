/**
 * Availability Service
 * Handles tent availability checking with date overlap logic
 * 
 * Business Rules:
 * - Check-in: 1:00 PM (13:00)
 * - Check-out: 11:00 AM (11:00)
 * - Same-day turnover allowed
 * - Tents in maintenance/out_of_service are excluded
 */

import { createClient } from '../lib/supabase/server';

// Types
export interface AvailableTent {
  tentId: string;
  tentNumber: string;
  tentTypeId: string;
  tentTypeName: string;
  capacity: number;
  basePrice: number;
  description: string;
  amenities: string[];
  tentStatus: string;
}

export interface AvailableTentType {
  tentTypeId: string;
  tentTypeName: string;
  capacity: number;
  basePrice: number;
  description: string;
  amenities: string[];
  images: string[];
  availableCount: number;
  totalCount: number;
  availableTentIds: string[];
  availableTentNumbers: string[];
}

export interface AvailabilityCheckParams {
  checkInDate: Date;
  checkOutDate: Date;
  guestCount?: number;
}

export interface OccupancyCalendar {
  date: Date;
  tentTypeName: string;
  totalTents: number;
  occupiedTents: number;
  availableTents: number;
}

export class AvailabilityService {
  /**
   * Get all available tents for a date range
   * Returns individual tent details
   */
  async getAvailableTents(params: AvailabilityCheckParams): Promise<AvailableTent[]> {
    const { checkInDate, checkOutDate, guestCount } = params;

    // Validate dates
    this.validateDates(checkInDate, checkOutDate);

    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_available_tents', {
      p_check_in: checkInDate,
      p_check_out: checkOutDate,
      // p_check_in: checkInDate),
      // p_check_out: this.formatDate(checkOutDate),
      p_guest_count: guestCount || null,
    });
    console.log('data', data);

    if (error) {
      console.error('Error fetching available tents:', error);
      throw new Error(`Failed to fetch available tents: ${error.message}`);
    }

    return (data || []).map((tent: any) => ({
      tentId: tent.tent_id,
      tentNumber: tent.tent_number,
      tentTypeId: tent.tent_type_id,
      tentTypeName: tent.tent_type_name,
      capacity: tent.capacity,
      basePrice: parseFloat(tent.base_price),
      description: tent.description,
      amenities: tent.amenities || [],
      tentStatus: tent.tent_status,
    }));
  }

  /**
   * Get available tents grouped by tent type
   * Returns summary with available count per type
   */
  async getAvailableTentsByType(
    params: AvailabilityCheckParams
  ): Promise<AvailableTentType[]> {
    const { checkInDate, checkOutDate, guestCount } = params;

    // Validate dates
    this.validateDates(checkInDate, checkOutDate);

    const supabase = await createClient();

    const { data, error } = await supabase.rpc('get_available_tents_by_type', {
      p_check_in: this.formatDate(checkInDate),
      p_check_out: this.formatDate(checkOutDate),
      p_guest_count: guestCount || null,
    });

    if (error) {
      console.error('Error fetching available tents by type:', error);
      throw new Error(`Failed to fetch available tents by type: ${error.message}`);
    }

    return (data || []).map((type: any) => ({
      tentTypeId: type.tent_type_id,
      tentTypeName: type.tent_type_name,
      capacity: type.capacity,
      basePrice: parseFloat(type.base_price),
      description: type.description,
      amenities: type.amenities || [],
      images: type.images || [],
      availableCount: parseInt(type.available_count),
      totalCount: parseInt(type.total_count),
      availableTentIds: type.available_tent_ids || [],
      availableTentNumbers: type.available_tent_numbers || [],
    }));
  }

  /**
   * Check if a specific tent is available
   */
  async checkTentAvailability(
    tentId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<boolean> {
    // Validate dates
    this.validateDates(checkInDate, checkOutDate);

    const supabase = await createClient();

    const { data, error } = await supabase.rpc('check_tent_availability', {
      p_tent_id: tentId,
      p_check_in: this.formatDate(checkInDate),
      p_check_out: this.formatDate(checkOutDate),
    });

    if (error) {
      console.error('Error checking tent availability:', error);
      throw new Error(`Failed to check tent availability: ${error.message}`);
    }

    return data === true;
  }

  /**
   * Get occupancy calendar for a date range
   * Useful for admin dashboard and calendar views
   */
  async getOccupancyCalendar(
    startDate: Date,
    endDate: Date
  ): Promise<OccupancyCalendar[]> {
    // Validate dates
    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }

    const supabase = await createClient();

    const query = `
      SELECT 
        d.date,
        tt.name as tent_type_name,
        COUNT(DISTINCT t.id) as total_tents,
        COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.tent_id = t.id
            AND b.status NOT IN ('cancelled', 'checked_out')
            AND d.date >= b.check_in_date 
            AND d.date < b.check_out_date
          ) THEN t.id 
        END) as occupied_tents,
        COUNT(DISTINCT t.id) - COUNT(DISTINCT CASE 
          WHEN EXISTS (
            SELECT 1 FROM bookings b
            WHERE b.tent_id = t.id
            AND b.status NOT IN ('cancelled', 'checked_out')
            AND d.date >= b.check_in_date 
            AND d.date < b.check_out_date
          ) THEN t.id 
        END) as available_tents
      FROM 
        generate_series(
          $1::DATE, 
          $2::DATE, 
          '1 day'::interval
        ) d(date)
      CROSS JOIN tent_types tt
      INNER JOIN tents t ON t.tent_type_id = tt.id
      WHERE 
        t.status = 'available'
        AND tt.is_active = true
      GROUP BY d.date, tt.name
      ORDER BY d.date, tt.name
    `;

    const { data, error } = await supabase.rpc('execute_sql', {
      query,
      params: [this.formatDate(startDate), this.formatDate(endDate)],
    });

    if (error) {
      console.error('Error fetching occupancy calendar:', error);
      throw new Error(`Failed to fetch occupancy calendar: ${error.message}`);
    }

    return (data || []).map((row: any) => ({
      date: new Date(row.date),
      tentTypeName: row.tent_type_name,
      totalTents: parseInt(row.total_tents),
      occupiedTents: parseInt(row.occupied_tents),
      availableTents: parseInt(row.available_tents),
    }));
  }

  /**
   * Calculate total price for a booking
   */
  calculateBookingPrice(
    basePrice: number,
    checkInDate: Date,
    checkOutDate: Date
  ): number {
    const nights = this.calculateNights(checkInDate, checkOutDate);
    return basePrice * nights;
  }

  /**
   * Calculate number of nights between dates
   */
  calculateNights(checkInDate: Date, checkOutDate: Date): number {
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Validate date range
   */
  private validateDates(checkInDate: Date, checkOutDate: Date): void {
    // Check if dates are valid
    if (!(checkInDate instanceof Date) || isNaN(checkInDate.getTime())) {
      throw new Error('Invalid check-in date');
    }

    if (!(checkOutDate instanceof Date) || isNaN(checkOutDate.getTime())) {
      throw new Error('Invalid check-out date');
    }

    // Check-out must be after check-in
    if (checkOutDate <= checkInDate) {
      throw new Error('Check-out date must be after check-in date');
    }

    // Check-in cannot be in the past (allow today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkIn = new Date(checkInDate);
    checkIn.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      throw new Error('Check-in date cannot be in the past');
    }

    // Maximum booking duration (e.g., 30 days)
    const maxNights = 30;
    const nights = this.calculateNights(checkInDate, checkOutDate);
    
    if (nights > maxNights) {
      throw new Error(`Maximum booking duration is ${maxNights} nights`);
    }

    // Minimum booking duration (e.g., 1 night)
    if (nights < 1) {
      throw new Error('Minimum booking duration is 1 night');
    }
  }

  /**
   * Format date for PostgreSQL
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Check if dates overlap with existing booking
   * Utility function for client-side validation
   */
  doDatesOverlap(
    newCheckIn: Date,
    newCheckOut: Date,
    existingCheckIn: Date,
    existingCheckOut: Date
  ): boolean {
    return (
      // New check-in falls within existing booking
      (newCheckIn >= existingCheckIn && newCheckIn < existingCheckOut) ||
      // New check-out falls within existing booking
      (newCheckOut > existingCheckIn && newCheckOut <= existingCheckOut) ||
      // New booking encompasses existing booking
      (newCheckIn <= existingCheckIn && newCheckOut >= existingCheckOut)
    );
  }

  /**
   * Get suggested alternative dates if no availability
   */
  async getSuggestedDates(
    originalCheckIn: Date,
    originalCheckOut: Date,
    guestCount?: number
  ): Promise<Date[]> {
    const suggestions: Date[] = [];
    const nights = this.calculateNights(originalCheckIn, originalCheckOut);

    // Try next 7 days
    for (let i = 1; i <= 7; i++) {
      const newCheckIn = new Date(originalCheckIn);
      newCheckIn.setDate(newCheckIn.getDate() + i);
      
      const newCheckOut = new Date(newCheckIn);
      newCheckOut.setDate(newCheckOut.getDate() + nights);

      try {
        const available = await this.getAvailableTentsByType({
          checkInDate: newCheckIn,
          checkOutDate: newCheckOut,
          guestCount,
        });

        if (available.length > 0) {
          suggestions.push(newCheckIn);
        }

        if (suggestions.length >= 3) break;
      } catch (error) {
        console.error('Error checking suggested date:', error);
      }
    }

    return suggestions;
  }

  /**
   * Get availability summary for multiple date ranges
   * Useful for showing availability across different periods
   */
  async getAvailabilitySummary(
    dateRanges: Array<{ checkIn: Date; checkOut: Date }>,
    guestCount?: number
  ): Promise<Map<string, number>> {
    const summary = new Map<string, number>();

    for (const range of dateRanges) {
      try {
        const available = await this.getAvailableTentsByType({
          checkInDate: range.checkIn,
          checkOutDate: range.checkOut,
          guestCount,
        });

        const key = `${this.formatDate(range.checkIn)}_${this.formatDate(range.checkOut)}`;
        const totalAvailable = available.reduce(
          (sum, type) => sum + type.availableCount,
          0
        );
        summary.set(key, totalAvailable);
      } catch (error) {
        console.error('Error fetching availability for range:', error);
        summary.set(
          `${this.formatDate(range.checkIn)}_${this.formatDate(range.checkOut)}`,
          0
        );
      }
    }

    return summary;
  }
}

// Export singleton instance
export const availabilityService = new AvailabilityService();

// Made with Bob
