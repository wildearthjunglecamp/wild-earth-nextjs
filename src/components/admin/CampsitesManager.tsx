'use client';

/**
 * Campsites Manager
 * Edit tent types and manage individual tents (CRUD with guarded delete).
 * Receives server-fetched data; mutations call /api/admin/* then refresh.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreVertical, Edit2, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Checkbox } from '@/src/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { useToast } from '@/src/hooks/use-toast';
import { TENT_STATUSES } from '@/src/validations/campsite.schema';
import type { TentTypeRow, TentRow } from '@/src/services/campsite.service';

interface CampsitesManagerProps {
  tentTypes: TentTypeRow[];
  tents: TentRow[];
}

const STATUS_LABEL: Record<string, string> = {
  available: 'Available',
  occupied: 'Occupied',
  maintenance: 'Maintenance',
  out_of_service: 'Out of Service',
};
const STATUS_BADGE: Record<string, string> = {
  available: 'bg-emerald-100 text-emerald-800',
  occupied: 'bg-amber-100 text-amber-800',
  maintenance: 'bg-red-100 text-red-800',
  out_of_service: 'bg-gray-200 text-gray-700',
};

export function CampsitesManager({ tentTypes, tents }: CampsitesManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Tent-type edit dialog
  const [editingType, setEditingType] = useState<TentTypeRow | null>(null);
  const [typeForm, setTypeForm] = useState({ name: '', basePrice: '', description: '', isActive: true });
  const [savingType, setSavingType] = useState(false);

  // Tent add/edit dialog
  const [tentDialogOpen, setTentDialogOpen] = useState(false);
  const [editingTent, setEditingTent] = useState<TentRow | null>(null);
  const [tentForm, setTentForm] = useState({ tentNumber: '', tentTypeId: '', status: 'available' });
  const [savingTent, setSavingTent] = useState(false);

  const openEditType = (t: TentTypeRow) => {
    setEditingType(t);
    setTypeForm({
      name: t.name,
      basePrice: String(t.basePrice),
      description: t.description ?? '',
      isActive: t.isActive,
    });
  };

  const saveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;
    setSavingType(true);
    try {
      const res = await fetch(`/api/admin/tent-types/${editingType.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: typeForm.name.trim(),
          basePrice: Number(typeForm.basePrice) || 0,
          description: typeForm.description.trim(),
          isActive: typeForm.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save');
      toast({ title: 'Tent type updated' });
      setEditingType(null);
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSavingType(false);
    }
  };

  const openAddTent = () => {
    setEditingTent(null);
    setTentForm({ tentNumber: '', tentTypeId: tentTypes[0]?.id ?? '', status: 'available' });
    setTentDialogOpen(true);
  };
  const openEditTent = (t: TentRow) => {
    setEditingTent(t);
    setTentForm({
      tentNumber: t.tentNumber,
      tentTypeId: t.tentTypeId,
      // 'occupied' is derived; default the editable status to available.
      status: TENT_STATUSES.includes(t.status as any) ? t.status : 'available',
    });
    setTentDialogOpen(true);
  };

  const saveTent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tentForm.tentNumber.trim() || !tentForm.tentTypeId) {
      toast({ title: 'Tent number and type are required', variant: 'destructive' });
      return;
    }
    setSavingTent(true);
    try {
      const res = await fetch(
        editingTent ? `/api/admin/tents/${editingTent.id}` : '/api/admin/tents',
        {
          method: editingTent ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tentNumber: tentForm.tentNumber.trim(),
            tentTypeId: tentForm.tentTypeId,
            status: tentForm.status,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save tent');
      toast({ title: editingTent ? 'Tent updated' : 'Tent added' });
      setTentDialogOpen(false);
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Save failed', description: err?.message, variant: 'destructive' });
    } finally {
      setSavingTent(false);
    }
  };

  const deleteTent = async (id: string) => {
    if (!window.confirm('Delete this tent?')) return;
    try {
      const res = await fetch(`/api/admin/tents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete');
      toast({ title: 'Tent deleted' });
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Delete failed', description: err?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-md font-display text-on-surface">Campsites</h1>
        <p className="text-body-md font-sans text-on-surface-variant mt-1">
          Manage tent types and individual tents
        </p>
      </div>

      <Tabs defaultValue="types" className="space-y-4">
        <TabsList>
          <TabsTrigger value="types">Tent Types</TabsTrigger>
          <TabsTrigger value="tents">Tents</TabsTrigger>
        </TabsList>

        {/* Tent types */}
        <TabsContent value="types">
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader>
              <CardTitle className="text-headline-sm font-display text-on-surface">Tent Types</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Base Price</TableHead>
                    <TableHead>Tents</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tentTypes.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-on-surface font-medium">{t.name}</TableCell>
                      <TableCell className="text-on-surface-variant">{t.capacity}</TableCell>
                      <TableCell className="text-on-surface">₹{t.basePrice.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-on-surface-variant">{t.tentCount}</TableCell>
                      <TableCell>
                        <Badge className={t.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}>
                          {t.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => openEditType(t)}>
                          <Edit2 className="h-4 w-4 mr-1" /> Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tents */}
        <TabsContent value="tents">
          <Card className="bg-surface-container-lowest shadow-level-1 border-outline-variant rounded-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-headline-sm font-display text-on-surface">Tents</CardTitle>
              <Button onClick={openAddTent} className="bg-primary text-on-primary font-display rounded-md">
                <Plus className="h-4 w-4 mr-2" /> Add Tent
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tent #</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tents.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="text-on-surface font-medium">#{t.tentNumber}</TableCell>
                      <TableCell className="text-on-surface-variant">{t.typeName}</TableCell>
                      <TableCell>
                        <Badge className={STATUS_BADGE[t.status] ?? 'bg-gray-200 text-gray-700'}>
                          {STATUS_LABEL[t.status] ?? t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => openEditTent(t)}>
                              <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteTent(t.id)} className="text-error focus:text-error">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tent type edit dialog */}
      <Dialog open={editingType !== null} onOpenChange={(o) => !o && setEditingType(null)}>
        <DialogContent className="sm:max-w-[480px] bg-surface-container-lowest">
          <DialogHeader>
            <DialogTitle className="text-headline-sm font-display text-on-surface">
              Edit Tent Type
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveType} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="tt-name">Name</Label>
              <Input id="tt-name" value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tt-price">Base Price (₹/night)</Label>
              <Input id="tt-price" type="number" min={0} value={typeForm.basePrice} onChange={(e) => setTypeForm({ ...typeForm, basePrice: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tt-desc">Description</Label>
              <Textarea id="tt-desc" value={typeForm.description} onChange={(e) => setTypeForm({ ...typeForm, description: e.target.value })} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="tt-active"
                checked={typeForm.isActive}
                onCheckedChange={(c) => setTypeForm({ ...typeForm, isActive: c === true })}
              />
              <Label htmlFor="tt-active" className="cursor-pointer">Active (bookable)</Label>
            </div>
            <p className="text-xs text-on-surface-variant">
              Capacity and slug are fixed (tied to booking rules) and can't be edited here.
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingType(null)} className="font-display rounded-md">Cancel</Button>
              <Button type="submit" disabled={savingType} className="bg-primary text-on-primary font-display rounded-md">
                {savingType && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Tent add/edit dialog */}
      <Dialog open={tentDialogOpen} onOpenChange={setTentDialogOpen}>
        <DialogContent className="sm:max-w-[480px] bg-surface-container-lowest">
          <DialogHeader>
            <DialogTitle className="text-headline-sm font-display text-on-surface">
              {editingTent ? 'Edit Tent' : 'Add Tent'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={saveTent} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="t-number">Tent Number</Label>
              <Input id="t-number" value={tentForm.tentNumber} onChange={(e) => setTentForm({ ...tentForm, tentNumber: e.target.value })} required />
            </div>
            <div className="space-y-1">
              <Label>Tent Type</Label>
              <Select value={tentForm.tentTypeId} onValueChange={(v) => setTentForm({ ...tentForm, tentTypeId: v })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {tentTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <Select value={tentForm.status} onValueChange={(v) => setTentForm({ ...tentForm, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTentDialogOpen(false)} className="font-display rounded-md">Cancel</Button>
              <Button type="submit" disabled={savingTent} className="bg-primary text-on-primary font-display rounded-md">
                {savingTent && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingTent ? 'Save Changes' : 'Add Tent'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Made with Bob
