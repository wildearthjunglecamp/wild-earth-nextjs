'use client';

/**
 * Admin Login Form Component
 * Handles authentication for the campsite management dashboard
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';

interface LoginFormData {
  email: string;
  password: string;
}

export function AdminLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Implement Supabase authentication
      // Placeholder for authentication logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Simulate authentication
      if (formData.email && formData.password) {
        router.push('/admin/dashboard');
      } else {
        throw new Error('Please enter valid credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
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
