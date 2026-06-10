/**
 * API Route: /api/pricing/[id]
 * GET: Get pricing by ID
 * PATCH: Update pricing
 * DELETE: Delete pricing
 */

import { NextRequest, NextResponse } from 'next/server';
import { pricingService } from '../../../../services/pricing.service';
import { updateDatePricingSchema } from '../../../../validations/pricing.schema';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pricing = await pricingService.getPricingById(params.id);

    if (!pricing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pricing not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pricing,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validate input
    const validation = updateDatePricingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const pricing = await pricingService.updatePricing(
      params.id,
      validation.data
    );

    return NextResponse.json({
      success: true,
      data: pricing,
      message: 'Pricing updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating pricing:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update pricing',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await pricingService.deletePricing(params.id);

    return NextResponse.json({
      success: true,
      message: 'Pricing deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting pricing:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete pricing',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Made with Bob