import { NextRequest, NextResponse } from 'next/server';
import { login, AuthError, setAuthCookies } from '@vouch/auth';
import { db } from '@vouch/db';

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

        // CRITICAL: Verify user has admin or staff role
        if (result.user.role !== 'admin' && result.user.role !== 'staff') {
            // Log the unauthorized access attempt
            await db.auditLog.create({
                data: {
                    userId: result.user.id,
                    action: 'ADMIN_ACCESS_DENIED',
                    details: { reason: 'insufficient_role', role: result.user.role },
                    ipAddress,
                    userAgent,
                },
            });

            return NextResponse.json(
                { error: 'Access denied. Admin or staff privileges required.' },
                { status: 403 }
            );
        }

        // Log successful admin login
        await db.auditLog.create({
            data: {
                userId: result.user.id,
                action: 'ADMIN_LOGIN_SUCCESS',
                ipAddress,
                userAgent,
            },
        });

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

        console.error('Admin login error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
