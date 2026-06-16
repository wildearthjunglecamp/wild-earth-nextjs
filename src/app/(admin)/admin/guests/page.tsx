/**
 * Guests Management Page
 * Unique customers aggregated from bookings, with search + booking history.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { listGuests } from '@/src/services/guest.service';
import { GuestsTable } from '@/src/components/admin/GuestsTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';

export const metadata: Metadata = {
  title: 'Guests | Wild Earth Admin',
  description: 'Manage guest information and booking history',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 12;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

interface GuestsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function GuestsPage({ searchParams }: GuestsPageProps) {
  await requireAdmin();

  const q = firstParam(searchParams.q);
  const page = Math.max(1, parseInt(firstParam(searchParams.page) || '1', 10) || 1);

  const { rows, total } = await listGuests({ search: q, page, pageSize: PAGE_SIZE });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (target > 1) params.set('page', String(target));
    const qs = params.toString();
    return qs ? `/admin/guests?${qs}` : '/admin/guests';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md font-display text-on-surface">Guests</h1>
        <p className="text-body-md font-sans text-on-surface-variant mt-1">
          {total} guest{total === 1 ? '' : 's'} from booking history
        </p>
      </div>

      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-headline-sm font-display text-on-surface">All Guests</CardTitle>
          <form action="/admin/guests" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search name, email, phone..."
              className="pl-9 w-64 bg-surface-container border-outline-variant focus:border-primary rounded-md font-sans"
            />
          </form>
        </CardHeader>
        <CardContent>
          {rows.length > 0 ? (
            <GuestsTable guests={rows} />
          ) : (
            <p className="text-body-md font-sans text-on-surface-variant py-8 text-center">
              No guests found.
            </p>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant">
            <p className="text-body-md font-sans text-on-surface-variant">
              Showing {from} to {to} of {total} guests
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link href={pageHref(page - 1)}>
                  <Button variant="outline" size="sm" className="font-display rounded-md">Previous</Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="font-display rounded-md">Previous</Button>
              )}
              <span className="text-body-md font-sans text-on-surface px-2">Page {page} of {totalPages}</span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)}>
                  <Button variant="outline" size="sm" className="font-display rounded-md">Next</Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="font-display rounded-md">Next</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Made with Bob
