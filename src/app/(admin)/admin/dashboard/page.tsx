/**
 * Admin Dashboard
 * Headline operational stats + recent bookings (real data).
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { CalendarCheck, IndianRupee, Percent, Tent, ArrowRight } from 'lucide-react';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { getDashboardStats, getMonthlyRevenue } from '@/src/services/booking.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { RevenueChart } from '@/src/components/admin/RevenueChart';

export const metadata: Metadata = {
  title: 'Dashboard | Wild Earth Admin',
  description: 'Admin dashboard overview',
};

export const dynamic = 'force-dynamic';

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  'checked-in': 'Checked In',
  'checked-out': 'Checked Out',
  cancelled: 'Cancelled',
  'no-show': 'No Show',
};

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-primary text-on-primary',
  pending: 'bg-secondary-container text-on-secondary-container',
  'checked-in': 'bg-tertiary-container text-on-tertiary-container',
  'checked-out': 'bg-surface-container-high text-on-surface',
  cancelled: 'bg-error-container text-on-error-container',
  'no-show': 'bg-error-container text-on-error-container',
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default async function DashboardPage() {
  await requireAdmin();

  const [stats, monthlyRevenue] = await Promise.all([
    getDashboardStats(),
    getMonthlyRevenue(6),
  ]);

  const cards = [
    {
      label: 'Active Bookings',
      value: stats.totalBookings.toLocaleString('en-IN'),
      icon: CalendarCheck,
    },
    {
      label: 'Revenue (This Month)',
      value: `₹${stats.revenueThisMonth.toLocaleString('en-IN')}`,
      icon: IndianRupee,
    },
    {
      label: 'Occupancy (Today)',
      value: `${stats.occupancyRate}%`,
      icon: Percent,
    },
    {
      label: 'Available Tents (Today)',
      value: stats.availableTents.toLocaleString('en-IN'),
      icon: Tent,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md font-display text-on-surface">Dashboard</h1>
        <p className="text-body-md font-sans text-on-surface-variant mt-1">
          Overview of bookings, revenue, and occupancy
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card
            key={card.label}
            className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-label-md font-sans text-on-surface-variant">
                  {card.label}
                </h3>
                <card.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-headline-md font-display text-on-surface mt-2">
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue chart */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-surface">
            Revenue (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={monthlyRevenue} />
        </CardContent>
      </Card>

      {/* Recent bookings */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-headline-sm font-display text-on-surface">
            Recent Bookings
          </CardTitle>
          <Link
            href="/admin/bookings"
            className="text-label-md font-sans text-primary hover:text-primary-container flex items-center gap-1"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentBookings.length === 0 ? (
            <p className="text-body-md font-sans text-on-surface-variant py-6 text-center">
              No bookings yet.
            </p>
          ) : (
            <div className="divide-y divide-outline-variant">
              {stats.recentBookings.map((b) => (
                <Link
                  key={b.bookingId}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center justify-between py-3 hover:bg-surface-container -mx-2 px-2 rounded-md transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-body-md font-sans font-medium text-on-surface truncate">
                      {b.customerName}
                    </p>
                    <p className="text-label-sm font-sans text-on-surface-variant">
                      #{b.id} • {formatDate(b.checkIn)}–{formatDate(b.checkOut)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="text-body-md font-sans font-semibold text-on-surface">
                      ₹{b.amount.toLocaleString('en-IN')}
                    </span>
                    <Badge className={`${STATUS_BADGE[b.status]} text-label-sm font-sans`}>
                      {STATUS_LABEL[b.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

// Made with Bob
