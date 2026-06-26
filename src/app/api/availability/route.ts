/**
 * Availability API Route
 * POST /api/availability
 * 
 * Check tent availability for given date range
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../lib/supabase/server';
import { availabilityRequestSchema } from '../../../validations/availability.schema';
import { ZodError } from 'zod';
import { AvailabilityService } from '@/src/services/availability.service';
import { pricingService } from '@/src/services/pricing.service';

/**
 * POST /api/availability
 * Check availability for date range
 */
// export const dynamic = "force-dynamic"
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input with Zod
    const validatedData = availabilityRequestSchema.parse(body);

    // Create Supabase client
    const supabase = await createClient();

    // Log the request for debugging
    console.log('Availability API Request:', {
      checkIn: validatedData.checkInDate,
      checkOut: validatedData.checkOutDate,
      guestCount: validatedData.guestCount,
    });

    // Call the PostgreSQL function to get available tents by type
    const { data, error } = await supabase.rpc('get_available_tents_by_type', {
      p_check_in: validatedData.checkInDate,
      p_check_out: validatedData.checkOutDate,
      p_guest_count: validatedData.guestCount || null,
    });

    // Handle Supabase errors with detailed logging
    if (error) {
      console.error('Supabase RPC Error Details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Database error',
          message: 'Failed to fetch availability. Please try again.',
          debug: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      );
    }

    // Log successful response
    console.log('Availability API Response:', {
      tentTypesFound: data?.length || 0,
      totalAvailable: data?.reduce((sum: number, item: any) => sum + parseInt(item.available_count || 0), 0) || 0,
    });

    // Transform data to match response schema
    const transformedData = (data || []).map((item: any) => ({
      tentTypeId: item.tent_type_id,
      tentTypeSlug: item.tent_type_slug,
      tentTypeName: item.tent_type_name,
      capacity: item.capacity,
      basePrice: parseFloat(item.base_price),
      description: item.description,
      amenities: item.amenities || [],
      images: item.images || [],
      availableCount: parseInt(item.available_count),
      totalCount: parseInt(item.total_count),
      availableTentIds: item.available_tent_ids || [],
      availableTentNumbers: item.available_tent_numbers || [],
      isByot: item.is_byot === true,
      perGuestPrice: item.per_guest_price ? parseFloat(item.per_guest_price) : undefined,
      maxGuestsPerNight: item.max_guests_per_night ? parseInt(item.max_guests_per_night) : undefined,
    }));

    // const transformedData = service.getAvailableTents({
    //     checkInDate: new Date(validatedData.checkInDate),
    //     checkOutDate: new Date(validatedData.checkOutDate),

    // }) as any

    // Calculate nights for additional info
    const checkIn = new Date(validatedData.checkInDate);
    const checkOut = new Date(validatedData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Enrich with date-specific effective pricing (quantity=1; frontend multiplies by qty).
    const enrichedData = await Promise.all(
      transformedData.map(async (tent: any) => {
        try {
          // For BYOT, pricing is per guest, not per tent
          if (tent.isByot && tent.perGuestPrice) {
            const pricePerGuestPerNight = tent.perGuestPrice;
            const stayTotal = pricePerGuestPerNight * nights;
            return {
              ...tent,
              effectivePrice: pricePerGuestPerNight,
              stayTotal,
            };
          }
          
          // Regular tent pricing
          const stayTotal = await pricingService.calculateTotalForRange(
            tent.tentTypeId,
            validatedData.checkInDate,
            validatedData.checkOutDate,
            1
          );
          return {
            ...tent,
            effectivePrice: nights > 0 ? Math.round(stayTotal / nights) : tent.basePrice,
            stayTotal,
          };
        } catch {
          return { ...tent, effectivePrice: tent.basePrice, stayTotal: tent.basePrice * nights };
        }
      })
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: enrichedData,
        meta: {
          checkIn: validatedData.checkInDate,
          checkOut: validatedData.checkOutDate,
          nights,
          guestCount: validatedData.guestCount,
          totalAvailable: enrichedData.reduce(
            (sum: number, type: any) => sum + type.availableCount,
            0
          ),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          message: 'Invalid input data',
          details: formattedErrors,
        },
        { status: 400 }
      );
    }

    // Handle JSON parse errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON',
        },
        { status: 400 }
      );
    }

    // Handle unexpected errors
    console.error('Unexpected error in availability API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/availability
 * Return API documentation
 */
export async function GET() {
  return NextResponse.json(
    {
      endpoint: '/api/availability',
      method: 'POST',
      description: 'Check tent availability for a given date range',
      requestBody: {
        checkIn: 'string (YYYY-MM-DD) - Check-in date',
        checkOut: 'string (YYYY-MM-DD) - Check-out date',
        guestCount: 'number (optional) - Number of guests',
      },
      example: {
        checkIn: '2024-06-15',
        checkOut: '2024-06-17',
        guestCount: 2,
      },
      response: {
        success: 'boolean',
        data: 'array of available tent types',
        meta: 'additional information',
      },
    },
    { status: 200 }
  );
}

/**
 * OPTIONS /api/availability
 * Handle CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

// Made with Bob
