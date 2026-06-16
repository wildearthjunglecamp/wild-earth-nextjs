/**
 * Campsite Service
 * Manage tent types (edit) and individual tents (CRUD, guarded delete).
 */

import { createClient } from '../lib/supabase/server';
import type { TentInput, TentUpdateInput, TentTypeUpdateInput } from '../validations/campsite.schema';

export interface TentTypeRow {
  id: string;
  slug: string;
  name: string;
  capacity: number;
  basePrice: number;
  description: string | null;
  isActive: boolean;
  tentCount: number;
}

export interface TentRow {
  id: string;
  tentNumber: string;
  status: string;
  tentTypeId: string;
  typeName: string;
}

export async function listTentTypes(): Promise<TentTypeRow[]> {
  const supabase = await createClient();
  const [{ data: types }, { data: tents }] = await Promise.all([
    supabase
      .from('tent_types')
      .select('id, slug, name, capacity, base_price, description, is_active')
      .order('capacity', { ascending: true }),
    supabase.from('tents').select('tent_type_id'),
  ]);

  const countByType = new Map<string, number>();
  for (const t of tents ?? []) {
    const id = (t as any).tent_type_id;
    countByType.set(id, (countByType.get(id) ?? 0) + 1);
  }

  return (types ?? []).map((t: any) => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    capacity: t.capacity,
    basePrice: Number(t.base_price),
    description: t.description,
    isActive: t.is_active,
    tentCount: countByType.get(t.id) ?? 0,
  }));
}

export async function listTents(): Promise<TentRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tents')
    .select('id, tent_number, status, tent_type_id, tent_types(name)')
    .order('tent_number', { ascending: true });

  if (error) {
    console.error('listTents error:', error);
    return [];
  }
  return (data ?? []).map((t: any) => ({
    id: t.id,
    tentNumber: t.tent_number,
    status: t.status,
    tentTypeId: t.tent_type_id,
    typeName: t.tent_types?.name ?? '—',
  }));
}

export async function updateTentType(id: string, input: TentTypeUpdateInput) {
  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name;
  if (input.basePrice !== undefined) patch.base_price = input.basePrice;
  if (input.description !== undefined) patch.description = input.description;
  if (input.isActive !== undefined) patch.is_active = input.isActive;

  if (Object.keys(patch).length === 0) return { success: true };

  const { error } = await supabase.from('tent_types').update(patch).eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function createTent(input: TentInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('tents')
    .insert({
      tent_number: input.tentNumber,
      tent_type_id: input.tentTypeId,
      status: input.status,
    })
    .select('id')
    .single();

  if (error) {
    // Unique (tent_type_id, tent_number) violation → friendlier message.
    if (error.message.includes('unique') || error.code === '23505') {
      return { success: false, error: 'A tent with this number already exists for that type.' };
    }
    return { success: false, error: error.message };
  }
  return { success: true, id: data.id };
}

export async function updateTent(id: string, input: TentUpdateInput) {
  const supabase = await createClient();
  const patch: Record<string, unknown> = {};
  if (input.tentNumber !== undefined) patch.tent_number = input.tentNumber;
  if (input.tentTypeId !== undefined) patch.tent_type_id = input.tentTypeId;
  if (input.status !== undefined) patch.status = input.status;

  if (Object.keys(patch).length === 0) return { success: true };

  const { error } = await supabase.from('tents').update(patch).eq('id', id);
  if (error) {
    if (error.message.includes('unique') || error.code === '23505') {
      return { success: false, error: 'A tent with this number already exists for that type.' };
    }
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Delete a tent. Guarded: if the tent has any booking history (booking_tents
 * references it via FK RESTRICT) we refuse and suggest marking it out of service.
 */
export async function deleteTent(id: string) {
  const supabase = await createClient();

  const { count } = await supabase
    .from('booking_tents')
    .select('id', { count: 'exact', head: true })
    .eq('tent_id', id);

  if ((count ?? 0) > 0) {
    return {
      success: false,
      error:
        'This tent has booking history and cannot be deleted. Mark it "Out of Service" instead.',
    };
  }

  const { error } = await supabase.from('tents').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// Made with Bob
