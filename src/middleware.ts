import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookieHeader } from '@/utils/auth';

// Gates the entire /bruh area:
// - /bruh/admin/* requires an authenticated session AND isAdmin
// - Everything else under /bruh/* + /api/bruh/* requires any valid session
// - Public exceptions: the login page routes, the mobile-app beacon, and the
//   onboarding endpoint (which is what actually creates the first login)
export const config = {
    matcher: [
        '/bruh/:path*',
        '/api/bruh/:path*',
    ],
};

// Paths that must remain reachable without a session — the login/onboarding surface
// itself, plus the mobile-app beacon which has no session concept.
function isPublicPath(pathname: string): boolean {
    // The /bruh landing page renders login OR onboarding when unauth. Same for
    // the admin login page and the forgot/reset password flow.
    if (pathname === '/bruh') return true;
    if (pathname === '/bruh/admin') return true;
    if (pathname === '/bruh/admin/logout') return true;
    if (pathname === '/bruh/admin/forgot-password') return true;
    if (pathname.startsWith('/bruh/admin/reset-password/')) return true;

    // Auth API surface — login, logout, forgot/reset password, onboarding.
    if (pathname.startsWith('/api/bruh/auth/')) return true;

    // Mobile-app beacon. Has no session; authenticated by device_id UUID + upsert.
    if (pathname === '/api/bruh/devices/location-add') return true;

    return false;
}

export async function middleware(req: NextRequest) {
    const { pathname, search } = req.nextUrl;

    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    const session = await getSessionFromCookieHeader(req.headers.get('cookie') ?? undefined);

    // Admin surface — must be authenticated AND have isAdmin.
    const isAdminSurface =
        pathname.startsWith('/bruh/admin/') || pathname.startsWith('/api/bruh/admin/');
    if (isAdminSurface) {
        if (session && session.isAdmin) {
            return NextResponse.next();
        }
        // Non-admin authenticated users get bounced to the admin login too — the login
        // endpoint accepts the same JWT and lets them retry with different credentials.
        // API routes return 401 instead of a redirect.
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const loginUrl = new URL('/bruh/admin', req.nextUrl.origin);
        loginUrl.searchParams.set('next', pathname + search);
        return NextResponse.redirect(loginUrl);
    }

    // Non-admin /bruh surface — any authenticated session is fine.
    if (session) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Bounce unauth page requests to the shared /bruh login/onboarding page.
    const loginUrl = new URL('/bruh', req.nextUrl.origin);
    loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl);
}
