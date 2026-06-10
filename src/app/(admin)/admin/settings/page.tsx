/**
 * Settings Page
 * Admin settings and configuration
 */

import { Metadata } from 'next';
import { requireAdmin } from '@/src/lib/auth/adminAuth';

export const metadata: Metadata = {
  title: 'Settings | Wild Earth Admin',
  description: 'Admin settings and configuration',
};

export default async function SettingsPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage system settings and configuration
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow border border-gray-200">
        <p className="text-gray-500 text-center">
          Settings interface will be implemented here
        </p>
      </div>
    </div>
  );
}

// Made with Bob