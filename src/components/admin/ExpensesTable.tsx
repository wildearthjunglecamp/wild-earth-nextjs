/**
 * Expenses Table Component
 * Displays expenses in a clean table with edit/delete actions
 */

'use client';

import { useState } from 'react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Edit, Trash2, MoreVertical } from 'lucide-react';

interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  notes: string;
}

interface ExpensesTableProps {
  expenses: Expense[];
}

/**
 * Get category badge color
 */
function getCategoryBadge(category: string) {
  const colors: Record<string, string> = {
    'Maintenance': 'bg-primary/10 text-primary border-primary/20',
    'Food & Beverage': 'bg-tertiary/10 text-tertiary border-tertiary/20',
    'Salary': 'bg-secondary/10 text-secondary border-secondary/20',
    'Fuel': 'bg-error/10 text-error border-error/20',
    'Equipment': 'bg-primary-fixed/20 text-on-primary-fixed border-primary-fixed/30',
    'Marketing': 'bg-tertiary-container/30 text-on-tertiary-container border-tertiary-container',
    'Laundry': 'bg-surface-container-high text-on-surface border-outline-variant',
  };

  return colors[category] || 'bg-surface-container text-on-surface border-outline-variant';
}

/**
 * Get category icon
 */
function getCategoryIcon(category: string) {
  const icons: Record<string, string> = {
    'Maintenance': '🔧',
    'Food & Beverage': '🍽️',
    'Salary': '💰',
    'Fuel': '⛽',
    'Equipment': '🎒',
    'Marketing': '📢',
    'Laundry': '🧺',
  };

  return icons[category] || '📝';
}

/**
 * Format date
 */
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function ExpensesTable({ expenses }: ExpensesTableProps) {
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);

  const handleEdit = (expenseId: string) => {
    console.log('Edit expense:', expenseId);
    // TODO: Open edit dialog
  };

  const handleDelete = (expenseId: string) => {
    console.log('Delete expense:', expenseId);
    // TODO: Show confirmation dialog
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b border-outline-variant">
          <tr>
            <th className="px-4 py-3 text-left text-label-md font-display text-on-surface-variant uppercase">
              Date
            </th>
            <th className="px-4 py-3 text-left text-label-md font-display text-on-surface-variant uppercase">
              Category
            </th>
            <th className="px-4 py-3 text-left text-label-md font-display text-on-surface-variant uppercase">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-label-md font-display text-on-surface-variant uppercase">
              Notes
            </th>
            <th className="px-4 py-3 text-right text-label-md font-display text-on-surface-variant uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/50">
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="hover:bg-surface-container transition-colors"
            >
              {/* Date */}
              <td className="px-4 py-4">
                <span className="text-body-md font-sans text-on-surface">
                  {formatDate(expense.date)}
                </span>
              </td>

              {/* Category */}
              <td className="px-4 py-4">
                <Badge 
                  variant="outline" 
                  className={`text-label-sm font-sans border ${getCategoryBadge(expense.category)}`}
                >
                  <span className="mr-1">{getCategoryIcon(expense.category)}</span>
                  {expense.category}
                </Badge>
              </td>

              {/* Amount */}
              <td className="px-4 py-4">
                <span className="text-body-md font-sans font-semibold text-on-surface">
                  ₹{expense.amount.toLocaleString('en-IN')}
                </span>
              </td>

              {/* Notes */}
              <td className="px-4 py-4">
                <span className="text-body-md font-sans text-on-surface-variant line-clamp-1">
                  {expense.notes}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => handleEdit(expense.id)}
                      className="cursor-pointer font-sans"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(expense.id)}
                      className="cursor-pointer text-error focus:text-error font-sans"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Made with Bob