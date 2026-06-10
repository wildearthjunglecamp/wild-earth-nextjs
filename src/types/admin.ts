/**
 * Admin Type Definitions
 * TypeScript interfaces for admin area components and data structures
 */

import { User as SupabaseUser } from '@supabase/supabase-js';

/**
 * Extended User interface with admin role properties
 */
export interface User extends SupabaseUser {
  user_metadata: {
    role?: 'admin' | 'user';
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  app_metadata: {
    role?: 'admin' | 'user';
    [key: string]: any;
  };
}

/**
 * Admin Layout Props
 */
export interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Sidebar Props
 */
export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

/**
 * Navigation Item
 */
export interface NavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

/**
 * Header Props
 */
export interface HeaderProps {
  onMenuToggle: () => void;
  user?: User | null;
  breadcrumbs?: Breadcrumb[];
}

/**
 * Breadcrumb Item
 */
export interface Breadcrumb {
  label: string;
  href?: string;
}

/**
 * Auth Guard Props
 */
export interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Auth Context Type
 */
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

/**
 * Session Data
 */
export interface SessionData {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

/**
 * Admin Stats for Dashboard
 */
export interface AdminStats {
  totalBookings: number;
  revenue: number;
  occupancyRate: number;
  availableTents: number;
}

/**
 * User Profile Dropdown Item
 */
export interface ProfileMenuItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  divider?: boolean;
}

// Made with Bob