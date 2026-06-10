/**
 * API Route: /api/pricing
 * GET: Get all date-specific pricing with filters
 */

import { NextRequest, NextResponse } from 'next/server';
import { pricingService } from '../../../services/pricing.service';
import { datePricingFiltersSchema } from '../../../validations/pricing.schema';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const filters = {
      tentTypeId: searchParams.get('tentTypeId') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      hasCustomPrice: searchParams.get('hasCustomPrice') === 'true' ? true : undefined,
    };

    // Validate filters
    const validation = datePricingFiltersSchema.safeParse(filters);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid filters',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    // Get pricing data
    const pricing = await pricingService.getAllPricing(validation.data);

    return NextResponse.json({
      success: true,
      data: pricing,
      count: pricing.length,
    });
  } catch (error: any) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pricing',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Made with Bob