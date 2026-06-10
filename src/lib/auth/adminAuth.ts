/**
 * Admin Authentication Utilities
 * Server-side authentication helpers for admin route protection
 */

import { createClient } from '@/src/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, SessionData } from '@/src/types/admin';

/**
 * Get the current server session
 * @returns Session data with user and authentication status
 */
export async function getServerSession(): Promise<SessionData> {
  const supabase = await createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return {
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      };
    }

    const user = session.user as User;
    const isAdmin = checkAdminRole(user);

    return {
      user,
      isAuthenticated: true,
      isAdmin,
    };
  } catch (error) {
    console.error('Error getting server session:', error);
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  }
}

/**
 * Check if a user has admin role
 * Checks both user_metadata and app_metadata for role
 * @param user - The user object to check
 * @returns True if user is an admin
 */
export function checkAdminRole(user: User | null): boolean {
  if (!user) return false;

  // Check app_metadata first (set by Supabase Auth)
  if (user.app_metadata?.role === 'admin') {
    return true;
  }

  // Fallback to user_metadata (can be set by user profile)
  if (user.user_metadata?.role === 'admin') {
    return true;
  }

  // TODO: Add database check for admin roles table
  // This would query a separate admin_users or user_roles table
  // Example:
  // const { data } = await supabase
  //   .from('admin_users')
  //   .select('id')
  //   .eq('user_id', user.id)
  //   .single();
  // return !!data;

  return false;
}

/**
 * Require authentication for a server component or API route
 * Redirects to login if not authenticated
 * @param returnUrl - Optional URL to return to after login
 * @returns Session data if authenticated
 */
export async function requireAuth(returnUrl?: string): Promise<SessionData> {
  const session = await getServerSession();

  if (!session.isAuthenticated) {
    redirectToLogin(returnUrl);
  }

  return session;
}

/**
 * Require admin role for a server component or API route
 * Redirects to login if not authenticated, or to unauthorized if not admin
 * @param returnUrl - Optional URL to return to after login
 * @returns Session data if authenticated and admin
 */
export async function requireAdmin(returnUrl?: string): Promise<SessionData> {
  const session = await getServerSession();

  if (!session.isAuthenticated) {
    redirectToLogin(returnUrl);
  }

  if (!session.isAdmin) {
    redirect('/unauthorized');
  }

  return session;
}

/**
 * Redirect to login page with return URL
 * @param returnUrl - URL to return to after login
 */
export function redirectToLogin(returnUrl?: string): never {
  const url = returnUrl || '/admin';
  const loginUrl = `/login?returnUrl=${encodeURIComponent(url)}`;
  redirect(loginUrl);
}

/**
 * Get user display name
 * @param user - User object
 * @returns Display name or email
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  
  return (
    user.user_metadata?.full_name ||
    user.email?.split('@')[0] ||
    'User'
  );
}

/**
 * Get user avatar URL
 * @param user - User object
 * @returns Avatar URL or null
 */
export function getUserAvatarUrl(user: User | null): string | null {
  if (!user) return null;
  
  return user.user_metadata?.avatar_url || null;
}

/**
 * Refresh user session
 * Call this to refresh an expired or expiring session
 */
export async function refreshSession(): Promise<SessionData> {
  const supabase = await createClient();
  
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    
    if (error || !session) {
      return {
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      };
    }

    const user = session.user as User;
    const isAdmin = checkAdminRole(user);

    return {
      user,
      isAuthenticated: true,
      isAdmin,
    };
  } catch (error) {
    console.error('Error refreshing session:', error);
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// Made with Bob