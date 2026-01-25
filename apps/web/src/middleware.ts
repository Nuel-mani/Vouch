import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/transactions',
    '/invoices',
    '/analytics',
    '/tax-engine',
    '/optimizer',
    '/settings',
    '/profile',
    '/onboarding',
];

// Routes for unauthenticated users only
const AUTH_ROUTES = ['/login', '/register', '/forgot-password'];

// JWT secret for Edge runtime (must be TextEncoder for jose)
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET || 'development-secret-change-in-production';
    return new TextEncoder().encode(secret);
};

async function verifyTokenEdge(token: string): Promise<boolean> {
    try {
        const secret = process.env.JWT_SECRET;
        console.log('[Middleware] JWT_SECRET available:', !!secret, 'Length:', secret?.length || 0);

        if (!secret) {
            console.error('[Middleware] JWT_SECRET is NOT set in middleware environment!');
            return false;
        }

        await jwtVerify(token, new TextEncoder().encode(secret), {
            issuer: 'vouch',
            audience: 'vouch',
        });
        return true;
    } catch (error) {
        console.error('[Middleware] Token verification failed:', error);
        return false;
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

    // Validate token
    const isValidToken = token ? await verifyTokenEdge(token) : false;

    console.log(`[Middleware] Path: ${pathname}, Token exists: ${!!token}, Valid: ${isValidToken}`);

    // Redirect logic
    if (isProtectedRoute && !isValidToken) {
        // Not authenticated - redirect to login with return URL
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        console.log('[Middleware] Redirecting to login:', loginUrl.toString());
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && isValidToken) {
        // Already authenticated - redirect to dashboard
        console.log('[Middleware] Already authenticated, redirecting to dashboard');
        return NextResponse.redirect(new URL('/dashboard', request.url));
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
