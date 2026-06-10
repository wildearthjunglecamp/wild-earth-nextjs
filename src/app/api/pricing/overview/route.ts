/**
 * API Route: /api/pricing/overview
 * GET: Get pricing overview for all tent types or a specific tent type
 */

import { NextRequest, NextResponse } from 'next/server';
import { pricingService } from '../../../../services/pricing.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tentTypeId = searchParams.get('tentTypeId');

    if (tentTypeId) {
      // Get overview for specific tent type
      const overview = await pricingService.getPricingOverviewByTentType(
        tentTypeId
      );

      if (!overview) {
        return NextResponse.json(
          {
            success: false,
            error: 'Tent type not found',
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: overview,
      });
    } else {
      // Get overview for all tent types
      const overviews = await pricingService.getPricingOverview();

      return NextResponse.json({
        success: true,
        data: overviews,
        count: overviews.length,
      });
    }
  } catch (error: any) {
    console.error('Error fetching pricing overview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pricing overview',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// Made with Bob