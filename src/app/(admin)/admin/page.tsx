/**
 * Admin Dashboard Page
 * Main dashboard with overview statistics and quick actions
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import {
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Tent,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard | Wild Earth Admin',
  description: 'Admin dashboard overview for Wild Earth Campsite',
};

/**
 * Dashboard page component
 * Server component with authentication check
 */
export default async function AdminDashboardPage() {
  // Require admin authentication
  const session = await requireAdmin();

  // TODO: Fetch real data from database
  const stats = {
    totalBookings: 156,
    bookingsChange: 12.5,
    revenue: 245000,
    revenueChange: 8.2,
    occupancyRate: 78,
    occupancyChange: -3.1,
    availableTents: 8,
    tentsChange: 0,
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-headline-md font-display text-on-surface">Dashboard</h1>
        <p className="text-body-md font-sans text-on-surface-variant mt-2">
          Welcome back, {session.user?.email?.split('@')[0]}! Here's what's happening today.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Total Bookings
            </CardTitle>
            <Calendar className="h-4 w-4 text-on-surface-variant" />
          </CardHeader>
          <CardContent>
            <div className="text-headline-sm font-display text-on-surface">{stats.totalBookings}</div>
            <div className="flex items-center text-label-sm font-sans mt-1">
              {stats.bookingsChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-primary mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-error mr-1" />
              )}
              <span
                className={
                  stats.bookingsChange > 0 ? 'text-primary' : 'text-error'
                }
              >
                {Math.abs(stats.bookingsChange)}%
              </span>
              <span className="text-on-surface-variant ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-on-surface-variant" />
          </CardHeader>
          <CardContent>
            <div className="text-headline-sm font-display text-on-surface">
              ₹{stats.revenue.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center text-label-sm font-sans mt-1">
              {stats.revenueChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-primary mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-error mr-1" />
              )}
              <span
                className={
                  stats.revenueChange > 0 ? 'text-primary' : 'text-error'
                }
              >
                {Math.abs(stats.revenueChange)}%
              </span>
              <span className="text-on-surface-variant ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Occupancy Rate */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Occupancy Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-on-surface-variant" />
          </CardHeader>
          <CardContent>
            <div className="text-headline-sm font-display text-on-surface">{stats.occupancyRate}%</div>
            <div className="flex items-center text-label-sm font-sans mt-1">
              {stats.occupancyChange > 0 ? (
                <ArrowUpRight className="h-3 w-3 text-primary mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 text-error mr-1" />
              )}
              <span
                className={
                  stats.occupancyChange > 0 ? 'text-primary' : 'text-error'
                }
              >
                {Math.abs(stats.occupancyChange)}%
              </span>
              <span className="text-on-surface-variant ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Available Tents */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Available Tents
            </CardTitle>
            <Tent className="h-4 w-4 text-on-surface-variant" />
          </CardHeader>
          <CardContent>
            <div className="text-headline-sm font-display text-on-surface">{stats.availableTents}</div>
            <p className="text-label-sm font-sans text-on-surface-variant mt-1">Ready for booking</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader>
            <CardTitle className="text-headline-sm font-display text-on-surface">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/bookings">
              <Button className="w-full justify-start font-display rounded-md" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                View All Bookings
              </Button>
            </Link>
            <Link href="/admin/calendar">
              <Button className="w-full justify-start font-display rounded-md" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Check Availability
              </Button>
            </Link>
            <Link href="/admin/guests">
              <Button className="w-full justify-start font-display rounded-md" variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Manage Guests
              </Button>
            </Link>
            <Link href="/admin/reports">
              <Button className="w-full justify-start font-display rounded-md" variant="outline">
                <TrendingUp className="mr-2 h-4 w-4" />
                View Reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader>
            <CardTitle className="text-headline-sm font-display text-on-surface">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                <div className="flex-1">
                  <p className="text-body-md font-sans font-medium text-on-surface">New booking received</p>
                  <p className="text-label-sm font-sans text-on-surface-variant">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-2 w-2 rounded-full bg-tertiary mt-2" />
                <div className="flex-1">
                  <p className="text-body-md font-sans font-medium text-on-surface">Payment confirmed</p>
                  <p className="text-label-sm font-sans text-on-surface-variant">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-2 w-2 rounded-full bg-secondary mt-2" />
                <div className="flex-1">
                  <p className="text-body-md font-sans font-medium text-on-surface">Booking cancelled</p>
                  <p className="text-label-sm font-sans text-on-surface-variant">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-2 w-2 rounded-full bg-primary-fixed-dim mt-2" />
                <div className="flex-1">
                  <p className="text-body-md font-sans font-medium text-on-surface">New guest registered</p>
                  <p className="text-label-sm font-sans text-on-surface-variant">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TODO: Add charts and more detailed analytics */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-surface">Revenue Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-on-surface-variant font-sans">
            <p>Chart component will be implemented here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Made with Bob