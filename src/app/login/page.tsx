/**
 * Admin Login Page
 * Secure authentication page for campsite management dashboard
 */

import { Metadata } from 'next';
import Image from 'next/image';
import { AdminLoginForm } from '../../components/admin/admin-login-form';
import { Mountain, Shield, Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Admin Login | Wild Earth Jungle Camp',
  description: 'Secure access to campsite management dashboard',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Visual (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary-container to-primary-fixed overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/heroBg.jpeg"
            alt="Wild Earth Campsite"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary-container/80 to-primary/70" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-on-primary">
          {/* Logo and Brand */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Mountain className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-display font-bold">Wild Earth</h1>
                <p className="text-sm text-primary-fixed">Jungle Camp</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-8 max-w-md">
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-bold leading-tight">
                Campsite Management Dashboard
              </h2>
              <p className="text-lg text-primary-fixed leading-relaxed">
                Secure access to manage bookings, inventory, and operations for your wilderness retreat.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Secure Authentication</h3>
                  <p className="text-sm text-primary-fixed">
                    Protected access with industry-standard security
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Lock className="h-6 w-6 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Admin Only</h3>
                  <p className="text-sm text-primary-fixed">
                    Restricted access for authorized personnel
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-primary-fixed">
            <p>&copy; 2026 Wild Earth Jungle Camp. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-surface">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (Visible only on mobile) */}
          <div className="lg:hidden text-center space-y-2">
            <div className="flex justify-center">
              <div className="flex items-center space-x-2 text-primary">
                <Mountain className="h-8 w-8" />
                <div className="text-left">
                  <h1 className="text-xl font-display font-bold">Wild Earth</h1>
                  <p className="text-xs text-on-surface-variant">Jungle Camp</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-display font-bold text-on-surface">
              Admin Login
            </h2>
            <p className="text-body-md text-on-surface-variant">
              Sign in to access the management dashboard
            </p>
          </div>

          {/* Login Form */}
          <AdminLoginForm />

          {/* Security Notice */}
          <div className="pt-6 border-t border-outline-variant">
            <div className="flex items-start space-x-2 text-xs text-on-surface-variant">
              <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                This is a secure area. All login attempts are monitored and logged.
                Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
