/**
 * Expense Service
 * Data access + aggregation for admin expense tracking.
 * Maps the UI `notes` field to the DB `description` column.
 */

import { createClient } from '../lib/supabase/server';
import type { ExpenseInput } from '../validations/expense.schema';

export interface ExpenseRow {
  id: string;
  date: string;
  category: string;
  amount: number;
  notes: string;
}

export interface ListExpensesParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ListExpensesResult {
  rows: ExpenseRow[];
  total: number;
  page: number;
  pageSize: number;
}

function mapRow(r: any): ExpenseRow {
  return {
    id: r.id,
    date: r.date,
    category: r.category,
    amount: Number(r.amount),
    notes: r.description ?? '',
  };
}

export async function listExpenses(
  params: ListExpensesParams = {}
): Promise<ListExpensesResult> {
  const supabase = await createClient();
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('expenses')
    .select('id, date, category, amount, description', { count: 'exact' })
    .order('date', { ascending: false });

  if (params.search && params.search.trim()) {
    const q = params.search.trim().replace(/[%,()]/g, '');
    if (q) {
      query = query.or(`description.ilike.%${q}%,category.ilike.%${q}%`);
    }
  }

  const { data, count, error } = await query.range(from, to);
  if (error) {
    console.error('listExpenses error:', error);
    return { rows: [], total: 0, page, pageSize };
  }

  return {
    rows: (data ?? []).map(mapRow),
    total: count ?? 0,
    page,
    pageSize,
  };
}

export interface ExpenseStats {
  thisMonthTotal: number;
  lastMonthTotal: number;
  changePct: number; // vs last month
  trend: 'up' | 'down' | 'flat';
  byCategory: { category: string; amount: number; percentage: number }[];
  topCategory: { name: string; percentage: number } | null;
}

/**
 * This-month vs last-month totals plus a this-month category breakdown.
 */
export async function getExpenseStats(): Promise<ExpenseStats> {
  const supabase = await createClient();
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toISOString()
    .slice(0, 10);

  // Pull this + last month rows in one query, bucket in JS.
  const { data } = await supabase
    .from('expenses')
    .select('date, category, amount')
    .gte('date', lastMonthStart);

  let thisMonthTotal = 0;
  let lastMonthTotal = 0;
  const categoryTotals = new Map<string, number>();

  for (const row of data ?? []) {
    const amount = Number((row as any).amount || 0);
    const date = (row as any).date as string;
    if (date >= thisMonthStart) {
      thisMonthTotal += amount;
      categoryTotals.set(
        (row as any).category,
        (categoryTotals.get((row as any).category) ?? 0) + amount
      );
    } else {
      lastMonthTotal += amount;
    }
  }

  const byCategory = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: thisMonthTotal > 0 ? Math.round((amount / thisMonthTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const changePct =
    lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 1000) / 10
      : thisMonthTotal > 0
      ? 100
      : 0;

  return {
    thisMonthTotal,
    lastMonthTotal,
    changePct,
    trend: changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'flat',
    byCategory,
    topCategory: byCategory[0]
      ? { name: byCategory[0].category, percentage: byCategory[0].percentage }
      : null,
  };
}

export async function createExpense(input: ExpenseInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      date: input.date,
      category: input.category,
      amount: input.amount,
      description: input.notes,
    })
    .select('id')
    .single();

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, id: data.id };
}

export async function updateExpense(id: string, input: ExpenseInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('expenses')
    .update({
      date: input.date,
      category: input.category,
      amount: input.amount,
      description: input.notes,
    })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

// Made with Bob
