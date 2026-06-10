/**
 * Campsites Management Page
 * Manage campsite inventory and tent types
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';

export const metadata: Metadata = {
  title: 'Campsites | Wild Earth Admin',
  description: 'Manage campsites and tent types',
};

export default async function CampsitesPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Campsites</h1>
        <p className="text-gray-600 mt-2">
          Manage your campsite inventory and tent types
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
        <p className="text-gray-500 text-center">
          Campsite management interface will be implemented here
        </p>
      </div>
    </div>
  );
}

// Made with Bob