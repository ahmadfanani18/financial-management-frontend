import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/accounts', '/transactions', '/categories', '/budgets', '/goals', '/plans', '/reports', '/notifications', '/settings'];

const adminRoutes = '/dashboard/admin';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || request.headers.get('x-token');
  const pathname = request.nextUrl.pathname;

  if (!token && (protectedRoutes.includes(pathname) || pathname.startsWith(adminRoutes))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/accounts', '/transactions', '/categories', '/budgets', '/goals', '/plans', '/reports', '/notifications', '/settings'],
};