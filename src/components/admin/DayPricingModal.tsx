'use client';

/**
 * Day Pricing Modal
 * Opened from a calendar day. Shows each tent type's price for that date and
 * lets the admin set a date-specific override (or revert to base).
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';
import { useToast } from '@/src/hooks/use-toast';

interface DayPricingModalProps {
  date: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Row {
  tentTypeId: string;
  name: string;
  basePrice: number;
  customPrice: number | null;
  value: string; // edited effective price
  initial: number; // effective price as loaded
}

function formatLong(date: string) {
  const d = new Date(date);
  return isNaN(d.getTime())
    ? date
    : d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function DayPricingModal({ date, open, onOpenChange }: DayPricingModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !date) return;
    setLoading(true);
    fetch(`/api/admin/pricing/day?date=${date}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setRows(
            data.items.map((i: any) => ({
              tentTypeId: i.tentTypeId,
              name: i.name,
              basePrice: i.basePrice,
              customPrice: i.customPrice,
              value: String(i.effectivePrice),
              initial: i.effectivePrice,
            }))
          );
        }
      })
      .catch(() => toast({ title: 'Failed to load pricing', variant: 'destructive' }))
      .finally(() => setLoading(false));
  }, [open, date, toast]);

  const setValue = (id: string, v: string) =>
    setRows((rs) => rs.map((r) => (r.tentTypeId === id ? { ...r, value: v } : r)));

  const reset = (id: string) =>
    setRows((rs) =>
      rs.map((r) => (r.tentTypeId === id ? { ...r, value: String(r.basePrice) } : r))
    );

  const save = async () => {
    if (!date) return;

    // Only send rows that changed.
    const items: { tentTypeId: string; price: number | null }[] = [];
    for (const r of rows) {
      const num = Number(r.value);
      const revertingToBase = num === r.basePrice;
      if (revertingToBase && r.customPrice !== null) {
        items.push({ tentTypeId: r.tentTypeId, price: null }); // delete override
      } else if (!revertingToBase && num !== r.initial) {
        if (Number.isNaN(num) || num < 0) {
          toast({ title: `Invalid price for ${r.name}`, variant: 'destructive' });
          return;
        }
        items.push({ tentTypeId: r.tentTypeId, price: num });
      }
    }

    if (items.length === 0) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/pricing/day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, items }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save pricing');
      toast({ title: 'Pricing updated' });
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-surface-container-lowest">
        <DialogHeader>
          <DialogTitle className="text-headline-sm font-display text-on-surface">
            Pricing
          </DialogTitle>
          <DialogDescription className="text-body-md font-sans text-on-surface-variant">
            {date ? formatLong(date) : ''} — set a date-specific price per tent type
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {rows.map((r) => (
              <div key={r.tentTypeId} className="flex items-end gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`p-${r.tentTypeId}`} className="text-label-md text-on-surface">
                      {r.name}
                    </Label>
                    {r.customPrice !== null && (
                      <Badge className="bg-tertiary-container text-on-tertiary-container text-label-sm">
                        Custom
                      </Badge>
                    )}
                  </div>
                  <p className="text-label-sm text-on-surface-variant">
                    Base ₹{r.basePrice.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="w-32">
                  <Input
                    id={`p-${r.tentTypeId}`}
                    type="number"
                    min={0}
                    value={r.value}
                    onChange={(e) => setValue(r.tentTypeId, e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0"
                  title="Reset to base price"
                  onClick={() => reset(r.tentTypeId)}
                >
                  <RotateCcw className="h-4 w-4 text-on-surface-variant" />
                </Button>
              </div>
            ))}
            {rows.length === 0 && (
              <p className="text-body-md font-sans text-on-surface-variant text-center py-6">
                No active tent types.
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-display rounded-md">
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || loading} className="bg-primary text-on-primary font-display rounded-md">
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Pricing
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Made with Bob
