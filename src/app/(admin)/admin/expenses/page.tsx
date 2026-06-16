/**
 * Expenses Management Page
 * Real expense tracking: stats, category breakdown, searchable paginated list.
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Search, Plus, Receipt, TrendingDown, Wrench } from 'lucide-react';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { listExpenses, getExpenseStats } from '@/src/services/expense.service';
import { ExpensesTable } from '../../../../../src/components/admin/ExpensesTable';
import { AddExpenseDialog } from '../../../../../src/components/admin/AddExpenseDialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';

export const metadata: Metadata = {
  title: 'Expenses | Wild Earth Admin',
  description: 'Track and manage operational expenses',
};

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 10;

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

interface ExpensesPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  await requireAdmin();

  const q = firstParam(searchParams.q);
  const page = Math.max(1, parseInt(firstParam(searchParams.page) || '1', 10) || 1);

  const [stats, { rows, total }] = await Promise.all([
    getExpenseStats(),
    listExpenses({ search: q, page, pageSize: PAGE_SIZE }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const pageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (targetPage > 1) params.set('page', String(targetPage));
    const qs = params.toString();
    return qs ? `/admin/expenses?${qs}` : '/admin/expenses';
  };

  const maxCategory = Math.max(1, ...stats.byCategory.map((c) => c.amount));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-display text-on-surface">Expenses Overview</h1>
          <p className="text-body-md font-sans text-on-surface-variant mt-1">
            Track and manage operational outgoings for Wild Earth
          </p>
        </div>
        <AddExpenseDialog>
          <Button className="bg-primary text-on-primary hover:bg-primary-container font-display rounded-md">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </AddExpenseDialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              This Month Expenses
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md font-display text-on-surface">
              ₹{stats.thisMonthTotal.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="px-2 py-1 bg-surface-container rounded text-label-sm font-sans text-on-surface-variant">
                {stats.trend === 'up' ? '↑' : stats.trend === 'down' ? '↓' : '→'}{' '}
                {stats.changePct > 0 ? '+' : ''}
                {stats.changePct}% vs last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Last Month Expenses
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-secondary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md font-display text-on-surface">
              ₹{stats.lastMonthTotal.toLocaleString('en-IN')}
            </div>
            <p className="text-label-sm font-sans text-on-surface-variant mt-2">Closed balance</p>
          </CardContent>
        </Card>

        <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-label-md font-display text-on-surface-variant uppercase">
              Top Category
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-tertiary/10 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-tertiary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-headline-md font-display text-on-surface">
              {stats.topCategory?.name ?? '—'}
            </div>
            <p className="text-label-sm font-sans text-on-surface-variant mt-2">
              {stats.topCategory
                ? `Accounts for ${stats.topCategory.percentage}% of this month`
                : 'No expenses this month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses by category (this month) */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-surface">
            Expenses by Category (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.byCategory.length === 0 ? (
            <p className="text-body-md font-sans text-on-surface-variant">
              No expenses recorded this month.
            </p>
          ) : (
            <div className="space-y-4">
              {stats.byCategory.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-body-md font-sans text-on-surface font-medium">
                      {item.category}
                    </span>
                    <span className="text-body-md font-sans text-on-surface font-semibold">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="relative w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-primary rounded-full"
                      style={{ width: `${Math.round((item.amount / maxCategory) * 100)}%` }}
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

      {/* Transactions */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-headline-sm font-display text-on-surface">
            Transactions
          </CardTitle>
          {/* Plain GET form — no client JS needed for search */}
          <form action="/admin/expenses" className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search expenses..."
              className="pl-9 w-64 bg-surface-container border-outline-variant focus:border-primary rounded-md font-sans"
            />
          </form>
        </CardHeader>
        <CardContent>
          {rows.length > 0 ? (
            <ExpensesTable expenses={rows} />
          ) : (
            <p className="text-body-md font-sans text-on-surface-variant py-8 text-center">
              No expenses found.
            </p>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant">
            <p className="text-body-md font-sans text-on-surface-variant">
              Showing {from} to {to} of {total} entries
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link href={pageHref(page - 1)}>
                  <Button variant="outline" size="sm" className="font-display rounded-md">Previous</Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="font-display rounded-md">Previous</Button>
              )}
              <span className="text-body-md font-sans text-on-surface px-2">
                Page {page} of {totalPages}
              </span>
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
