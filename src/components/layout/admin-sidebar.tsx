'use client';

import Link from 'next/link';

/**
 * Admin Sidebar Navigation Component
 */
export function AdminSidebar() {
  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/bookings', label: 'Bookings' },
    { href: '/admin/calendar', label: 'Calendar' },
    { href: '/admin/inventory', label: 'Inventory' },
    { href: '/admin/expenses', label: 'Expenses' },
    { href: '/admin/reports', label: 'Reports' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="mt-8">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block px-4 py-2 hover:bg-gray-800 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

// Made with Bob
