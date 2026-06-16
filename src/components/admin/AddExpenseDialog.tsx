/**
 * Expense Dialog
 * Modal form for creating or editing an expense. Used with a trigger (create)
 * or controlled open state (edit, from the table row menu).
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/src/components/ui/alert';
import { useToast } from '@/src/hooks/use-toast';
import { EXPENSE_CATEGORIES } from '@/src/validations/expense.schema';

export interface ExpenseFormValue {
  id: string;
  date: string;
  category: string;
  amount: number;
  notes: string;
}

interface AddExpenseDialogProps {
  children?: React.ReactNode; // trigger (create mode)
  expense?: ExpenseFormValue; // present → edit mode
  open?: boolean; // controlled (edit)
  onOpenChange?: (open: boolean) => void;
}

const todayStr = () => new Date().toISOString().split('T')[0];

export function AddExpenseDialog({
  children,
  expense,
  open: controlledOpen,
  onOpenChange,
}: AddExpenseDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = (v: boolean) => {
    if (onOpenChange) onOpenChange(v);
    if (!isControlled) setInternalOpen(v);
  };

  const isEdit = !!expense;

  const [formData, setFormData] = useState({
    date: todayStr(),
    category: '',
    amount: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Seed the form whenever the dialog opens (with the expense in edit mode).
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (expense) {
      setFormData({
        date: expense.date,
        category: expense.category,
        amount: String(expense.amount),
        notes: expense.notes,
      });
    } else {
      setFormData({ date: todayStr(), category: '', amount: '', notes: '' });
    }
  }, [open, expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = Number(formData.amount);
    if (!formData.category) return setError('Select a category.');
    if (!amountNum || amountNum <= 0) return setError('Enter an amount greater than 0.');
    if (!formData.notes.trim()) return setError('Notes are required.');

    setSubmitting(true);
    const payload = {
      date: formData.date,
      category: formData.category,
      amount: amountNum,
      notes: formData.notes.trim(),
    };

    try {
      const res = await fetch(
        isEdit ? `/api/admin/expenses/${expense!.id}` : '/api/admin/expenses',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        const detail =
          typeof data.details === 'string' ? data.details : data.error || 'Failed to save expense';
        throw new Error(detail);
      }
      toast({ title: isEdit ? 'Expense updated' : 'Expense added' });
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px] bg-surface-container-lowest">
        <DialogHeader>
          <DialogTitle className="text-headline-sm font-display text-on-surface">
            {isEdit ? 'Edit Expense' : 'Add New Expense'}
          </DialogTitle>
          <DialogDescription className="text-body-md font-sans text-on-surface-variant">
            {isEdit ? 'Update this expense transaction' : 'Record a new expense transaction for the campsite'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="date" className="text-label-md font-display text-on-surface">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-surface-container border-outline-variant font-sans rounded-md"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-label-md font-display text-on-surface">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="bg-surface-container border-outline-variant font-sans rounded-md">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category} className="font-sans">
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-label-md font-display text-on-surface">Amount (₹)</Label>
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

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-label-md font-display text-on-surface">Notes</Label>
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="font-display rounded-md">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary text-on-primary hover:bg-primary-container font-display rounded-md"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Made with Bob
