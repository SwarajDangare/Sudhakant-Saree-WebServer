import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if this is an admin route (excluding login)
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  // Check for session token cookie
  const sessionToken = req.cookies.get('next-auth.session-token') ||
                       req.cookies.get('__Secure-next-auth.session-token');

  // If no session token, redirect to login
  if (!sessionToken) {
    const loginUrl = new URL('/admin/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/dashboard/:path*',
    '/admin/products/:path*',
    '/admin/categories/:path*',
    '/admin/users/:path*',
  ],
};
