/**
 * Reports and Analytics Page
 * Real financial + operational reporting. 12-month trends; current-month
 * summary, breakdowns, and profit.
 */

import { Metadata } from 'next';
import {
  TrendingUp,
  Percent,
  IndianRupee,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { getReportsData } from '@/src/services/report.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { RevenueChart } from '@/src/components/admin/RevenueChart';

export const metadata: Metadata = {
  title: 'Reports & Analytics | Wild Earth Admin',
  description: 'Financial and operational reports',
};

export const dynamic = 'force-dynamic';

function DeltaBadge({ pct }: { pct: number }) {
  if (pct === 0) {
    return (
      <span className="text-label-sm font-sans text-on-surface-variant">→ No change</span>
    );
  }
  const up = pct > 0;
  return (
    <div className="flex items-center gap-1">
      {up ? (
        <ArrowUpRight className="h-4 w-4 text-primary" />
      ) : (
        <ArrowDownRight className="h-4 w-4 text-error" />
      )}
      <span className={`text-label-sm font-sans font-semibold ${up ? 'text-primary' : 'text-error'}`}>
        {up ? '+' : ''}
        {pct}% from last month
      </span>
    </div>
  );
}

export default async function ReportsPage() {
  await requireAdmin();

  const data = await getReportsData();
  const maxTypeRevenue = Math.max(1, ...data.revenueByTentType.map((t) => t.revenue));
  const maxExpense = Math.max(1, ...data.expenseBreakdown.map((e) => e.amount));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-headline-md font-display text-on-surface">Reports and Analytics</h1>
        <p className="text-body-md font-sans text-on-surface-variant mt-1">
          Current-month performance with 12-month trends
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Revenue (This Month)
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <IndianRupee className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md font-display text-on-surface">
              ₹{data.summary.totalRevenue.toLocaleString('en-IN')}
            </div>
            <div className="mt-2">
              <DeltaBadge pct={data.summary.revenueChangePct} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Occupancy (This Month)
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-tertiary/10 flex items-center justify-center">
              <Percent className="h-5 w-5 text-tertiary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md font-display text-on-surface">
              {data.summary.occupancyRate}%
            </div>
            <div className="mt-2">
              <DeltaBadge pct={data.summary.occupancyChangePct} />
            </div>
          </CardContent>
        </Card>

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
            <div className="text-headline-md font-display text-on-surface">
              ₹{data.summary.avgDailyRate.toLocaleString('en-IN')}
            </div>
            <p className="text-label-sm font-sans text-on-surface-variant mt-2">
              Revenue per occupied tent-night
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue trend */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-surface">
            Revenue Trend (12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={data.revenueByMonth.map((m) => ({ month: m.month, value: m.revenue }))} />
        </CardContent>
      </Card>

      {/* Revenue by type + Expense breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-headline-sm font-display text-on-surface">
              Revenue Analysis
            </CardTitle>
            <Badge variant="outline" className="text-label-sm font-sans">By Tent Type · This Month</Badge>
          </CardHeader>
          <CardContent>
            {data.revenueByTentType.length === 0 ? (
              <p className="text-body-md font-sans text-on-surface-variant">No revenue this month.</p>
            ) : (
              <div className="space-y-6">
                {data.revenueByTentType.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-body-md font-sans text-on-surface font-medium">{item.type}</span>
                      <span className="text-body-md font-sans text-on-surface font-semibold">
                        ₹{item.revenue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="relative w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full"
                        style={{ width: `${Math.round((item.revenue / maxTypeRevenue) * 100)}%` }}
                      />
                    </div>
                    <p className="text-label-sm font-sans text-on-surface-variant">
                      {item.percentage}% of accommodation revenue
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-headline-sm font-display text-on-surface">
              Expense Breakdown
            </CardTitle>
            <Badge variant="outline" className="text-label-sm font-sans">This Month</Badge>
          </CardHeader>
          <CardContent>
            {data.expenseBreakdown.length === 0 ? (
              <p className="text-body-md font-sans text-on-surface-variant">No expenses this month.</p>
            ) : (
              <div className="space-y-6">
                {data.expenseBreakdown.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-body-md font-sans text-on-surface font-medium">{item.category}</span>
                      <span className="text-body-md font-sans text-on-surface font-semibold">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="relative w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-tertiary rounded-full"
                        style={{ width: `${Math.round((item.amount / maxExpense) * 100)}%` }}
                      />
                    </div>
                    <p className="text-label-sm font-sans text-on-surface-variant">
                      {item.percentage}% of this month's expenses
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Occupancy trend */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-surface">Occupancy Trend</CardTitle>
          <p className="text-body-md font-sans text-on-surface-variant mt-1">
            Monthly occupancy over the last 12 months
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between gap-2">
            {data.occupancyTrends.map((item) => (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full relative group cursor-pointer flex items-end" style={{ height: 200 }}>
                  <div
                    className="w-full bg-primary/20 rounded-t-md hover:bg-primary/30 transition-colors relative"
                    style={{ height: `${Math.max((item.rate / 100) * 200, 2)}px` }}
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

      {/* Profit summary */}
      <Card className="bg-primary shadow-level-2 border-primary rounded-lg">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-primary">
            Profit Summary (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-label-sm font-display text-on-primary/70 uppercase">Total Revenue</p>
              <p className="text-headline-sm font-display text-on-primary mt-1">
                ₹{data.profitSummary.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-label-sm font-display text-on-primary/70 uppercase">Total Expenses</p>
              <p className="text-headline-sm font-display text-on-primary mt-1">
                ₹{data.profitSummary.totalExpenses.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-label-sm font-display text-on-primary/70 uppercase">Net Profit</p>
              <p className="text-headline-sm font-display text-on-primary mt-1">
                ₹{data.profitSummary.netProfit.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-label-sm font-display text-on-primary/70 uppercase">Profit Margin</p>
              <p className="text-headline-sm font-display text-on-primary mt-1">
                {data.profitSummary.profitMargin}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Made with Bob
