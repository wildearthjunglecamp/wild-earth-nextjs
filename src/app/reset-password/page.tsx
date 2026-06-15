/**
 * Reset Password Page
 * Landing page for the password-reset link emailed by Supabase.
 * Supabase establishes a temporary recovery session when the link is opened;
 * this page lets the user set a new password and updates it via updateUser().
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Mountain,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { createClient } from '../../lib/supabase/client';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Whether a valid recovery session is present for this visit.
  const [hasRecoverySession, setHasRecoverySession] = useState<boolean | null>(null);

  // The browser Supabase client auto-detects the recovery token in the URL and
  // fires PASSWORD_RECOVERY. We also check for an existing session as a fallback.
  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && session) setHasRecoverySession(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setHasRecoverySession(true);
      }
    });

    // If nothing arrived shortly after load, treat the link as invalid/expired.
    const timer = setTimeout(() => {
      if (active) setHasRecoverySession((current) => current ?? false);
    }, 2500);

    return () => {
      active = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setIsSuccess(true);
      // Drop the recovery session so the new password is required next time.
      await supabase.auth.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Brand Visual (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary-container to-primary-fixed overflow-hidden">
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

        <div className="relative z-10 flex flex-col justify-between p-12 text-on-primary">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Mountain className="h-10 w-10" />
              <div>
                <h1 className="text-2xl font-display font-bold">Wild Earth</h1>
                <p className="text-sm text-primary-fixed">Jungle Camp</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 max-w-md">
            <h2 className="text-4xl font-display font-bold leading-tight">
              Set a New Password
            </h2>
            <p className="text-lg text-primary-fixed leading-relaxed">
              Choose a strong password to keep your dashboard secure.
            </p>
          </div>

          <div className="text-sm text-primary-fixed">
            <p>&copy; 2026 Wild Earth Jungle Camp. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-surface">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
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

          {isSuccess ? (
            /* Success State */
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-display font-bold text-on-surface">
                  Password Updated
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  Your password has been reset. You can now sign in with your new password.
                </p>
              </div>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-primary hover:bg-primary-container text-on-primary"
              >
                Return to Login
              </Button>
            </div>
          ) : hasRecoverySession === false ? (
            /* Invalid / expired link */
            <div className="space-y-6">
              <button
                onClick={() => router.push('/login')}
                className="flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary-container transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to login</span>
              </button>
              <Alert variant="destructive">
                <AlertDescription>
                  This password reset link is invalid or has expired. Please request a
                  new one.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/forgot-password')}
                className="w-full bg-primary hover:bg-primary-container text-on-primary"
              >
                Request New Link
              </Button>
            </div>
          ) : (
            /* Form State */
            <>
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-on-surface">
                  Reset Password
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  Enter and confirm your new password below.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-on-surface">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading || hasRecoverySession === null}
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

                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-on-surface"
                  >
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading || hasRecoverySession === null}
                    placeholder="••••••••"
                    className="h-11 bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || hasRecoverySession === null}
                  className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : hasRecoverySession === null ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying link...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
