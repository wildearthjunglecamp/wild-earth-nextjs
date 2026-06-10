/**
 * Unauthorized Access Page
 * Displayed when a user tries to access admin area without proper permissions
 */

import { Metadata } from 'next';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Unauthorized Access | Wild Earth',
  description: 'You do not have permission to access this page',
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <ShieldAlert className="h-24 w-24 text-red-500" />
            <div className="absolute inset-0 h-24 w-24 animate-ping rounded-full bg-red-500/20" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Access Denied
          </h1>
          <p className="text-lg text-gray-600">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-500">
            This area is restricted to administrators only. If you believe you should have access, please contact your system administrator.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="default" className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Go to Home
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" className="w-full sm:w-auto">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </Link>
        </div>

        {/* Error code */}
        <div className="pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400">Error Code: 403 - Forbidden</p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob