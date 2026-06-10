/**
 * Login Page
 * Authentication page for admin and user login
 */

import { Metadata } from 'next';
import { Tent } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Login | Wild Earth',
  description: 'Sign in to your account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {/* Logo and title */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Tent className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Wild Earth</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Login form placeholder */}
        <div className="mt-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              <strong>Note:</strong> Login functionality will be implemented with Supabase Auth.
              This is a placeholder page for the authentication flow.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sign in
            </button>
          </div>

          <div className="text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="font-medium text-primary hover:text-primary/90">
                Sign up
              </a>
            </p>
          </div>
        </div>

        {/* TODO: Implement Supabase Auth */}
        <div className="mt-6 text-xs text-gray-500 text-center">
          <p>TODO: Integrate Supabase Authentication</p>
          <p className="mt-1">- Email/Password login</p>
          <p>- OAuth providers (Google, GitHub)</p>
          <p>- Password reset flow</p>
        </div>
      </div>
    </div>
  );
}

// Made with Bob