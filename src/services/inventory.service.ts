/**
 * Inventory Service
 * Operational tent status (+ derived occupancy) and equipment/supply items.
 * Tent CRUD lives in the Campsites feature; this only changes tent status.
 */

import { createClient } from '../lib/supabase/server';

const ACTIVE_BOOKING_STATUSES = [
  'pending_payment',
  'confirmed',
  'checked_in',
  'checked_out',
];

// Operational statuses an admin can set from Inventory.
export const SETTABLE_TENT_STATUSES = ['available', 'maintenance', 'out_of_service'] as const;
export type SettableTentStatus = (typeof SETTABLE_TENT_STATUSES)[number];

export interface TentWithStatus {
  id: string;
  tentNumber: string;
  typeName: string;
  status: string; // available | occupied | maintenance | out_of_service
  occupant: { guestName: string; checkoutDate: string } | null;
}

export interface InventorySummary {
  totalTents: number;
  available: number;
  occupiedToday: number;
  maintenance: number;
  totalInventory: number;
}

export interface InventoryItemRow {
  id: string;
  name: string;
  category: string;
  quantity: number;
  condition: string;
}

export async function getTentsWithStatus(): Promise<TentWithStatus[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: tents }, { data: occupied }] = await Promise.all([
    supabase
      .from('tents')
      .select('id, tent_number, status, tent_types(name)')
      .order('tent_number', { ascending: true }),
    supabase
      .from('booking_tents')
      .select('tent_id, bookings!inner(customer_name, check_out, check_in, booking_status)')
      .lte('bookings.check_in', today)
      .gt('bookings.check_out', today)
      .in('bookings.booking_status', ACTIVE_BOOKING_STATUSES),
  ]);

  const occupantByTent = new Map<string, { guestName: string; checkoutDate: string }>();
  for (const row of occupied ?? []) {
    const b = (row as any).bookings;
    if (b) {
      occupantByTent.set((row as any).tent_id, {
        guestName: b.customer_name,
        checkoutDate: b.check_out,
      });
    }
  }

  return (tents ?? []).map((t: any) => {
    const occupant = occupantByTent.get(t.id) ?? null;
    // Surface "occupied" as a derived status when a guest is in-house today.
    const status = occupant && t.status === 'available' ? 'occupied' : t.status;
    return {
      id: t.id,
      tentNumber: t.tent_number,
      typeName: t.tent_types?.name ?? '—',
      status,
      occupant,
    };
  });
}

export async function getInventorySummary(): Promise<InventorySummary> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [tentsRes, occRes, itemsRes] = await Promise.all([
    supabase.from('tents').select('status'),
    supabase
      .from('booking_tents')
      .select('tent_id, bookings!inner(check_in, check_out, booking_status)')
      .lte('bookings.check_in', today)
      .gt('bookings.check_out', today)
      .in('bookings.booking_status', ACTIVE_BOOKING_STATUSES),
    supabase.from('inventory_items').select('quantity'),
  ]);

  const tentStatuses = (tentsRes.data ?? []).map((t: any) => t.status);
  const totalTents = tentStatuses.length;
  const maintenance = tentStatuses.filter(
    (s: string) => s === 'maintenance' || s === 'out_of_service'
  ).length;
  const occupiedToday = new Set((occRes.data ?? []).map((r: any) => r.tent_id)).size;
  // "Available" = operationally available and not occupied today.
  const operationallyAvailable = tentStatuses.filter((s: string) => s === 'available').length;
  const available = Math.max(0, operationallyAvailable - occupiedToday);
  const totalInventory = (itemsRes.data ?? []).reduce(
    (sum: number, i: any) => sum + Number(i.quantity || 0),
    0
  );

  return { totalTents, available, occupiedToday, maintenance, totalInventory };
}

export async function updateTentStatus(id: string, status: SettableTentStatus) {
  if (!SETTABLE_TENT_STATUSES.includes(status)) {
    return { success: false, error: 'Invalid status' };
  }
  const supabase = await createClient();
  const { error } = await supabase.from('tents').update({ status }).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function listInventoryItems(): Promise<InventoryItemRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inventory_items')
    .select('id, name, category, quantity, condition')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('listInventoryItems error:', error);
    return [];
  }
  return (data ?? []).map((i: any) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    quantity: Number(i.quantity),
    condition: i.condition,
  }));
}

export interface InventoryItemInput {
  name: string;
  category: string;
  quantity: number;
  condition: string;
}

export async function createInventoryItem(input: InventoryItemInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('inventory_items')
    .insert(input)
    .select('id')
    .single();
  if (error) return { success: false, error: error.message };
  return { success: true, id: data.id };
}

export async function updateInventoryItem(id: string, input: Partial<InventoryItemInput>) {
  const supabase = await createClient();
  const { error } = await supabase.from('inventory_items').update(input).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteInventoryItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Made with Bob
