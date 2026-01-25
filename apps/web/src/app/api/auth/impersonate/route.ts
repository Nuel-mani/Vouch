import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, validateSession } from '@vouch/auth';
import { db } from '@vouch/db';

/**
 * Token Exchange Endpoint
 * Receives an impersonation token from the admin app and starts a user session
 */
export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    try {
        // 1. Verify the token using the SHARED secret
        const payload = await verifyToken(token);

        if (!payload) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
        }

        // 2. Security Check: Ensure this is an impersonation token
        if (!payload.impersonatedBy) {
            return NextResponse.json({ error: 'Invalid token type' }, { status: 403 });
        }

        // 3. Verify user still exists and isn't suspended (optional extra check)
        const user = await db.user.findUnique({
            where: { id: payload.userId as string },
            select: { id: true, email: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 4. Set the session cookie
        // In a real production app, we might want to issue a new "session" token
        // here that is distinct from the short-lived exchange token.
        // For simplicity, we'll set the token we received as it's valid for 5m.
        // BETTER: Re-sign a standard session token with standard expiry.

        // Let's re-sign to give them a standard session length (e.g. 7 days or 1 hour)
        // BUT strictly maintain the 'impersonatedBy' claim for traceability.
        const { signToken } = await import('@vouch/auth');
        const sessionToken = await signToken({
            userId: user.id,
            email: user.email || '',
            role: 'user', // Force user role
            impersonatedBy: payload.impersonatedBy
        });

        const cookieStore = await cookies();
        cookieStore.set('access_token', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 1 day
        });

        // 5. Redirect to Dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));

    } catch (error: any) {
        console.error('Impersonation exchange failed:', error);
        return NextResponse.json({ error: error?.message || 'Exchange failed' }, { status: 500 });
    }
}
