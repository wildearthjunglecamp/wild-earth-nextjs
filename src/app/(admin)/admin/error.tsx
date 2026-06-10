/**
 * Admin Error Boundary
 * Catches and displays errors in admin pages
 */

'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/src/components/ui/alert';

/**
 * Error component for admin pages
 * Provides user-friendly error messages and recovery options
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Admin page error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full space-y-6">
        {/* Error alert */}
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong!</AlertTitle>
          <AlertDescription>
            {error.message || 'An unexpected error occurred while loading this page.'}
          </AlertDescription>
        </Alert>

        {/* Error details card */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold mb-2">What happened?</h2>
          <p className="text-gray-600 text-sm mb-4">
            We encountered an error while processing your request. This could be due to:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-6">
            <li>A temporary server issue</li>
            <li>Network connectivity problems</li>
            <li>Invalid or corrupted data</li>
            <li>Permission or authentication issues</li>
          </ul>

          {/* Error digest for debugging */}
          {error.digest && (
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-500 mb-4">
              <span className="font-semibold">Error ID:</span> {error.digest}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={reset}
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="flex-1"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </div>
        </div>

        {/* Help text */}
        <p className="text-center text-sm text-gray-500">
          If this problem persists, please contact support with the error ID above.
        </p>
      </div>
    </div>
  );
}

// Made with Bob