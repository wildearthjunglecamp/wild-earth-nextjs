# Admin Area Structure Documentation

## Overview

This document describes the comprehensive secure admin area foundation for the Wild Earth campsite management system. The admin area is built with Next.js 14+ App Router, TypeScript, Tailwind CSS, and Supabase authentication.

## Table of Contents

1. [Architecture](#architecture)
2. [Authentication Flow](#authentication-flow)
3. [File Structure](#file-structure)
4. [Components](#components)
5. [Authentication Utilities](#authentication-utilities)
6. [Route Protection](#route-protection)
7. [Extending the Admin Area](#extending-the-admin-area)
8. [Configuration](#configuration)
9. [Best Practices](#best-practices)

## Architecture

The admin area follows a layered architecture:

```
┌─────────────────────────────────────┐
│         Middleware Layer            │
│    (Edge Route Protection)          │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│      Admin Layout (Server)          │
│    - Authentication Check           │
│    - Layout Structure               │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│      AuthGuard (Client)             │
│    - Session Validation             │
│    - Role Verification              │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│         Admin Pages                 │
│    - Dashboard, Bookings, etc.      │
└─────────────────────────────────────┘
```

## Authentication Flow

### 1. Initial Request
- User navigates to `/admin/*`
- Middleware intercepts the request at the edge

### 2. Middleware Check
- Validates Supabase session
- Checks admin role in user metadata
- Redirects to `/login` if not authenticated
- Redirects to `/unauthorized` if not admin

### 3. Server Component Check
- `requireAdmin()` validates session server-side
- Provides additional security layer
- Returns session data for use in components

### 4. Client Component Check
- `AuthGuard` component validates on client
- Shows loading state during validation
- Handles session refresh and token expiry

### 5. Continuous Monitoring
- `useAuth` hook monitors auth state changes
- Automatically redirects on sign out
- Refreshes tokens as needed

## File Structure

```
src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx              # Admin layout wrapper
│   │   └── admin/
│   │       ├── page.tsx            # Dashboard (redirects from /admin)
│   │       ├── loading.tsx         # Loading state
│   │       ├── error.tsx           # Error boundary
│   │       ├── dashboard/
│   │       │   └── page.tsx        # Dashboard page
│   │       ├── bookings/
│   │       │   └── page.tsx        # Bookings management
│   │       ├── calendar/
│   │       │   └── page.tsx        # Calendar view
│   │       ├── campsites/
│   │       │   └── page.tsx        # Campsite management
│   │       ├── guests/
│   │       │   └── page.tsx        # Guest management
│   │       ├── inventory/
│   │       │   └── page.tsx        # Inventory management
│   │       ├── expenses/
│   │       │   └── page.tsx        # Expense tracking
│   │       ├── reports/
│   │       │   └── page.tsx        # Reports and analytics
│   │       └── settings/
│   │           └── page.tsx        # System settings
│   ├── login/
│   │   └── page.tsx                # Login page
│   └── unauthorized/
│       └── page.tsx                # Unauthorized access page
├── components/
│   └── admin/
│       ├── AuthGuard.tsx           # Client-side auth guard
│       ├── Header.tsx              # Top navigation header
│       └── Sidebar.tsx             # Sidebar navigation
├── hooks/
│   └── use-auth.ts                 # Authentication hook
├── lib/
│   └── auth/
│       └── adminAuth.ts            # Server-side auth utilities
├── types/
│   └── admin.ts                    # TypeScript definitions
└── middleware.ts                   # Edge middleware for route protection
```

## Components

### Sidebar Component

**Location:** `src/components/admin/Sidebar.tsx`

**Features:**
- Responsive design (desktop fixed, mobile overlay)
- Active route highlighting
- Collapsible on mobile with backdrop
- Smooth animations
- Badge support for notifications

**Usage:**
```tsx
<Sidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>
```

**Adding Navigation Items:**
```typescript
// In Sidebar.tsx, add to navigationItems array
{
  href: '/admin/new-page',
  label: 'New Page',
  icon: YourIcon,
  badge: 'Optional', // Optional badge
}
```

### Header Component

**Location:** `src/components/admin/Header.tsx`

**Features:**
- Mobile menu toggle
- Search functionality
- Notifications bell
- User profile dropdown
- Breadcrumb navigation
- Logout functionality

**Usage:**
```tsx
<Header
  onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
  breadcrumbs={breadcrumbs}
/>
```

### AuthGuard Component

**Location:** `src/components/admin/AuthGuard.tsx`

**Features:**
- Client-side authentication check
- Loading state display
- Automatic redirection
- Role-based access control

**Usage:**
```tsx
<AuthGuard requireAdmin={true}>
  <YourProtectedContent />
</AuthGuard>
```

## Authentication Utilities

### Server-Side Functions

**Location:** `src/lib/auth/adminAuth.ts`

#### `getServerSession()`
Gets the current server session with user and admin status.

```typescript
const session = await getServerSession();
// Returns: { user, isAuthenticated, isAdmin }
```

#### `requireAuth(returnUrl?)`
Requires authentication, redirects to login if not authenticated.

```typescript
const session = await requireAuth('/admin/dashboard');
```

#### `requireAdmin(returnUrl?)`
Requires admin role, redirects appropriately if not authorized.

```typescript
const session = await requireAdmin();
// Use in server components and API routes
```

#### `checkAdminRole(user)`
Checks if a user has admin role.

```typescript
const isAdmin = checkAdminRole(user);
```

#### `getUserDisplayName(user)`
Gets user's display name or email.

```typescript
const name = getUserDisplayName(user);
```

### Client-Side Hook

**Location:** `src/hooks/use-auth.ts`

#### `useAuth()`
Main authentication hook for client components.

```typescript
const { user, isLoading, isAdmin, signOut, refreshSession } = useAuth();
```

#### `useRequireAuth(requireAdmin?)`
Hook that automatically redirects if not authenticated/authorized.

```typescript
const { user, isLoading, isAdmin } = useRequireAuth(true);
```

## Route Protection

### Middleware Protection

**Location:** `middleware.ts`

The middleware runs at the edge and protects routes before they're rendered:

```typescript
// Automatically protects all /admin/* routes
// Configured in middleware.ts config.matcher
```

**What it does:**
1. Validates Supabase session
2. Checks admin role
3. Redirects unauthenticated users to login
4. Redirects non-admin users to unauthorized page
5. Preserves return URL for post-login redirect

### Server Component Protection

Use `requireAdmin()` in server components:

```typescript
export default async function AdminPage() {
  const session = await requireAdmin();
  
  // Your page content
  return <div>Protected content</div>;
}
```

### Client Component Protection

Use `AuthGuard` component:

```tsx
export default function ClientPage() {
  return (
    <AuthGuard requireAdmin={true}>
      <YourContent />
    </AuthGuard>
  );
}
```

## Extending the Admin Area

### Adding a New Admin Page

1. **Create the page file:**
```typescript
// src/app/(admin)/admin/new-feature/page.tsx
import { requireAdmin } from '@/src/lib/auth/adminAuth';

export default async function NewFeaturePage() {
  await requireAdmin();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Feature</h1>
      {/* Your content */}
    </div>
  );
}
```

2. **Add navigation item:**
```typescript
// In src/components/admin/Sidebar.tsx
{
  href: '/admin/new-feature',
  label: 'New Feature',
  icon: YourIcon,
}
```

3. **Add metadata:**
```typescript
export const metadata: Metadata = {
  title: 'New Feature | Wild Earth Admin',
  description: 'Description of your feature',
};
```

### Adding API Routes

Protected API routes should use `requireAdmin()`:

```typescript
// src/app/api/admin/your-endpoint/route.ts
import { requireAdmin } from '@/src/lib/auth/adminAuth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await requireAdmin();
  
  // Your API logic
  return NextResponse.json({ data: 'protected' });
}
```

## Configuration

### Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Setting Admin Role

Admin role can be set in Supabase in two ways:

#### 1. User Metadata (Recommended for development)
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

#### 2. App Metadata (Recommended for production)
Use Supabase Auth Hooks or Admin API:
```typescript
// Using Supabase Admin API
const { data, error } = await supabase.auth.admin.updateUserById(
  userId,
  { app_metadata: { role: 'admin' } }
);
```

#### 3. Database Table (Future Enhancement)
Create an `admin_users` table:
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

### Customizing the Layout

Edit `src/app/(admin)/layout.tsx` to customize:
- Sidebar behavior
- Header configuration
- Footer content
- Breadcrumb generation

## Best Practices

### Security

1. **Always use server-side validation** - Never trust client-side checks alone
2. **Use middleware for edge protection** - Fastest way to block unauthorized access
3. **Implement proper RLS policies** - Protect data at the database level
4. **Rotate secrets regularly** - Update Supabase keys periodically
5. **Log security events** - Track authentication attempts and failures

### Performance

1. **Use server components by default** - Only use client components when needed
2. **Implement proper loading states** - Use loading.tsx for better UX
3. **Cache static data** - Use Next.js caching for non-sensitive data
4. **Optimize images** - Use Next.js Image component
5. **Lazy load heavy components** - Use dynamic imports for large components

### Code Organization

1. **Keep components small** - Single responsibility principle
2. **Use TypeScript strictly** - Enable strict mode in tsconfig.json
3. **Document complex logic** - Add comments for authentication flows
4. **Follow naming conventions** - Use consistent naming across the app
5. **Write reusable utilities** - Extract common logic to utility functions

### User Experience

1. **Provide clear feedback** - Show loading and error states
2. **Handle errors gracefully** - Use error boundaries
3. **Implement breadcrumbs** - Help users navigate
4. **Add keyboard shortcuts** - Improve accessibility
5. **Support mobile devices** - Ensure responsive design

## Troubleshooting

### Common Issues

#### "Unauthorized" after login
- Check if user has admin role in metadata
- Verify middleware is running correctly
- Check browser console for errors

#### Session expires too quickly
- Adjust Supabase JWT expiry settings
- Implement token refresh logic
- Check for clock skew issues

#### Middleware not protecting routes
- Verify middleware.ts is in the root directory
- Check config.matcher pattern
- Ensure Supabase env variables are set

#### TypeScript errors
- Run `npm install` to ensure all dependencies are installed
- Check tsconfig.json path aliases
- Verify import paths are correct

## Future Enhancements

- [ ] Implement full Supabase Auth integration
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Create admin roles table in database
- [ ] Add audit logging for admin actions
- [ ] Implement 2FA for admin accounts
- [ ] Add session management dashboard
- [ ] Create admin activity timeline
- [ ] Add dark mode support
- [ ] Implement real-time notifications
- [ ] Add advanced search functionality

## Support

For questions or issues:
1. Check this documentation
2. Review the code comments
3. Check Supabase documentation
4. Contact the development team

---

**Last Updated:** 2024
**Version:** 1.0.0
**Made with ❤️ by Bob**