/**
 * Reports and Analytics Page
 * Comprehensive financial and operational reports
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import {
  FileText,
  Download,
  TrendingUp,
  Percent,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reports & Analytics | Wild Earth Admin',
  description: 'Financial and operational reports',
};

/**
 * Sample reports data
 */
const reportsData = {
  summary: {
    totalRevenue: 124500,
    revenueChange: 12.5,
    occupancyRate: 87,
    occupancyChange: 4.2,
    avgDailyRate: 450,
    avgDailyRateChange: 0,
  },
  
  // Revenue by month (last 12 months)
  revenueByMonth: [
    { month: 'Jan', revenue: 95000, bookings: 45 },
    { month: 'Feb', revenue: 88000, bookings: 42 },
    { month: 'Mar', revenue: 102000, bookings: 52 },
    { month: 'Apr', revenue: 115000, bookings: 58 },
    { month: 'May', revenue: 108000, bookings: 54 },
    { month: 'Jun', revenue: 125000, bookings: 62 },
    { month: 'Jul', revenue: 142000, bookings: 71 },
    { month: 'Aug', revenue: 138000, bookings: 69 },
    { month: 'Sep', revenue: 118000, bookings: 59 },
    { month: 'Oct', revenue: 124500, bookings: 63 },
    { month: 'Nov', revenue: 0, bookings: 0 },
    { month: 'Dec', revenue: 0, bookings: 0 },
  ],
  
  // Revenue by tent type
  revenueByTentType: [
    { type: 'Safari Suite', revenue: 45000, percentage: 36 },
    { type: 'Luxury Geodome', revenue: 35000, percentage: 28 },
    { type: 'Treehouse', revenue: 25000, percentage: 20 },
    { type: 'Riverside Cabin', revenue: 19500, percentage: 16 },
  ],
  
  // Expense breakdown
  expenseBreakdown: [
    { category: 'Operations', amount: 23540, percentage: 55, color: 'primary' },
    { category: 'Marketing', amount: 10695, percentage: 25, color: 'tertiary' },
    { category: 'Maintenance', amount: 8556, percentage: 20, color: 'secondary' },
  ],
  totalExpenses: 42791,
  
  // Profit summary
  profitSummary: {
    totalRevenue: 124500,
    totalExpenses: 42791,
    netProfit: 81709,
    profitMargin: 65.6,
  },
  
  // Occupancy trends (last 12 months)
  occupancyTrends: [
    { month: 'Jan', rate: 72 },
    { month: 'Feb', rate: 68 },
    { month: 'Mar', rate: 75 },
    { month: 'Apr', rate: 82 },
    { month: 'May', rate: 78 },
    { month: 'Jun', rate: 85 },
    { month: 'Jul', rate: 92 },
    { month: 'Aug', rate: 90 },
    { month: 'Sep', rate: 83 },
    { month: 'Oct', rate: 87 },
    { month: 'Nov', rate: 0 },
    { month: 'Dec', rate: 0 },
  ],
};

export default async function ReportsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-display text-on-surface">Reports and Analytics</h1>
          <p className="text-body-md font-sans text-on-surface-variant mt-1">
            Review your property's performance and financial health
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-display rounded-md">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="font-display rounded-md">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Revenue */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Total Revenue
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg-mobile font-display text-on-surface">
              ${reportsData.summary.totalRevenue.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span className="text-label-sm font-sans text-primary font-semibold">
                +{reportsData.summary.revenueChange}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Occupancy Rate
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-tertiary/10 flex items-center justify-center">
              <Percent className="h-5 w-5 text-tertiary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg-mobile font-display text-on-surface">
              {reportsData.summary.occupancyRate}%
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <span className="text-label-sm font-sans text-primary font-semibold">
                +{reportsData.summary.occupancyChange}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Daily Rate */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Avg. Daily Rate
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg-mobile font-display text-on-surface">
              ${reportsData.summary.avgDailyRate}
            </div>
            <p className="text-label-sm font-sans text-on-surface-variant mt-2">
              → Stable this quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analysis */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-headline-sm font-display text-on-surface">
              Revenue Analysis
            </CardTitle>
            <Badge variant="outline" className="text-label-sm font-sans">
              By Tent Type
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reportsData.revenueByTentType.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-body-md font-sans text-on-surface font-medium">
                      {item.type}
                    </span>
                    <span className="text-body-md font-sans text-on-surface font-semibold">
                      ${item.revenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <p className="text-label-sm font-sans text-on-surface-variant">
                    {item.percentage}% of total revenue
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader>
            <CardTitle className="text-headline-sm font-display text-on-surface">
              Expense Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-6">
              {/* Donut chart representation */}
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Operations - 55% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    strokeDasharray="138.23 251.33"
                    strokeDashoffset="0"
                    className="text-primary"
                  />
                  {/* Marketing - 25% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    strokeDasharray="62.83 251.33"
                    strokeDashoffset="-138.23"
                    className="text-tertiary"
                  />
                  {/* Maintenance - 20% */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="20"
                    strokeDasharray="50.27 251.33"
                    strokeDashoffset="-201.06"
                    className="text-secondary"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-label-sm font-display text-on-surface-variant uppercase">Total</span>
                  <span className="text-headline-sm font-display text-on-surface">
                    ${(reportsData.totalExpenses / 1000).toFixed(1)}k
                  </span>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="space-y-3">
              {reportsData.expenseBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full bg-${item.color}`} />
                    <span className="text-body-md font-sans text-on-surface">{item.category}</span>
                  </div>
                  <span className="text-body-md font-sans text-on-surface font-semibold">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Trends */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-headline-sm font-display text-on-surface">
              Booking Trends
            </CardTitle>
            <p className="text-body-md font-sans text-on-surface-variant mt-1">
              Monthly occupancy rate over the last year
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container rounded-md p-1">
            <Button variant="ghost" size="sm" className="font-display rounded-md text-xs">
              6M
            </Button>
            <Button variant="default" size="sm" className="bg-primary text-on-primary font-display rounded-md text-xs">
              1Y
            </Button>
            <Button variant="ghost" size="sm" className="font-display rounded-md text-xs">
              YTD
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Line chart representation */}
          <div className="h-64 flex items-end justify-between gap-2">
            {reportsData.occupancyTrends.filter(d => d.rate > 0).map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group cursor-pointer">
                  <div
                    className="w-full bg-primary/20 rounded-t-md hover:bg-primary/30 transition-colors"
                    style={{ height: `${(item.rate / 100) * 200}px` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-on-primary text-xs px-2 py-1 rounded whitespace-nowrap">
                      {item.rate}%
                    </div>
                  </div>
                </div>
                <span className="text-label-sm font-sans text-on-surface-variant">{item.month}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profit Summary */}
      <Card className="bg-primary shadow-level-2 border-primary rounded-lg">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-primary">
            Profit Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-label-sm font-display text-on-primary/70 uppercase">Total Revenue</p>
              <p className="text-headline-sm font-display text-on-primary mt-1">
                ${reportsData.profitSummary.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-label-sm font-display text-on-primary/70 uppercase">Total Expenses</p>
              <p className="text-headline-sm font-display text-on-primary mt-1">
                ${reportsData.profitSummary.totalExpenses.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-label-sm font-display text-on-primary/70 uppercase">Net Profit</p>
              <p className="text-headline-sm font-display text-on-primary mt-1">
                ${reportsData.profitSummary.netProfit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-label-sm font-display text-on-primary/70 uppercase">Profit Margin</p>
              <p className="text-headline-sm font-display text-on-primary mt-1">
                {reportsData.profitSummary.profitMargin}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Made with Bob
