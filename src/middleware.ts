import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookieHeader } from '@/utils/auth';

// Protects everything under /bruh/admin/* EXCEPT the /bruh/admin login/dashboard root.
// Unauthenticated requests get redirected to /bruh/admin?next=<original-path>.
export const config = {
    matcher: [
        // All admin routes and admin API routes, but see the early-return below for the root.
        '/bruh/admin/:path*',
        '/api/bruh/admin/:path*',
    ],
};

export async function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    // Allow the login/dashboard root, forgot/reset flow, and logout to pass through unauth'd.
    if (
        pathname === '/bruh/admin' ||
        pathname === '/bruh/admin/logout' ||
        pathname === '/bruh/admin/forgot-password' ||
        pathname.startsWith('/bruh/admin/reset-password/')
    ) {
        return NextResponse.next();
    }

    const session = await getSessionFromCookieHeader(req.headers.get('cookie') ?? undefined);
    if (session) {
        return NextResponse.next();
    }

    // API routes: return 401 JSON instead of redirecting.
    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Page routes: redirect to /bruh/admin?next=<original>
    const next = pathname + search;
    const loginUrl = new URL('/bruh/admin', req.nextUrl.origin);
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
}
