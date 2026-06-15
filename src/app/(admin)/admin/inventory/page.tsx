'use client';

import { useState } from 'react';
import { Metadata } from 'next';
import { 
  Home, 
  CheckCircle2, 
  AlertTriangle, 
  Package,
  MoreVertical,
  Edit2,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/src/components/ui/tabs';

// Types
type TentStatus = 'available' | 'booked' | 'damaged';
type InventoryStatus = 'available' | 'damaged';

interface Tent {
  id: string;
  name: string;
  type: string;
  status: TentStatus;
  currentBooking?: {
    guestName: string;
    checkoutDate: string;
  };
  damageNote?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  status: InventoryStatus;
  damagedCount?: number;
}

// Mock data - Replace with actual API calls
const mockTents: Tent[] = [
  {
    id: '1',
    name: 'Twin Tent #1',
    type: 'Standard Canvas',
    status: 'available',
  },
  {
    id: '2',
    name: 'Safari Suite #A',
    type: 'Premium Suite',
    status: 'booked',
    currentBooking: {
      guestName: 'Sarah Jenkins',
      checkoutDate: '2026-06-15',
    },
  },
  {
    id: '3',
    name: 'Twin Tent #4',
    type: 'Standard Canvas',
    status: 'damaged',
    damageNote: 'Torn canvas near entrance zipper',
  },
  {
    id: '4',
    name: 'Family Dome #1',
    type: 'Geodesic Dome',
    status: 'booked',
    currentBooking: {
      guestName: 'The Miller Family',
      checkoutDate: '2026-06-12',
    },
  },
  {
    id: '5',
    name: 'Luxury Geodome #1',
    type: 'Premium Geodome',
    status: 'available',
  },
  {
    id: '6',
    name: 'Twin Tent #2',
    type: 'Standard Canvas',
    status: 'available',
  },
  {
    id: '7',
    name: 'Twin Tent #3',
    type: 'Standard Canvas',
    status: 'available',
  },
  {
    id: '8',
    name: 'Riverside Cabin #1',
    type: 'Wooden Cabin',
    status: 'available',
  },
];

const mockInventory: InventoryItem[] = [
  { id: '1', name: 'Queen Mattress', category: 'Mattresses', quantity: 20, status: 'available' },
  { id: '2', name: 'Single Mattress', category: 'Mattresses', quantity: 15, status: 'available' },
  { id: '3', name: 'Winter Sleeping Bag', category: 'Sleeping Bags', quantity: 25, status: 'available', damagedCount: 2 },
  { id: '4', name: 'Summer Sleeping Bag', category: 'Sleeping Bags', quantity: 30, status: 'available' },
  { id: '5', name: 'Folding Chair', category: 'Chairs', quantity: 40, status: 'available', damagedCount: 3 },
  { id: '6', name: 'Camping Table', category: 'Tables', quantity: 18, status: 'available', damagedCount: 1 },
  { id: '7', name: 'Cooking Pot Set', category: 'Kitchen Items', quantity: 12, status: 'available' },
  { id: '8', name: 'Cutlery Set', category: 'Kitchen Items', quantity: 50, status: 'available' },
  { id: '9', name: 'Coffee Beans (kg)', category: 'Food Stock', quantity: 15, status: 'available' },
  { id: '10', name: 'Tea Bags (boxes)', category: 'Food Stock', quantity: 8, status: 'available' },
];

export default function InventoryPage() {
  const [tents, setTents] = useState<Tent[]>(mockTents);
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState<number>(0);

  // Calculate summary stats
  const totalTents = tents.length;
  const availableTents = tents.filter(t => t.status === 'available').length;
  const damagedTents = tents.filter(t => t.status === 'damaged').length;
  const totalInventoryItems = inventory.reduce((sum, item) => sum + item.quantity, 0);

  // Handle tent status change
  const handleTentStatusChange = (tentId: string, newStatus: TentStatus) => {
    setTents(tents.map(tent => 
      tent.id === tentId ? { ...tent, status: newStatus } : tent
    ));
  };

  // Handle inventory quantity edit
  const startEditingQuantity = (itemId: string, currentQuantity: number) => {
    setEditingItem(itemId);
    setEditQuantity(currentQuantity);
  };

  const saveQuantity = (itemId: string) => {
    setInventory(inventory.map(item =>
      item.id === itemId ? { ...item, quantity: editQuantity } : item
    ));
    setEditingItem(null);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditQuantity(0);
  };

  // Get status badge styling
  const getTentStatusBadge = (status: TentStatus) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Available</Badge>;
      case 'booked':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Booked</Badge>;
      case 'damaged':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Damaged</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-display-lg text-primary-900 mb-2">
          Inventory Management
        </h1>
        <p className="font-body text-body-md text-secondary-600">
          Monitor and manage physical resort units and inventory
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
        <Card className="border-surface-200 shadow-level-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-body text-label-sm text-secondary-600 font-medium">
              Total Tents
            </CardTitle>
            <Home className="h-4 w-4 text-secondary-400" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-headline-md text-primary-900">
              {totalTents}
            </div>
            <p className="font-body text-body-sm text-secondary-500 mt-1">
              All accommodation units
            </p>
          </CardContent>
        </Card>

        <Card className="border-surface-200 shadow-level-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-body text-label-sm text-secondary-600 font-medium">
              Available Tents
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-headline-md text-primary-900">
              {availableTents}
            </div>
            <p className="font-body text-body-sm text-secondary-500 mt-1">
              Ready for booking
            </p>
          </CardContent>
        </Card>

        <Card className="border-surface-200 shadow-level-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-body text-label-sm text-secondary-600 font-medium">
              Damaged Tents
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-headline-md text-primary-900">
              {damagedTents}
            </div>
            <p className="font-body text-body-sm text-secondary-500 mt-1">
              Needs maintenance
            </p>
          </CardContent>
        </Card>

        <Card className="border-surface-200 shadow-level-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-body text-label-sm text-secondary-600 font-medium">
              Total Inventory
            </CardTitle>
            <Package className="h-4 w-4 text-secondary-400" />
          </CardHeader>
          <CardContent>
            <div className="font-display text-headline-md text-primary-900">
              {totalInventoryItems}
            </div>
            <p className="font-body text-body-sm text-secondary-500 mt-1">
              Items in stock
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tents" className="space-y-4">
        <TabsList className="bg-surface-100">
          <TabsTrigger value="tents" className="font-body text-body-md">
            Tents
          </TabsTrigger>
          <TabsTrigger value="inventory" className="font-body text-body-md">
            Other Inventory
          </TabsTrigger>
        </TabsList>

        {/* Tents Tab */}
        <TabsContent value="tents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {tents.map((tent) => (
              <Card key={tent.id} className="border-surface-200 shadow-level-1 hover:shadow-level-2 transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="font-display text-headline-sm text-primary-900">
                        {tent.name}
                      </CardTitle>
                      <p className="font-body text-body-sm text-secondary-600">
                        {tent.type}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        {tent.status !== 'available' && (
                          <DropdownMenuItem
                            onClick={() => handleTentStatusChange(tent.id, 'available')}
                            className="font-body text-body-sm"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                            Mark as Available
                          </DropdownMenuItem>
                        )}
                        {tent.status !== 'damaged' && (
                          <DropdownMenuItem
                            onClick={() => handleTentStatusChange(tent.id, 'damaged')}
                            className="font-body text-body-sm"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                            Mark as Damaged
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    {getTentStatusBadge(tent.status)}
                  </div>

                  {tent.status === 'booked' && tent.currentBooking && (
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-3 space-y-1">
                      <p className="font-body text-label-sm text-amber-900 font-medium">
                        Current Occupant
                      </p>
                      <p className="font-body text-body-sm text-amber-800">
                        {tent.currentBooking.guestName}
                      </p>
                      <p className="font-body text-body-xs text-amber-700">
                        Checkout: {new Date(tent.currentBooking.checkoutDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {tent.status === 'damaged' && tent.damageNote && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 space-y-1">
                      <p className="font-body text-label-sm text-red-900 font-medium flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Issue Reported
                      </p>
                      <p className="font-body text-body-sm text-red-800">
                        {tent.damageNote}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card className="border-surface-200 shadow-level-1">
            <CardHeader>
              <CardTitle className="font-display text-headline-md text-primary-900">
                Inventory Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-surface-200">
                    <TableHead className="font-body text-label-sm text-secondary-700">
                      Item Name
                    </TableHead>
                    <TableHead className="font-body text-label-sm text-secondary-700">
                      Category
                    </TableHead>
                    <TableHead className="font-body text-label-sm text-secondary-700">
                      Quantity
                    </TableHead>
                    <TableHead className="font-body text-label-sm text-secondary-700">
                      Status
                    </TableHead>
                    <TableHead className="font-body text-label-sm text-secondary-700 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id} className="border-surface-200">
                      <TableCell className="font-body text-body-md text-primary-900">
                        {item.name}
                      </TableCell>
                      <TableCell className="font-body text-body-sm text-secondary-600">
                        {item.category}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                              className="w-20 h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => saveQuantity(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={cancelEdit}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-body text-body-md text-primary-900">
                              {item.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEditingQuantity(item.id, item.quantity)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-secondary-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.damagedCount ? (
                            <>
                              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                {item.quantity - item.damagedCount} Available
                              </Badge>
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                                {item.damagedCount} Damaged
                              </Badge>
                            </>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                              All Available
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="font-body text-body-sm">
                              <Edit2 className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem className="font-body text-body-sm">
                              <AlertTriangle className="mr-2 h-4 w-4 text-red-600" />
                              Report Damage
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
    </div>
  );
}

// Made with Bob
