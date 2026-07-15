'use client';

/**
 * Pricing Management Component
 * Admin interface for managing date-specific pricing
 */

import { useState, useEffect } from 'react';
import { Calendar } from '../../components/ui/calendar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/use-toast';
import { Loader2, Plus, Trash2, Edit, Calendar as CalendarIcon } from 'lucide-react';

interface TentType {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
}

interface DatePricing {
  id: string;
  tentTypeId: string;
  date: string;
  customPrice: number;
  notes?: string;
}

interface PricingOverview {
  tentTypeId: string;
  tentTypeName: string;
  basePrice: number;
  customPriceCount: number;
}

export function PricingManagement() {
  const { toast } = useToast();
  const [tentTypes, setTentTypes] = useState<TentType[]>([]);
  const [selectedTentType, setSelectedTentType] = useState<string>('');
  const [pricingOverview, setPricingOverview] = useState<PricingOverview[]>([]);
  const [datePricing, setDatePricing] = useState<DatePricing[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  // Form state
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [customPrice, setCustomPrice] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Fetch tent types on mount
  useEffect(() => {
    fetchTentTypes();
    fetchPricingOverview();
  }, []);

  // Fetch date-specific pricing when tent type changes
  useEffect(() => {
    if (selectedTentType) {
      fetchDatePricing(selectedTentType);
    }
  }, [selectedTentType]);

  const fetchTentTypes = async () => {
    try {
      const response = await fetch('/api/tent-types');
      const data = await response.json();
      if (data.success) {
        setTentTypes(data.data);
        if (data.data.length > 0) {
          setSelectedTentType(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching tent types:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tent types',
        variant: 'destructive',
      });
    }
  };

  const fetchPricingOverview = async () => {
    try {
      const response = await fetch('/api/pricing/overview');
      const data = await response.json();
      if (data.success) {
        setPricingOverview(data.data);
      }
    } catch (error) {
      console.error('Error fetching pricing overview:', error);
    }
  };

  const fetchDatePricing = async (tentTypeId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pricing?tentTypeId=${tentTypeId}`);
      const data = await response.json();
      if (data.success) {
        setDatePricing(data.data);
      }
    } catch (error) {
      console.error('Error fetching date pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pricing data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePricing = async () => {
    if (!selectedTentType || !customPrice || selectedDates.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const dates = selectedDates.map(date => date.toISOString().split('T')[0]);
      
      const response = await fetch('/api/pricing/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tentTypeId: selectedTentType,
          dates,
          customPrice: parseFloat(customPrice),
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: data.message || 'Pricing created successfully',
        });
        setIsDialogOpen(false);
        resetForm();
        fetchDatePricing(selectedTentType);
        fetchPricingOverview();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create pricing',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating pricing:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePricing = async (id: string) => {
    if (!customPrice) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a price',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/pricing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customPrice: parseFloat(customPrice),
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Pricing updated successfully',
        });
        setIsDialogOpen(false);
        resetForm();
        fetchDatePricing(selectedTentType);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to update pricing',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePricing = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/pricing/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Pricing deleted successfully',
        });
        fetchDatePricing(selectedTentType);
        fetchPricingOverview();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to delete pricing',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting pricing:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    resetForm();
    setIsBulkMode(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (pricing: DatePricing) => {
    setEditingId(pricing.id);
    setCustomPrice(pricing.customPrice.toString());
    setNotes(pricing.notes || '');
    setIsBulkMode(false);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedDates([]);
    setCustomPrice('');
    setNotes('');
    setEditingId(null);
  };

  const selectedTentTypeData = tentTypes.find(tt => tt.id === selectedTentType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pricing Management</h2>
          <p className="text-muted-foreground">
            Manage date-specific pricing for tent types
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Pricing
        </Button>
      </div>

      {/* Pricing Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pricingOverview.map((overview) => (
          <Card key={overview.tentTypeId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {overview.tentTypeName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{overview.basePrice}</div>
              <p className="text-xs text-muted-foreground">
                {overview.customPriceCount} custom price(s)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tent Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Tent Type</CardTitle>
          <CardDescription>
            Choose a tent type to view and manage its date-specific pricing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedTentType} onValueChange={setSelectedTentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select tent type" />
            </SelectTrigger>
            <SelectContent>
              {tentTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name} (Base: ₹{type.basePrice})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Date-Specific Pricing List */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Pricing Dates</CardTitle>
          <CardDescription>
            {selectedTentTypeData
              ? `Showing custom prices for ${selectedTentTypeData.name}`
              : 'Select a tent type to view pricing'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : datePricing.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No custom pricing set for this tent type
            </div>
          ) : (
            <div className="space-y-2">
              {datePricing.map((pricing) => (
                <div
                  key={pricing.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(pricing.date).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary">₹{pricing.customPrice}</Badge>
                    </div>
                    {pricing.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {pricing.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(pricing)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePricing(pricing.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit Custom Pricing' : 'Add Custom Pricing'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Update the custom price for this date'
                : 'Set custom prices for specific dates'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isBulkMode && (
              <div className="space-y-2">
                <Label>Select Dates</Label>
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  className="rounded-md border"
                />
                <p className="text-sm text-muted-foreground">
                  {selectedDates.length} date(s) selected
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="customPrice">Custom Price (₹)</Label>
              <Input
                id="customPrice"
                type="number"
                step="0.01"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="Enter custom price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Holiday pricing, Special event"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                editingId ? handleUpdatePricing(editingId) : handleCreatePricing()
              }
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Made with Bob