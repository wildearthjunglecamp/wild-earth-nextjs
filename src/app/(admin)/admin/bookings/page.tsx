/**
 * Bookings List Page
 * Comprehensive booking management with filters, search, and actions
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { BookingsTable } from '@/src/components/admin/BookingsTable';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Search, Plus, Filter, Download } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bookings | Wild Earth Admin',
  description: 'Manage campsite bookings and reservations',
};

/**
 * Sample bookings data
 */
const bookingsData = [
  {
    id: 'WH-77342',
    customerName: 'Sarah Johnson',
    phone: '+1 (555) 293-8472',
    tentType: 'Big Jungle Tent',
    guests: 3,
    checkIn: '2024-10-15',
    checkOut: '2024-10-18',
    nights: 3,
    amount: 8250,
    status: 'confirmed',
    email: 'sarah.j@email.com',
  },
  {
    id: 'WH-77341',
    customerName: 'Michael Chen',
    phone: '+44 7700 900077',
    tentType: 'Luxury Geodome',
    guests: 2,
    checkIn: '2024-10-14',
    checkOut: '2024-10-20',
    nights: 6,
    amount: 18500,
    status: 'checked-in',
    email: 'mchen@email.com',
  },
  {
    id: 'WH-77338',
    customerName: 'Emma & James Wilson',
    phone: '+1 (555) 882-1093',
    tentType: 'Riverside Cabin',
    guests: 4,
    checkIn: '2024-10-10',
    checkOut: '2024-10-14',
    nights: 4,
    amount: 12000,
    status: 'checked-out',
    email: 'wilson.family@email.com',
  },
  {
    id: 'WH-77345',
    customerName: 'David Martinez',
    phone: '+34 600 123 456',
    tentType: 'Canopy Suite',
    guests: 2,
    checkIn: '2024-10-18',
    checkOut: '2024-10-20',
    nights: 2,
    amount: 6500,
    status: 'cancelled',
    email: 'dmartinez@email.com',
  },
  {
    id: 'WH-77346',
    customerName: 'Priya Sharma',
    phone: '+91 98765 43210',
    tentType: 'Big Jungle Tent',
    guests: 2,
    checkIn: '2024-10-22',
    checkOut: '2024-10-25',
    nights: 3,
    amount: 8250,
    status: 'confirmed',
    email: 'priya.sharma@email.com',
  },
  {
    id: 'WH-77347',
    customerName: 'Robert Anderson',
    phone: '+1 (555) 456-7890',
    tentType: 'Safari Suite',
    guests: 4,
    checkIn: '2024-10-25',
    checkOut: '2024-10-28',
    nights: 3,
    amount: 15000,
    status: 'confirmed',
    email: 'r.anderson@email.com',
  },
  {
    id: 'WH-77348',
    customerName: 'Lisa Thompson',
    phone: '+44 7911 123456',
    tentType: 'Mountain View',
    guests: 2,
    checkIn: '2024-10-20',
    checkOut: '2024-10-23',
    nights: 3,
    amount: 9500,
    status: 'pending',
    email: 'lisa.t@email.com',
  },
  {
    id: 'WH-77349',
    customerName: 'Carlos Rodriguez',
    phone: '+34 612 345 678',
    tentType: 'River Lodge',
    guests: 3,
    checkIn: '2024-10-28',
    checkOut: '2024-10-31',
    nights: 3,
    amount: 11250,
    status: 'confirmed',
    email: 'carlos.r@email.com',
  },
];

export default async function BookingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-display text-on-surface">Bookings</h1>
          <p className="text-body-md font-sans text-on-surface-variant mt-1">
            Manage resort reservations, update statuses, and oversee guest accommodations
          </p>
        </div>
        <Link href="/admin/bookings/new">
          <Button className="bg-primary text-on-primary hover:bg-primary-container font-display rounded-md">
            <Plus className="h-4 w-4 mr-2" />
            Create Booking
          </Button>
        </Link>
      </div>

      {/* Filters and search */}
      <div className="bg-surface-container-lowest shadow-level-1 border border-outline-variant rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                type="search"
                placeholder="Search bookings, guests, or IDs..."
                className="pl-9 bg-surface-container border-outline-variant focus:border-primary rounded-md font-sans"
              />
            </div>
          </div>

          {/* Status filter */}
          <div>
            <Select defaultValue="all">
              <SelectTrigger className="bg-surface-container border-outline-variant font-sans rounded-md">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="checked-in">Checked In</SelectItem>
                <SelectItem value="checked-out">Checked Out</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tent type filter */}
          <div>
            <Select defaultValue="all">
              <SelectTrigger className="bg-surface-container border-outline-variant font-sans rounded-md">
                <SelectValue placeholder="All Accommodations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accommodations</SelectItem>
                <SelectItem value="jungle">Big Jungle Tent</SelectItem>
                <SelectItem value="geodome">Luxury Geodome</SelectItem>
                <SelectItem value="cabin">Riverside Cabin</SelectItem>
                <SelectItem value="suite">Safari Suite</SelectItem>
                <SelectItem value="canopy">Canopy Suite</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-outline-variant">
          <Button variant="outline" size="sm" className="font-display rounded-md">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
          <Button variant="outline" size="sm" className="font-display rounded-md">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" className="text-primary font-display ml-auto">
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Bookings table */}
      <BookingsTable bookings={bookingsData} />

      {/* Pagination */}
      <div className="flex items-center justify-between bg-surface-container-lowest shadow-level-1 border border-outline-variant rounded-lg p-4">
        <p className="text-body-md font-sans text-on-surface-variant">
          Showing <span className="font-semibold text-on-surface">1</span> to{' '}
          <span className="font-semibold text-on-surface">8</span> of{' '}
          <span className="font-semibold text-on-surface">42</span> entries
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="font-display rounded-md">
            Previous
          </Button>
          <Button variant="default" size="sm" className="bg-primary text-on-primary font-display rounded-md">
            1
          </Button>
          <Button variant="outline" size="sm" className="font-display rounded-md">
            2
          </Button>
          <Button variant="outline" size="sm" className="font-display rounded-md">
            3
          </Button>
          <span className="text-on-surface-variant">...</span>
          <Button variant="outline" size="sm" className="font-display rounded-md">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
