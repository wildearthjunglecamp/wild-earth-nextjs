/**
 * Bookings List Page
 * Real booking management with filters, search, and pagination.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { createClient } from '@/src/lib/supabase/server';
import { listBookings } from '@/src/services/booking.service';
import { BookingsTable } from '../../../../../src/components/admin/BookingsTable';
import { BookingsFilters } from '@/src/components/admin/BookingsFilters';
import { Button } from '@/src/components/ui/button';

export const metadata: Metadata = {
  title: 'Bookings | Wild Earth Admin',
  description: 'Manage campsite bookings and reservations',
};

const PAGE_SIZE = 10;

// Admin list pages depend on the request (search params, session), so render
// them dynamically.
export const dynamic = 'force-dynamic';

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

interface BookingsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  await requireAdmin();

  const q = firstParam(searchParams.q);
  const status = firstParam(searchParams.status) || 'all';
  const tentType = firstParam(searchParams.tentType) || 'all';
  const page = Math.max(1, parseInt(firstParam(searchParams.page) || '1', 10) || 1);

  const supabase = await createClient();
  const [{ rows, total }, { data: tentTypeRows }] = await Promise.all([
    listBookings({ search: q, status, tentTypeSlug: tentType, page, pageSize: PAGE_SIZE }),
    supabase
      .from('tent_types')
      .select('slug, name')
      .eq('is_active', true)
      .order('capacity', { ascending: true }),
  ]);

  const tentTypes = (tentTypeRows ?? []).filter((t) => t.slug);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  // Build a pagination href that preserves the active filters.
  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status !== 'all') params.set('status', status);
    if (tentType !== 'all') params.set('tentType', tentType);
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return qs ? `/admin/bookings?${qs}` : '/admin/bookings';
  };

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
      <BookingsFilters
        tentTypes={tentTypes}
        current={{ q, status, tentType }}
      />

      {/* Bookings table */}
      {rows.length > 0 ? (
        <BookingsTable bookings={rows} />
      ) : (
        <div className="bg-surface-container-lowest shadow-level-1 border border-outline-variant rounded-lg p-12 text-center">
          <p className="text-body-md font-sans text-on-surface-variant">
            No bookings match your filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between bg-surface-container-lowest shadow-level-1 border border-outline-variant rounded-lg p-4">
        <p className="text-body-md font-sans text-on-surface-variant">
          Showing <span className="font-semibold text-on-surface">{from}</span> to{' '}
          <span className="font-semibold text-on-surface">{to}</span> of{' '}
          <span className="font-semibold text-on-surface">{total}</span> entries
        </p>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link href={pageHref(page - 1)}>
              <Button variant="outline" size="sm" className="font-display rounded-md">
                Previous
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="font-display rounded-md">
              Previous
            </Button>
          )}

          <span className="text-body-md font-sans text-on-surface px-2">
            Page {page} of {totalPages}
          </span>

          {page < totalPages ? (
            <Link href={pageHref(page + 1)}>
              <Button variant="outline" size="sm" className="font-display rounded-md">
                Next
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled className="font-display rounded-md">
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
