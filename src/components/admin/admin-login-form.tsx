'use client';

/**
 * Admin Login Form Component
 * Handles authentication for the campsite management dashboard
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { createClient } from '../../lib/supabase/client';
import type { User } from '../../types/admin';

interface LoginFormData {
  email: string;
  password: string;
}

/**
 * Resolve where to send the user after a successful login.
 * Only internal paths are allowed to avoid open-redirect attacks.
 */
function getSafeReturnUrl(): string {
  const fallback = '/admin/dashboard';
  if (typeof window === 'undefined') return fallback;

  const target = new URLSearchParams(window.location.search).get('returnUrl');
  // Must be a relative, in-app path (e.g. "/admin/bookings"), not "//evil.com".
  if (target && target.startsWith('/') && !target.startsWith('//')) {
    return target;
  }
  return fallback;
}

/**
 * Check whether an authenticated user carries the admin role.
 * Mirrors the logic in middleware.ts and lib/auth/adminAuth.ts.
 */
function hasAdminRole(user: Pick<User, 'app_metadata' | 'user_metadata'>): boolean {
  return (
    user.app_metadata?.role === 'admin' || user.user_metadata?.role === 'admin'
  );
}

export function AdminLoginForm() {
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [returnUrl, setReturnUrl] = useState('/admin/dashboard');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read the post-login destination from the query string on the client.
  useEffect(() => {
    setReturnUrl(getSafeReturnUrl());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        // Supabase returns "Invalid login credentials" for bad email/password.
        setError(signInError.message);
        return;
      }

      // Block non-admin accounts from entering the dashboard.
      if (!data.user || !hasAdminRole(data.user as User)) {
        await supabase.auth.signOut();
        setError('This account is not authorized to access the admin dashboard.');
        return;
      }

      // router.refresh() lets the server/middleware pick up the new session cookie.
      router.replace(returnUrl);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Authentication failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-on-surface">
          Email Address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="admin@wildearth.com"
          className="h-11 bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-on-surface">
            Password
          </Label>
          <button
            type="button"
            onClick={() => router.push('/forgot-password')}
            className="text-sm font-medium text-primary hover:text-primary-container transition-colors"
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="••••••••"
            className="h-11 pr-10 bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-medium transition-colors"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      {/* Development Note */}
      <div className="pt-4 border-t border-outline-variant">
        <p className="text-xs text-on-surface-variant text-center">
          Secure admin access for campsite management
        </p>
      </div>
    </form>
  );
}

// Made with Bob
