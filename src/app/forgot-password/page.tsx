/**
 * Forgot Password Page
 * Password reset request page for admin users
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Mountain, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { createClient } from '../../lib/supabase/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Where the emailed reset link lands. Falls back to the current origin
      // when NEXT_PUBLIC_APP_URL is not set (e.g. preview deployments).
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: `${baseUrl}/reset-password` }
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      // Always show success so we don't reveal which emails have accounts.
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
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
              Password Recovery
            </h2>
            <p className="text-lg text-primary-fixed leading-relaxed">
              We'll send you instructions to reset your password securely.
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

          {/* Back Button */}
          <button
            onClick={() => router.push('/login')}
            className="flex items-center space-x-2 text-sm font-medium text-primary hover:text-primary-container transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to login</span>
          </button>

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
                  Check Your Email
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  We've sent password reset instructions to <strong>{email}</strong>
                </p>
              </div>
              <Alert className="bg-primary-fixed/20 border-primary-fixed">
                <Mail className="h-4 w-4 text-primary" />
                <AlertDescription className="text-on-surface-variant">
                  Didn't receive the email? Check your spam folder or try again in a few minutes.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-primary hover:bg-primary-container text-on-primary"
              >
                Return to Login
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
                  Enter your email address and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    placeholder="admin@wildearth.com"
                    className="h-11 bg-surface-container-lowest border-outline-variant focus:border-primary focus:ring-primary"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-primary hover:bg-primary-container text-on-primary font-medium"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Reset Instructions
                    </>
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
