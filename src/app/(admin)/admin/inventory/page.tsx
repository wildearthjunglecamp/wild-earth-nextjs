/**
 * Inventory Management Page
 * Server-fetches tent status + equipment, renders the interactive manager.
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import {
  getTentsWithStatus,
  getInventorySummary,
  listInventoryItems,
} from '@/src/services/inventory.service';
import { InventoryManager } from '@/src/components/admin/InventoryManager';

export const metadata: Metadata = {
  title: 'Inventory | Wild Earth Admin',
  description: 'Monitor tent status and manage equipment & supplies',
};

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  await requireAdmin();

  const [tents, items, summary] = await Promise.all([
    getTentsWithStatus(),
    listInventoryItems(),
    getInventorySummary(),
  ]);

  return <InventoryManager tents={tents} items={items} summary={summary} />;
}

// Made with Bob
