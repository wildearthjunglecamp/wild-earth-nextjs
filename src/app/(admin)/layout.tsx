/**
 * Admin Layout
 * Main layout wrapper for admin area with authentication, sidebar, and header
 */

'use client';

import { useState } from 'react';
import { AuthGuard } from '@/src/components/admin/AuthGuard';
import { Sidebar } from '@/src/components/admin/Sidebar';
import { Header } from '@/src/components/admin/Header';
import { usePathname } from 'next/navigation';
import { Breadcrumb } from '@/src/types/admin';

/**
 * Generate breadcrumbs from pathname
 */
function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Breadcrumb[] = [];

  // Always start with Admin
  breadcrumbs.push({ label: 'Admin', href: '/admin/dashboard' });

  // Build breadcrumbs from path segments
  let currentPath = '';
  segments.forEach((segment, index) => {
    if (segment === 'admin') return; // Skip 'admin' segment

    currentPath += `/${segment}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Last segment should not have href (current page)
    if (index === segments.length - 1) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, href: `/admin${currentPath}` });
    }
  });

  return breadcrumbs;
}

/**
 * Admin Layout Component
 * Wraps all admin pages with authentication and navigation
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  return (
    <AuthGuard requireAdmin={true}>
      <div className="flex min-h-screen bg-surface">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="flex-1 flex flex-col lg:ml-0">
          {/* Header */}
          <Header
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            breadcrumbs={breadcrumbs}
          />

          {/* Main content */}
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-outline-variant bg-surface-container-lowest py-4 px-4 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-on-surface-variant font-sans">
              <p>© 2026 Wild Earth Jungle Camp. All rights reserved.</p>
              <p className="mt-2 sm:mt-0">
                Made with ❤️ by  <a href="www.xenolve.com" target='_blank'>
                   Xenolve
                  </a>
              </p>
            </div>
          </footer>
        </div>
      </div>
    </AuthGuard>
  );
}

// Made with Bob
