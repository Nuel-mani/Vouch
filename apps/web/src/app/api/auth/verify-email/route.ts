import { NextRequest, NextResponse } from 'next/server';
import { db } from '@vouch/db';
import { signToken, signRefreshToken, setAuthCookies } from '@vouch/auth';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    try {
        // Find token
        const verificationToken = await db.verificationToken.findUnique({
            where: { token },
        });

        if (!verificationToken) {
            return NextResponse.json({ error: 'Invalid or used token' }, { status: 400 });
        }

        // Check expiration
        if (verificationToken.expires < new Date()) {
            // Delete expired token
            await db.verificationToken.delete({
                where: { token },
            });
            return NextResponse.json({ error: 'Token has expired' }, { status: 400 });
        }

        // Find the user
        const user = await db.user.findUnique({
            where: { email: verificationToken.identifier },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 400 });
        }

        // Verify user and reset help request status
        await db.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verificationHelpRequested: false
            },
        });

        // Delete token
        await db.verificationToken.delete({
            where: { token },
        });

        // Generate auth tokens for auto-login
        const accessToken = await signToken({
            userId: user.id,
            email: user.email!,
            role: user.role as 'user' | 'staff' | 'admin',
        });
        const refreshToken = await signRefreshToken(user.id);

        // Create response with cookies
        const response = NextResponse.json({
            success: true,
            verified: true,
            autoLoggedIn: true
        });

        // Set auth cookies
        return setAuthCookies(response, accessToken, refreshToken);
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
