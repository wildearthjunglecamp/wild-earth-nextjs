/**
 * Guests Management Page
 * Manage guest information and history
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';

export const metadata: Metadata = {
  title: 'Guests | Wild Earth Admin',
  description: 'Manage guest information',
};

export default async function GuestsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guests</h1>
        <p className="text-gray-600 mt-2">
          Manage guest information and booking history
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
        <p className="text-gray-500 text-center">
          Guest management interface will be implemented here
        </p>
      </div>
    </div>
  );
}

// Made with Bob