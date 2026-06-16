'use client';

/**
 * Revenue Chart
 * Monthly paid-revenue bar chart for the admin dashboard.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface RevenueChartProps {
  data: { month: string; value: number }[];
}

// Palette pulled from tailwind.config.ts (theme uses hex, not CSS vars).
const COLORS = {
  primary: '#012d1d',
  gridStroke: '#c1c8c2', // outline-variant
  axisStroke: '#414844', // on-surface-variant
  cursorFill: '#eeeeeb', // surface-container
};

function formatCompactINR(value: number): string {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const hasRevenue = data.some((d) => d.value > 0);

  if (!hasRevenue) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-body-md font-sans text-on-surface-variant">
          No paid revenue in this period yet.
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--outline-variant))" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            className="text-label-sm"
            stroke="hsl(var(--on-surface-variant))"
          />
          <YAxis
            tickFormatter={formatCompactINR}
            tickLine={false}
            axisLine={false}
            width={56}
            stroke="hsl(var(--on-surface-variant))"
            className="text-label-sm"
          />
          <Tooltip
            formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
            cursor={{ fill: 'hsl(var(--surface-container))' }}
            contentStyle={{
              borderRadius: 8,
              border: '1px solid hsl(var(--outline-variant))',
              fontSize: 12,
            }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Made with Bob
