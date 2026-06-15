/**
 * Admin Dashboard Page
 * Main dashboard with overview statistics, charts, and booking tables
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
  LogOut,
  LogIn,
  Percent,
  Receipt,
  CreditCard,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard | Wild Earth Admin',
  description: 'Admin dashboard overview for Wild Earth Campsite',
};

/**
 * Sample data for the dashboard
 */
const dashboardData = {
  todayArrivals: 12,
  todayCheckouts: 8,
  currentOccupancy: 85,
  revenueThisMonth: 450000,
  expensesThisMonth: 120000,
  profitThisMonth: 330000,
  revenueChange: 12,
  expensesChange: 8,
  profitChange: 15,
  
  // Monthly revenue data (last 6 months)
  monthlyRevenue: [
    { month: 'Jan', value: 320000 },
    { month: 'Feb', value: 350000 },
    { month: 'Mar', value: 280000 },
    { month: 'Apr', value: 420000 },
    { month: 'May', value: 380000 },
    { month: 'Jun', value: 450000 },
  ],
  
  // Monthly occupancy data (last 6 months)
  monthlyOccupancy: [
    { month: 'Jan', value: 72 },
    { month: 'Feb', value: 68 },
    { month: 'Mar', value: 75 },
    { month: 'Apr', value: 82 },
    { month: 'May', value: 78 },
    { month: 'Jun', value: 85 },
  ],
  
  // Upcoming arrivals
  upcomingArrivals: [
    { id: 'WH-1042', guestName: 'Eleanor Vance', tent: 'Safari Suite 3', time: '14:00', date: 'Today' },
    { id: 'WH-1043', guestName: 'Marcus Sterling', tent: 'Canyon Tent 1', time: '15:30', date: 'Today' },
    { id: 'WH-1044', guestName: 'Sophia Lin', tent: 'River Lodge 2', time: '16:00', date: 'Today' },
    { id: 'WH-1045', guestName: 'David Rossi', tent: 'Safari Suite 1', time: '17:15', date: 'Today' },
    { id: 'WH-1046', guestName: 'Priya Sharma', tent: 'Mountain View 4', time: '10:00', date: 'Tomorrow' },
  ],
  
  // Recent bookings
  recentBookings: [
    { id: 'WH-1089', amount: 45000, status: 'confirmed', date: '2 hours ago' },
    { id: 'WH-1088', amount: 32000, status: 'pending', date: '5 hours ago' },
    { id: 'WH-1087', amount: 58000, status: 'confirmed', date: '1 day ago' },
    { id: 'WH-1086', amount: 24000, status: 'confirmed', date: '1 day ago' },
    { id: 'WH-1085', amount: 67000, status: 'confirmed', date: '2 days ago' },
  ],
};

/**
 * Dashboard page component
 * Server component with authentication check
 */
export default async function AdminDashboardPage() {
  // Require admin authentication
  const session = await requireAdmin();

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <p className="text-label-sm font-display text-on-surface-variant uppercase tracking-wider">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <h1 className="text-display-lg-mobile lg:text-headline-md font-display text-on-surface mt-1">
          Welcome back, Admin
        </h1>
      </div>

      {/* Summary cards - Top row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Arrivals */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Today's Arrivals
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg-mobile font-display text-on-surface">{dashboardData.todayArrivals}</div>
            <p className="text-label-sm font-sans text-on-surface-variant mt-1">Guests checking in</p>
          </CardContent>
        </Card>

        {/* Today's Checkouts */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Today's Checkouts
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-tertiary/10 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-tertiary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg-mobile font-display text-on-surface">{dashboardData.todayCheckouts}</div>
            <p className="text-label-sm font-sans text-on-surface-variant mt-1">Guests checking out</p>
          </CardContent>
        </Card>

        {/* Current Occupancy */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Current Occupancy
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <Tent className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-display-lg-mobile font-display text-on-surface">{dashboardData.currentOccupancy}%</div>
            <div className="w-full bg-surface-container h-2 rounded-full mt-3">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${dashboardData.currentOccupancy}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial cards - Second row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue This Month */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Revenue This Month
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md font-display text-on-surface">
              ₹{dashboardData.revenueThisMonth.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center text-label-sm font-sans mt-2">
              <ArrowUpRight className="h-3 w-3 text-primary mr-1" />
              <span className="text-primary font-semibold">{dashboardData.revenueChange}%</span>
              <span className="text-on-surface-variant ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses This Month */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Expenses This Month
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-error/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-error" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md font-display text-on-surface">
              ₹{dashboardData.expensesThisMonth.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center text-label-sm font-sans mt-2">
              <ArrowUpRight className="h-3 w-3 text-error mr-1" />
              <span className="text-error font-semibold">{dashboardData.expensesChange}%</span>
              <span className="text-on-surface-variant ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Profit This Month */}
        <Card className="bg-primary shadow-level-2 border-primary rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-primary/80 uppercase">
              Profit This Month
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-on-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-on-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md font-display text-on-primary">
              ₹{dashboardData.profitThisMonth.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center text-label-sm font-sans mt-2">
              <ArrowUpRight className="h-3 w-3 text-primary-fixed-dim mr-1" />
              <span className="text-primary-fixed-dim font-semibold">{dashboardData.profitChange}%</span>
              <span className="text-on-primary/70 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader>
            <CardTitle className="text-headline-sm font-display text-on-surface">Monthly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {dashboardData.monthlyRevenue.map((item, index) => {
                const maxValue = Math.max(...dashboardData.monthlyRevenue.map(d => d.value));
                const height = (item.value / maxValue) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-primary/10 rounded-t-md relative group cursor-pointer hover:bg-primary/20 transition-colors" style={{ height: `${height}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-on-primary text-xs px-2 py-1 rounded whitespace-nowrap">
                        ₹{(item.value / 1000).toFixed(0)}K
                      </div>
                    </div>
                    <span className="text-label-sm font-sans text-on-surface-variant">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Occupancy Chart */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader>
            <CardTitle className="text-headline-sm font-display text-on-surface">Monthly Occupancy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {dashboardData.monthlyOccupancy.map((item, index) => {
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-tertiary/10 rounded-t-md relative group cursor-pointer hover:bg-tertiary/20 transition-colors" style={{ height: `${item.value}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-tertiary text-on-tertiary text-xs px-2 py-1 rounded whitespace-nowrap">
                        {item.value}%
                      </div>
                    </div>
                    <span className="text-label-sm font-sans text-on-surface-variant">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Arrivals */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-headline-sm font-display text-on-surface">Upcoming Arrivals</CardTitle>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-display">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-outline-variant">
                <div className="col-span-3 text-label-sm font-display text-on-surface-variant uppercase">Booking ID</div>
                <div className="col-span-4 text-label-sm font-display text-on-surface-variant uppercase">Guest Name</div>
                <div className="col-span-3 text-label-sm font-display text-on-surface-variant uppercase">Tent</div>
                <div className="col-span-2 text-label-sm font-display text-on-surface-variant uppercase text-right">Time</div>
              </div>
              
              {/* Table rows */}
              {dashboardData.upcomingArrivals.map((booking) => (
                <div key={booking.id} className="grid grid-cols-12 gap-4 py-3 border-b border-outline-variant/50 hover:bg-surface-container transition-colors rounded-md px-2 -mx-2">
                  <div className="col-span-3 text-body-md font-sans text-on-surface font-medium">#{booking.id}</div>
                  <div className="col-span-4 text-body-md font-sans text-on-surface">{booking.guestName}</div>
                  <div className="col-span-3">
                    <Badge variant="secondary" className="text-label-sm font-sans bg-tertiary-container text-on-tertiary-container">
                      {booking.tent}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-body-md font-sans text-on-surface text-right">{booking.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-headline-sm font-display text-on-surface">Recent Bookings</CardTitle>
            <Link href="/admin/bookings">
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 font-display">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 pb-3 border-b border-outline-variant">
                <div className="col-span-4 text-label-sm font-display text-on-surface-variant uppercase">Booking ID</div>
                <div className="col-span-4 text-label-sm font-display text-on-surface-variant uppercase">Amount</div>
                <div className="col-span-4 text-label-sm font-display text-on-surface-variant uppercase text-right">Status</div>
              </div>
              
              {/* Table rows */}
              {dashboardData.recentBookings.map((booking) => (
                <div key={booking.id} className="grid grid-cols-12 gap-4 py-3 border-b border-outline-variant/50 hover:bg-surface-container transition-colors rounded-md px-2 -mx-2">
                  <div className="col-span-4 text-body-md font-sans text-on-surface font-medium">#{booking.id}</div>
                  <div className="col-span-4 text-body-md font-sans text-on-surface">₹{booking.amount.toLocaleString('en-IN')}</div>
                  <div className="col-span-4 flex justify-end">
                    <Badge 
                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                      className={`text-label-sm font-sans ${
                        booking.status === 'confirmed' 
                          ? 'bg-primary text-on-primary' 
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {booking.status === 'confirmed' ? '● Confirmed' : '● Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Made with Bob