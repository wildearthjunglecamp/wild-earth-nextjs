/**
 * Expenses Management Page
 * Track and manage operational expenses for the campsite
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { ExpensesTable } from '@/src/components/admin/ExpensesTable';
import { AddExpenseDialog } from '@/src/components/admin/AddExpenseDialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { 
  Search,
  Download,
  Plus,
  Receipt,
  TrendingDown,
  Wrench,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Expenses | Wild Earth Admin',
  description: 'Track and manage operational expenses',
};

/**
 * Sample expenses data
 */
const expensesData = {
  thisMonth: {
    total: 120000,
    change: 14.2,
    trend: 'up',
  },
  lastMonth: {
    total: 105000,
  },
  topCategory: {
    name: 'Maintenance',
    percentage: 42,
  },
  
  // Category breakdown
  byCategory: [
    { category: 'Maintenance', amount: 50400, percentage: 42 },
    { category: 'Salary', amount: 36000, percentage: 30 },
    { category: 'Food & Beverage', amount: 18000, percentage: 15 },
    { category: 'Fuel', amount: 9600, percentage: 8 },
    { category: 'Marketing', amount: 3600, percentage: 3 },
    { category: 'Equipment', amount: 2400, percentage: 2 },
  ],
  
  // Recent transactions
  transactions: [
    {
      id: 'EXP-001',
      date: '2023-10-24',
      category: 'Maintenance',
      amount: 18500,
      notes: 'Plumbing repair in Cabin 4',
    },
    {
      id: 'EXP-002',
      date: '2023-10-22',
      category: 'Food & Beverage',
      amount: 42000,
      notes: 'Monthly dry goods restock from vendor',
    },
    {
      id: 'EXP-003',
      date: '2023-10-18',
      category: 'Laundry',
      amount: 8200,
      notes: 'External linen cleaning services',
    },
    {
      id: 'EXP-004',
      date: '2023-10-15',
      category: 'Salary',
      amount: 51300,
      notes: 'Mid-month staff advances',
    },
    {
      id: 'EXP-005',
      date: '2023-10-12',
      category: 'Fuel',
      amount: 6500,
      notes: 'Generator diesel refill',
    },
    {
      id: 'EXP-006',
      date: '2023-10-10',
      category: 'Equipment',
      amount: 15000,
      notes: 'New camping gear purchase',
    },
    {
      id: 'EXP-007',
      date: '2023-10-08',
      category: 'Marketing',
      amount: 3500,
      notes: 'Social media advertising campaign',
    },
    {
      id: 'EXP-008',
      date: '2023-10-05',
      category: 'Maintenance',
      amount: 12000,
      notes: 'Tent canvas replacement',
    },
  ],
};

export default async function ExpensesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-headline-md font-display text-on-surface">Expenses Overview</h1>
          <p className="text-body-md font-sans text-on-surface-variant mt-1">
            Track and manage operational outgoings for Wild Earth Resort
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-display rounded-md">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <AddExpenseDialog>
            <Button className="bg-primary text-on-primary hover:bg-primary-container font-display rounded-md">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </AddExpenseDialog>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* This Month Expenses */}
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
            <div className="text-display-lg-mobile font-display text-on-surface">
              ₹{expensesData.thisMonth.total.toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="px-2 py-1 bg-primary/10 rounded text-label-sm font-sans text-primary">
                ↑ +{expensesData.thisMonth.change}% vs last month
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Last Month Expenses */}
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
            <div className="text-display-lg-mobile font-display text-on-surface">
              ₹{expensesData.lastMonth.total.toLocaleString('en-IN')}
            </div>
            <p className="text-label-sm font-sans text-on-surface-variant mt-2">
              Closed balance
            </p>
          </CardContent>
        </Card>

        {/* Top Category */}
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
            <div className="text-display-lg-mobile font-display text-on-surface">
              {expensesData.topCategory.name}
            </div>
            <p className="text-label-sm font-sans text-on-surface-variant mt-2">
              Accounts for {expensesData.topCategory.percentage}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses by Category Chart */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader>
          <CardTitle className="text-headline-sm font-display text-on-surface">
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expensesData.byCategory.map((item) => (
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
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-label-sm font-sans text-on-surface-variant">
                  {item.percentage}% of total expenses
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-headline-sm font-display text-on-surface">
            Recent Transactions
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                type="search"
                placeholder="Search expenses..."
                className="pl-9 w-64 bg-surface-container border-outline-variant focus:border-primary rounded-md font-sans"
              />
            </div>
            <Button variant="outline" size="sm" className="font-display rounded-md">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ExpensesTable expenses={expensesData.transactions} />
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant">
            <p className="text-body-md font-sans text-on-surface-variant">
              Showing 1 to 4 of 24 entries
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="font-display rounded-md">
                Previous
              </Button>
              <Button variant="outline" size="sm" className="font-display rounded-md">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Made with Bob
