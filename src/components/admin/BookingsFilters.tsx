'use client';

/**
 * Bookings Filters
 * Client controls (search + status + tent-type) that drive the bookings list
 * by pushing query params. The server page reads those params and refetches.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Search } from 'lucide-react';

interface TentTypeOption {
  slug: string;
  name: string;
}

interface BookingsFiltersProps {
  tentTypes: TentTypeOption[];
  current: { q: string; status: string; tentType: string };
}

export function BookingsFilters({ tentTypes, current }: BookingsFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(current.q);
  const [status, setStatus] = useState(current.status || 'all');
  const [tentType, setTentType] = useState(current.tentType || 'all');

  // Build the next URL from the given values and navigate. Resets to page 1
  // whenever a filter changes.
  const apply = (next: { q?: string; status?: string; tentType?: string }) => {
    const params = new URLSearchParams();
    const q = next.q ?? search;
    const s = next.status ?? status;
    const t = next.tentType ?? tentType;

    if (q.trim()) params.set('q', q.trim());
    if (s && s !== 'all') params.set('status', s);
    if (t && t !== 'all') params.set('tentType', t);

    const qs = params.toString();
    router.push(qs ? `/admin/bookings?${qs}` : '/admin/bookings');
  };

  const clear = () => {
    setSearch('');
    setStatus('all');
    setTentType('all');
    router.push('/admin/bookings');
  };

  return (
    <div className="bg-surface-container-lowest shadow-level-1 border border-outline-variant rounded-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              apply({});
            }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, email, phone, or booking #..."
                className="pl-9 bg-surface-container border-outline-variant focus:border-primary rounded-md font-sans"
              />
            </div>
          </form>
        </div>
              <Button
          variant="outline"
          size="sm"
          className="font-display rounded-md"
          onClick={() => apply({})}
        >
          Search
        </Button>

        {/* Status filter */}
        <div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v);
              apply({ status: v });
            }}
          >
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
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tent type filter */}
        <div>
          <Select
            value={tentType}
            onValueChange={(v) => {
              setTentType(v);
              apply({ tentType: v });
            }}
          >
            <SelectTrigger className="bg-surface-container border-outline-variant font-sans rounded-md">
              <SelectValue placeholder="All Accommodations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accommodations</SelectItem>
              {tentTypes.map((t) => (
                <SelectItem key={t.slug} value={t.slug}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-outline-variant">
        
        <Button
          variant="ghost"
          size="sm"
          className="text-primary font-display ml-auto"
          onClick={clear}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

// Made with Bob
