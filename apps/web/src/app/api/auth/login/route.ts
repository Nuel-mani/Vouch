import { NextRequest, NextResponse } from 'next/server';
import { login, AuthError, setAuthCookies } from '@vouch/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get client info for audit
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
        const userAgent = request.headers.get('user-agent') || undefined;

        // Attempt login
        const result = await login(email, password, ipAddress, userAgent);

        // Create response with user data
        const response = NextResponse.json({
            success: true,
            user: result.user,
        });

        // Set auth cookies
        return setAuthCookies(response, result.accessToken, result.refreshToken);
    } catch (error) {
        if (error instanceof AuthError) {
            return NextResponse.json(
                { error: error.message },
                { status: 401 }
            );
        }

        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
