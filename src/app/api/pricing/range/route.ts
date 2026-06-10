/**
 * API Route: /api/pricing/range
 * GET: Get prices for a date range
 * POST: Calculate total for a date range
 * DELETE: Delete pricing for a date range
 */

import { NextRequest, NextResponse } from 'next/server';
import { pricingService } from '../../../../services/pricing.service';
import {
  getPricesForRangeSchema,
  deletePricingRangeSchema,
} from '../../../../validations/pricing.schema';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const input = {
      tentTypeId: searchParams.get('tentTypeId') || '',
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
      quantity: searchParams.get('quantity')
        ? parseInt(searchParams.get('quantity')!)
        : 1,
    };

    // Validate input
    const validation = getPricesForRangeSchema.safeParse(input);
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

    const prices = await pricingService.getPricesForRange(
      validation.data.tentTypeId,
      validation.data.startDate,
      validation.data.endDate
    );

    const total = await pricingService.calculateTotalForRange(
      validation.data.tentTypeId,
      validation.data.startDate,
      validation.data.endDate,
      validation.data.quantity
    );

    return NextResponse.json({
      success: true,
      data: {
        tentTypeId: validation.data.tentTypeId,
        startDate: validation.data.startDate,
        endDate: validation.data.endDate,
        quantity: validation.data.quantity,
        dailyPrices: prices,
        totalPrice: total,
        nights: prices.length,
        averagePrice: prices.length > 0 ? total / prices.length / validation.data.quantity : 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching price range:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch price range',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = getPricesForRangeSchema.safeParse(body);
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

    const total = await pricingService.calculateTotalForRange(
      validation.data.tentTypeId,
      validation.data.startDate,
      validation.data.endDate,
      validation.data.quantity
    );

    return NextResponse.json({
      success: true,
      data: {
        tentTypeId: validation.data.tentTypeId,
        startDate: validation.data.startDate,
        endDate: validation.data.endDate,
        quantity: validation.data.quantity,
        totalPrice: total,
      },
    });
  } catch (error: any) {
    console.error('Error calculating total:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate total',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = deletePricingRangeSchema.safeParse(body);
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

    const result = await pricingService.deletePricingRange(
      validation.data.tentTypeId,
      validation.data.startDate,
      validation.data.endDate
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: `Successfully deleted ${result.deletedCount} pricing record(s)`,
    });
  } catch (error: any) {
    console.error('Error deleting pricing range:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete pricing range',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Made with Bob