/**
 * useAuth Hook
 * Client-side authentication hook for React components
 */

'use client';

import { createClient } from '@/src/lib/supabase/client';
import { User, AuthContextType } from '@/src/types/admin';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for authentication state and actions
 * @returns Authentication context with user, loading state, and actions
 */
export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  /**
   * Check if current user has admin role
   */
  const isAdmin = useCallback((): boolean => {
    if (!user) return false;

    // Check app_metadata first
    if (user.app_metadata?.role === 'admin') {
      return true;
    }

    // Fallback to user_metadata
    if (user.user_metadata?.role === 'admin') {
      return true;
    }

    return false;
  }, [user]);

  /**
   * Sign out the current user
   */
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }, [supabase, router]);

  /**
   * Refresh the current session
   */
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      if (session?.user) {
        setUser(session.user as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      setUser(null);
      throw error;
    }
  }, [supabase]);

  /**
   * Initialize auth state and set up listener
   */
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user as User || null);
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user as User || null);
        
        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        } else if (event === 'SIGNED_IN') {
          router.refresh();
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('Token refreshed successfully');
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return {
    user,
    isLoading,
    isAdmin: isAdmin(),
    signOut,
    refreshSession,
  };
}

/**
 * Hook to require authentication
 * Redirects to login if not authenticated
 * @param requireAdmin - Whether to require admin role
 */
export function useRequireAuth(requireAdmin: boolean = false) {
  const { user, isLoading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Not authenticated, redirect to login
        const returnUrl = window.location.pathname;
        router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      } else if (requireAdmin && !isAdmin) {
        // Authenticated but not admin, redirect to unauthorized
        router.push('/unauthorized');
      }
    }
  }, [user, isLoading, isAdmin, requireAdmin, router]);

  return { user, isLoading, isAdmin };
}

// Made with Bob