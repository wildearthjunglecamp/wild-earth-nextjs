/**
 * Admin Header Component
 * Top navigation bar with branding, user profile, and breadcrumbs
 */

'use client';

import { HeaderProps } from '@/src/types/admin';
import { useAuth } from '@/src/hooks/use-auth';
import { cn } from '@/src/lib/utils';
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar';
import { Input } from '@/src/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Admin Header Component
 * Features:
 * - Mobile menu toggle
 * - Search functionality
 * - Notifications
 * - User profile dropdown
 * - Breadcrumb navigation
 */
export function Header({ onMenuToggle, breadcrumbs }: HeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Get user display name
  const displayName = user?.user_metadata?.full_name ||
                      user?.email?.split('@')[0] ||
                      'User';
  
  // Get user avatar URL
  const avatarUrl = user?.user_metadata?.avatar_url || null;
  
  // Generate initials
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant shadow-level-1">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left section: Menu toggle and breadcrumbs */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuToggle}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="hidden md:flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center space-x-2">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-on-surface-variant hover:text-on-surface transition-colors font-sans"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-on-surface font-display font-semibold">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Right section: Search, notifications, and user menu */}
        <div className="flex items-center space-x-2 lg:space-x-4">
          {/* Search - Desktop only */}
          <div className="hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-9 w-64 bg-surface-container border-outline-variant focus:bg-surface-container-lowest focus:border-primary rounded-md font-sans"
              />
            </div>
          </div>

          {/* Search - Mobile */}
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {/* Notification badge */}
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10 border-2 border-primary-container">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary text-on-primary font-display font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {displayName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push('/admin/profile')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/admin/settings')}
                className="cursor-pointer"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// Made with Bob