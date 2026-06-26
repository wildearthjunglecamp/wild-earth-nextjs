'use client';

/**
 * Pricing Breakdown Component
 * Displays detailed pricing information including date-specific prices
 */

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Loader2, Calendar, TrendingUp, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';

interface DailyPrice {
  date: string;
  price: number;
  isCustomPrice: boolean;
}

interface TentItemPricing {
  tentTypeSlug: string;
  tentTypeName: string;
  quantity: number;
  basePrice: number;
  pricePerNight: number;
  totalPrice: number;
  hasCustomPricing: boolean;
  dailyPrices?: DailyPrice[];
  isByot?: boolean;
}

interface PricingBreakdownProps {
  tentItems: Array<{
    tentTypeSlug: string;
    quantity: number;
  }>;
  checkIn: string;
  checkOut: string;
  showDailyBreakdown?: boolean;
}

export function PricingBreakdown({
  tentItems,
  checkIn,
  checkOut,
  showDailyBreakdown = false,
}: PricingBreakdownProps) {
  const [pricing, setPricing] = useState<TentItemPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tentItems.length > 0 && checkIn && checkOut) {
      fetchPricing();
    }
  }, [tentItems, checkIn, checkOut]);

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);

    try {
      const pricingData: TentItemPricing[] = [];

      for (const item of tentItems) {
        // Fetch pricing for this tent type
        const response = await fetch(
          `/api/pricing/range?tentTypeId=${item.tentTypeSlug}&startDate=${checkIn}&endDate=${checkOut}&quantity=${item.quantity}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch pricing');
        }

        const data = await response.json();

        if (data.success) {
          pricingData.push({
            tentTypeSlug: item.tentTypeSlug,
            tentTypeName: data.data.tentTypeName || item.tentTypeSlug,
            quantity: item.quantity,
            basePrice: data.data.basePrice || 0,
            pricePerNight: data.data.averagePrice || 0,
            totalPrice: data.data.totalPrice || 0,
            hasCustomPricing: data.data.dailyPrices?.some(
              (dp: DailyPrice) => dp.isCustomPrice
            ),
            dailyPrices: data.data.dailyPrices || [],
          });
        }
      }

      setPricing(pricingData);
    } catch (err) {
      console.error('Error fetching pricing:', err);
      setError('Failed to load pricing information');
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalAmount = () => {
    return pricing.reduce((sum, item) => sum + item.totalPrice, 0);
  };

  const nights = calculateNights();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Pricing Breakdown
        </CardTitle>
        <CardDescription>
          {nights} night{nights !== 1 ? 's' : ''} • {checkIn} to {checkOut}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pricing.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{item.tentTypeName}</h4>
                  {item.hasCustomPricing && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge variant="secondary" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Custom Pricing
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Special pricing applied for selected dates</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.isByot
                    ? `${item.quantity} guest${item.quantity !== 1 ? 's' : ''} × ${nights} night${nights !== 1 ? 's' : ''}`
                    : `${item.quantity} tent${item.quantity !== 1 ? 's' : ''} × ${nights} night${nights !== 1 ? 's' : ''}`
                  }
                </p>
                {!item.hasCustomPricing && !item.isByot && (
                  <p className="text-xs text-muted-foreground">
                    Base price: ₹{item.basePrice.toLocaleString()} per night
                  </p>
                )}
                {item.isByot && (
                  <p className="text-xs text-muted-foreground">
                    Per guest pricing: ₹{item.pricePerNight.toLocaleString()} per guest per night
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  ₹{item.totalPrice.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.isByot
                    ? `₹${item.pricePerNight.toLocaleString()}/guest/night`
                    : `₹${item.pricePerNight.toLocaleString()}/night avg`
                  }
                </p>
              </div>
            </div>

            {/* Daily Breakdown */}
            {showDailyBreakdown && item.dailyPrices && item.dailyPrices.length > 0 && (
              <div className="ml-4 space-y-1 border-l-2 border-muted pl-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Daily Breakdown:
                </p>
                {item.dailyPrices.map((daily, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {new Date(daily.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      {daily.isCustomPrice && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-3 w-3 text-primary" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Custom price for this date</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <span
                      className={
                        daily.isCustomPrice
                          ? 'font-medium text-primary'
                          : 'text-muted-foreground'
                      }
                    >
                      ₹{daily.price.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {index < pricing.length - 1 && <Separator className="my-2" />}
          </div>
        ))}

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="font-semibold text-lg">Total Amount</p>
            <p className="text-xs text-muted-foreground">
              Including all tents and nights
            </p>
          </div>
          <p className="text-2xl font-bold">
            ₹{getTotalAmount().toLocaleString()}
          </p>
        </div>

        {/* Custom Pricing Notice */}
        {pricing.some((item) => item.hasCustomPricing) && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary">
                  Special Pricing Applied
                </p>
                <p className="text-muted-foreground">
                  Some dates have custom pricing. The total reflects these
                  adjustments.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Made with Bob