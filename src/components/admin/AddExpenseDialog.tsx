/**
 * Add Expense Dialog Component
 * Modal form for adding new expenses
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';

interface AddExpenseDialogProps {
  children: React.ReactNode;
}

const categories = [
  'Food & Beverage',
  'Maintenance',
  'Salary',
  'Fuel',
  'Equipment',
  'Marketing',
  'Laundry',
  'Other',
];

export function AddExpenseDialog({ children }: AddExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Add expense:', formData);
    // TODO: Submit to API
    setOpen(false);
    // Reset form
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: '',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-surface-container-lowest">
        <DialogHeader>
          <DialogTitle className="text-headline-sm font-display text-on-surface">
            Add New Expense
          </DialogTitle>
          <DialogDescription className="text-body-md font-sans text-on-surface-variant">
            Record a new expense transaction for the campsite
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-label-md font-display text-on-surface">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-surface-container border-outline-variant font-sans rounded-md"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category" className="text-label-md font-display text-on-surface">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                required
              >
                <SelectTrigger className="bg-surface-container border-outline-variant font-sans rounded-md">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category} className="font-sans">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-label-md font-display text-on-surface">
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-surface-container border-outline-variant font-sans rounded-md"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-label-md font-display text-on-surface">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add details about this expense..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-surface-container border-outline-variant font-sans rounded-md min-h-[100px]"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="font-display rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-on-primary hover:bg-primary-container font-display rounded-md"
            >
              Add Expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Made with Bob