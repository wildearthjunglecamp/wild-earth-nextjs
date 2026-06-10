/**
 * Admin Sidebar Component
 * Responsive navigation sidebar with mobile support and active route highlighting
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { SidebarProps, NavItem } from '@/src/types/admin';
import {
  LayoutDashboard,
  Calendar,
  Tent,
  Users,
  Settings,
  FileText,
  DollarSign,
  Package,
  X,
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Badge } from '@/src/components/ui/badge';

/**
 * Navigation items configuration
 * Add new pages here as they are implemented
 */
const navigationItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/bookings',
    label: 'Bookings',
    icon: FileText,
    badge: 'New', // TODO: Replace with dynamic count
  },
  {
    href: '/admin/calendar',
    label: 'Calendar',
    icon: Calendar,
  },
  {
    href: '/admin/campsites',
    label: 'Campsites',
    icon: Tent,
  },
  {
    href: '/admin/guests',
    label: 'Guests',
    icon: Users,
  },
  {
    href: '/admin/inventory',
    label: 'Inventory',
    icon: Package,
  },
  {
    href: '/admin/expenses',
    label: 'Expenses',
    icon: DollarSign,
  },
  {
    href: '/admin/reports',
    label: 'Reports',
    icon: FileText,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
  },
];

/**
 * Sidebar component with responsive behavior
 * - Desktop: Fixed sidebar
 * - Mobile: Overlay sidebar with backdrop
 */
export function Sidebar({ isOpen, onClose, className }: SidebarProps) {
  const pathname = usePathname();

  /**
   * Check if a route is active
   */
  const isActiveRoute = (href: string): boolean => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin' || pathname === '/admin/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-64 bg-primary text-on-primary transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-level-2',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-container">
          <div className="flex items-center space-x-2">
            <Tent className="h-8 w-8 text-primary-fixed-dim" />
            <div>
              <h2 className="text-xl font-display font-bold">Wild Earth</h2>
              <p className="text-xs text-on-primary/70">Admin Panel</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-on-primary/70 hover:text-on-primary hover:bg-primary-container"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="h-[calc(100vh-5rem)] px-3 py-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close mobile sidebar on navigation
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-display font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-container text-on-primary shadow-level-1'
                      : 'text-on-primary/80 hover:bg-primary-container/50 hover:text-on-primary'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {Icon && (
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0',
                          isActive ? 'text-primary-fixed-dim' : 'text-on-primary/60'
                        )}
                      />
                    )}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={isActive ? 'secondary' : 'outline'}
                      className="ml-auto text-xs bg-primary-fixed text-on-primary-fixed"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer section */}
          <div className="mt-8 pt-4 border-t border-primary-container">
            <div className="px-3 py-2 text-xs text-on-primary/50 font-sans">
              <p>Version 1.0.0</p>
              <p className="mt-1">© 2024 Wild Earth</p>
            </div>
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}

// Made with Bob