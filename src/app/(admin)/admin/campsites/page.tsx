/**
 * Campsites Management Page
 * Edit tent types and manage individual tents.
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { listTentTypes, listTents } from '@/src/services/campsite.service';
import { CampsitesManager } from '@/src/components/admin/CampsitesManager';

export const metadata: Metadata = {
  title: 'Campsites | Wild Earth Admin',
  description: 'Manage campsites and tent types',
};

export const dynamic = 'force-dynamic';

export default async function CampsitesPage() {
  await requireAdmin();

  const [tentTypes, tents] = await Promise.all([listTentTypes(), listTents()]);

  return <CampsitesManager tentTypes={tentTypes} tents={tents} />;
}

// Made with Bob
