/**
 * Next.js Middleware for Route Protection
 * Handles authentication and authorization at the edge
 */

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware function to protect routes
 * Runs on every request matching the config matcher
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession();

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    // If no session, redirect to login with return URL
    if (!session || error) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    const isAdmin = checkAdminRole(session.user);
    
    if (!isAdmin) {
      // Redirect non-admin users to unauthorized page
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Allow the request to proceed
  return response;
}

/**
 * Check if user has admin role
 * @param user - Supabase user object
 * @returns True if user is admin
 */
function checkAdminRole(user: any): boolean {
  if (!user) return false;

  // Check app_metadata first (set by Supabase Auth)
  if (user.app_metadata?.role === 'admin') {
    return true;
  }

  // Fallback to user_metadata
  if (user.user_metadata?.role === 'admin') {
    return true;
  }

  return false;
}

/**
 * Middleware configuration
 * Specify which routes should be protected
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't need protection
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

// Made with Bob