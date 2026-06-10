/**
 * API Route: /api/pricing/create
 * POST: Create or bulk upsert date-specific pricing
 */

import { NextRequest, NextResponse } from 'next/server';
import { pricingService } from '../../../../services/pricing.service';
import {
  createDatePricingSchema,
  bulkUpsertPricingSchema,
} from '../../../../validations/pricing.schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Determine if this is a single create or bulk upsert
    const isBulk = Array.isArray(body.dates);

    if (isBulk) {
      // Bulk upsert
      const validation = bulkUpsertPricingSchema.safeParse(body);
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

      const result = await pricingService.bulkUpsertPricing(
        validation.data.tentTypeId,
        validation.data.dates,
        validation.data.customPrice,
        validation.data.notes
      );

      return NextResponse.json({
        success: true,
        data: result,
        message: `Successfully processed ${result.totalCount} date(s): ${result.insertedCount} created, ${result.updatedCount} updated`,
      });
    } else {
      // Single create
      const validation = createDatePricingSchema.safeParse(body);
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

      const pricing = await pricingService.createPricing(
        validation.data.tentTypeId,
        validation.data.date,
        validation.data.customPrice,
        validation.data.notes
      );

      return NextResponse.json({
        success: true,
        data: pricing,
        message: 'Pricing created successfully',
      });
    }
  } catch (error: any) {
    console.error('Error creating pricing:', error);

    // Handle specific errors
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Pricing already exists',
          message: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create pricing',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Made with Bob