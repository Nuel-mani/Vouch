import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that require admin authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/users',
    '/subscriptions',
    '/compliance',
    '/integrations',
    '/audit-logs',
    '/settings',
];

// Routes for unauthenticated admins only
const AUTH_ROUTES = ['/login'];

/**
 * Verify JWT token and check admin role in Edge runtime
 */
async function verifyAdminToken(token: string): Promise<{
    valid: boolean;
    role?: string;
    userId?: string;
    email?: string;
}> {
    try {
        const secret = process.env.JWT_SECRET;

        if (!secret) {
            console.error('[Admin Middleware] JWT_SECRET is NOT set!');
            return { valid: false };
        }

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret),
            {
                issuer: 'vouch',
                audience: 'vouch',
            }
        );

        return {
            valid: true,
            role: payload.role as string,
            userId: payload.userId as string,
            email: payload.email as string,
        };
    } catch (error) {
        console.error('[Admin Middleware] Token verification failed:', error);
        return { valid: false };
    }
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip API routes, static files, etc.
    if (
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    // Check if path is protected or auth route
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));

    // Neither protected nor auth route - allow
    if (!isProtectedRoute && !isAuthRoute) {
        return NextResponse.next();
    }

    // Get token from cookie
    const token = request.cookies.get('access_token')?.value;

    // Validate token and get role
    const verification = token ? await verifyAdminToken(token) : { valid: false };

    console.log(`[Admin Middleware] Path: ${pathname}, Token: ${!!token}, Valid: ${verification.valid}, Role: ${verification.role}`);

    // Redirect logic for protected routes
    if (isProtectedRoute) {
        if (!verification.valid) {
            // No valid token - redirect to login
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('from', pathname);
            console.log('[Admin Middleware] No valid token, redirecting to login');
            return NextResponse.redirect(loginUrl);
        }

        // Valid token but not admin or staff role
        if (verification.role !== 'admin' && verification.role !== 'staff') {
            console.log('[Admin Middleware] User role is not admin/staff, access denied');
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('error', 'access_denied');
            return NextResponse.redirect(loginUrl);
        }

        // Valid admin/staff token - allow and pass user info in headers
        const response = NextResponse.next();
        response.headers.set('x-user-id', verification.userId || '');
        response.headers.set('x-user-email', verification.email || '');
        response.headers.set('x-user-role', verification.role || '');
        return response;
    }

    // Redirect logic for auth routes (login page)
    if (isAuthRoute && verification.valid) {
        if (verification.role === 'admin' || verification.role === 'staff') {
            // Already authenticated as admin/staff - redirect to dashboard
            console.log('[Admin Middleware] Already authenticated, redirecting to dashboard');
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - api routes
         * - static files
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
