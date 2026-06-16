'use client';

/**
 * Inventory Manager
 * Tent operational status (+ derived occupancy) and equipment/supply CRUD.
 * Receives server-fetched data; mutations call /api/admin/* then refresh.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home,
  CheckCircle2,
  AlertTriangle,
  Package,
  MoreVertical,
  Edit2,
  Check,
  X,
  Plus,
  Ban,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { useToast } from '@/src/hooks/use-toast';
import { INVENTORY_CONDITIONS } from '@/src/validations/inventory.schema';
import type {
  TentWithStatus,
  InventorySummary,
  InventoryItemRow,
} from '@/src/services/inventory.service';

interface InventoryManagerProps {
  tents: TentWithStatus[];
  items: InventoryItemRow[];
  summary: InventorySummary;
}

const STATUS_BADGE: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  occupied: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  maintenance: 'bg-red-100 text-red-800 hover:bg-red-100',
  out_of_service: 'bg-gray-200 text-gray-700 hover:bg-gray-200',
};
const STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  out_of_service: 'Out of Service',
};

const EMPTY_ITEM = { name: '', category: '', quantity: '0', condition: 'good' };

export function InventoryManager({ tents, items, summary }: InventoryManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [busyTent, setBusyTent] = useState<string | null>(null);
  const [editingQtyId, setEditingQtyId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState(0);

  // Item add/edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItemRow | null>(null);
  const [form, setForm] = useState(EMPTY_ITEM);
  const [savingItem, setSavingItem] = useState(false);

  const cards = [
    { label: 'Total Tents', value: summary.totalTents, icon: Home },
    { label: 'Available', value: summary.available, icon: CheckCircle2 },
    { label: 'Occupied (Today)', value: summary.occupiedToday, icon: Home },
    { label: 'Maintenance', value: summary.maintenance, icon: AlertTriangle },
  ];

  const changeTentStatus = async (id: string, status: string) => {
    setBusyTent(id);
    try {
      const res = await fetch(`/api/admin/tents/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update status');
      toast({ title: 'Tent updated' });
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
    } finally {
      setBusyTent(null);
    }
  };

  const patchItem = async (id: string, body: Record<string, unknown>, successMsg: string) => {
    const res = await fetch(`/api/admin/inventory/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
    toast({ title: successMsg });
    router.refresh();
  };

  const saveQuantity = async (id: string) => {
    try {
      await patchItem(id, { quantity: editQty }, 'Quantity updated');
      setEditingQtyId(null);
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
    }
  };

  const reportDamage = async (id: string) => {
    try {
      await patchItem(id, { condition: 'damaged' }, 'Marked as damaged');
    } catch (err: any) {
      toast({ title: 'Update failed', description: err?.message, variant: 'destructive' });
    }
  };

  const deleteItem = async (id: string) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const res = await fetch(`/api/admin/inventory/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');
      toast({ title: 'Item deleted' });
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err?.message, variant: 'destructive' });
    }
  };

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_ITEM);
    setDialogOpen(true);
  };
  const openEdit = (item: InventoryItemRow) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      condition: item.condition,
    });
    setDialogOpen(true);
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      quantity: parseInt(form.quantity, 10) || 0,
      condition: form.condition,
    };
    if (!payload.name || !payload.category) {
      toast({ title: 'Name and category are required', variant: 'destructive' });
      return;
    }
    setSavingItem(true);
    try {
      const res = await fetch(
        editingItem ? `/api/admin/inventory/${editingItem.id}` : '/api/admin/inventory',
        {
          method: editingItem ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save item');
      toast({ title: editingItem ? 'Item updated' : 'Item added' });
      setDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSavingItem(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md font-display text-on-surface">Inventory Management</h1>
        <p className="text-body-md font-sans text-on-surface-variant mt-1">
          Monitor tent status and manage equipment & supplies
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <Card key={c.label} className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-label-md font-sans text-on-surface-variant">{c.label}</CardTitle>
              <c.icon className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-headline-md font-display text-on-surface">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="tents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tents">Tents</TabsTrigger>
          <TabsTrigger value="inventory">Other Inventory</TabsTrigger>
        </TabsList>

        {/* Tents */}
        <TabsContent value="tents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tents.map((tent) => {
              const isOccupied = tent.status === 'occupied';
              return (
                <Card key={tent.id} className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-headline-sm font-display text-on-surface">
                          Tent - {tent.tentNumber}
                        </CardTitle>
                        <p className="text-body-sm font-sans text-on-surface-variant">{tent.typeName}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={busyTent === tent.id}>
                            {busyTent === tent.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {isOccupied ? (
                            <DropdownMenuItem disabled>In use — cannot change</DropdownMenuItem>
                          ) : (
                            <>
                              {tent.status !== 'available' && (
                                <DropdownMenuItem onClick={() => changeTentStatus(tent.id, 'available')}>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                                  Mark Available
                                </DropdownMenuItem>
                              )}
                              {tent.status !== 'maintenance' && (
                                <DropdownMenuItem onClick={() => changeTentStatus(tent.id, 'maintenance')}>
                                  <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                                  Mark Maintenance
                                </DropdownMenuItem>
                              )}
                              {tent.status !== 'out_of_service' && (
                                <DropdownMenuItem onClick={() => changeTentStatus(tent.id, 'out_of_service')}>
                                  <Ban className="mr-2 h-4 w-4 text-on-surface-variant" />
                                  Out of Service
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge className={STATUS_BADGE[tent.status]}>{STATUS_LABEL[tent.status]}</Badge>
                    {isOccupied && tent.occupant && (
                      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
                        <p className="text-label-sm text-amber-900 font-medium">Current Occupant</p>
                        <p className="text-body-sm text-amber-800">{tent.occupant.guestName}</p>
                        <p className="text-xs text-amber-700">
                          Checkout: {new Date(tent.occupant.checkoutDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Inventory items */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-headline-sm font-display text-on-surface flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Inventory Items ({summary.totalInventory} in stock)
              </CardTitle>
              <Button onClick={openAdd} className="bg-primary text-on-primary font-display rounded-md">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-body-md font-sans text-on-surface-variant py-8 text-center">
                  No inventory items yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-on-surface">{item.name}</TableCell>
                        <TableCell className="text-on-surface-variant">{item.category}</TableCell>
                        <TableCell>
                          {editingQtyId === item.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min={0}
                                value={editQty}
                                onChange={(e) => setEditQty(parseInt(e.target.value) || 0)}
                                className="w-20 h-8"
                                autoFocus
                              />
                              <Button size="sm" variant="ghost" onClick={() => saveQuantity(item.id)} className="h-8 w-8 p-0">
                                <Check className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingQtyId(null)} className="h-8 w-8 p-0">
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-on-surface">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingQtyId(item.id);
                                  setEditQty(item.quantity);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-on-surface-variant" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.condition === 'damaged'
                                ? 'bg-red-100 text-red-800'
                                : item.condition === 'poor'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }
                          >
                            {item.condition}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => openEdit(item)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => reportDamage(item.id)}>
                                <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                                Report Damage
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteItem(item.id)}
                                className="text-error focus:text-error"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add / edit item dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-surface-container-lowest">
          <DialogHeader>
            <DialogTitle className="text-headline-sm font-display text-on-surface">
              {editingItem ? 'Edit Item' : 'Add Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveItem} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="i-name">Name</Label>
              <Input id="i-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="i-cat">Category</Label>
              <Input id="i-cat" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Bedding, Kitchen" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="i-qty">Quantity</Label>
                <Input id="i-qty" type="number" min={0} value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Condition</Label>
                <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INVENTORY_CONDITIONS.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="font-display rounded-md">
                Cancel
              </Button>
              <Button type="submit" disabled={savingItem} className="bg-primary text-on-primary font-display rounded-md">
                {savingItem && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingItem ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Made with Bob
