import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, type TokenPayload } from './jwt';

export type AuthenticatedRequest = NextRequest & {
    user: TokenPayload;
};

/**
 * Extract token from request (cookie or header)
 */
function getTokenFromRequest(request: NextRequest): string | null {
    // Try cookie first
    const cookieToken = request.cookies.get('access_token')?.value;
    if (cookieToken) {
        return cookieToken;
    }

    // Try Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(
    request: NextRequest
): Promise<{ user: TokenPayload } | NextResponse> {
    const token = getTokenFromRequest(request);

    if (!token) {
        return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
        );
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return NextResponse.json(
            { error: 'Invalid or expired token' },
            { status: 401 }
        );
    }

    return { user: payload };
}

/**
 * Middleware to require specific roles
 */
export async function requireRole(
    request: NextRequest,
    allowedRoles: Array<'user' | 'staff' | 'admin'>
): Promise<{ user: TokenPayload } | NextResponse> {
    const result = await requireAuth(request);

    if (result instanceof NextResponse) {
        return result;
    }

    if (!allowedRoles.includes(result.user.role)) {
        return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
        );
    }

    return result;
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(
    request: NextRequest
): Promise<{ user: TokenPayload } | NextResponse> {
    return requireRole(request, ['admin']);
}

/**
 * Middleware to require staff or admin role
 */
export async function requireStaff(
    request: NextRequest
): Promise<{ user: TokenPayload } | NextResponse> {
    return requireRole(request, ['staff', 'admin']);
}

/**
 * Helper to set auth cookies
 */
export function setAuthCookies(
    response: NextResponse,
    accessToken: string,
    refreshToken: string
): NextResponse {
    // Access token - 7 days, httpOnly
    response.cookies.set('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
    });

    // Refresh token - 30 days, httpOnly
    response.cookies.set('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
    });

    return response;
}

/**
 * Helper to clear auth cookies
 */
export function clearAuthCookies(response: NextResponse): NextResponse {
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    return response;
}
