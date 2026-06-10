/**
 * AuthGuard Component
 * Client-side authentication guard for protecting routes and components
 */

'use client';

import { useRequireAuth } from '@/src/hooks/use-auth';
import { AuthGuardProps } from '@/src/types/admin';
import { Loader2 } from 'lucide-react';

/**
 * AuthGuard component that protects child components
 * Shows loading state during authentication check
 * Redirects unauthenticated users to login
 * Redirects non-admin users to unauthorized page (if requireAdmin is true)
 * 
 * @param children - Components to protect
 * @param requireAdmin - Whether to require admin role (default: true)
 * @param fallback - Optional custom loading component
 */
export function AuthGuard({
  children,
  requireAdmin = true,
  fallback,
}: AuthGuardProps) {
  const { user, isLoading, isAdmin } = useRequireAuth(requireAdmin);

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Verifying authentication...</p>
          </div>
        </div>
      )
    );
  }

  // If not authenticated or not admin (when required), the useRequireAuth hook
  // will handle the redirect. We return null here to prevent flash of content.
  if (!user || (requireAdmin && !isAdmin)) {
    return null;
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
}

/**
 * Lightweight loading component for auth checks
 */
export function AuthLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
          <div className="absolute inset-0 h-16 w-16 animate-ping rounded-full bg-primary/20 mx-auto" />
        </div>
        <div className="space-y-2">
          <p className="text-gray-700 text-xl font-semibold">
            Authenticating
          </p>
          <p className="text-gray-500 text-sm">
            Please wait while we verify your credentials...
          </p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob