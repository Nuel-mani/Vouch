import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies } from '@vouch/auth';
import { db } from '@vouch/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        let userId: string | undefined;

        // Verify token to get user ID for audit log
        if (token) {
            try {
                const secret = process.env.JWT_SECRET;
                if (secret) {
                    const { payload } = await jwtVerify(
                        token,
                        new TextEncoder().encode(secret),
                        { issuer: 'vouch', audience: 'vouch' }
                    );
                    userId = payload.userId as string;
                }
            } catch {
                // Token invalid, continue with logout anyway
            }
        }

        // Log the logout
        if (userId) {
            await db.auditLog.create({
                data: {
                    userId,
                    action: 'ADMIN_LOGOUT',
                },
            });

            // Delete refresh token from database
            const refreshToken = cookieStore.get('refresh_token')?.value;
            if (refreshToken) {
                try {
                    await db.refreshToken.delete({
                        where: { token: refreshToken },
                    });
                } catch {
                    // Token might not exist, ignore
                }
            }
        }

        // Clear cookies and redirect
        const response = NextResponse.json({ success: true });
        return clearAuthCookies(response);
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear cookies even if there's an error
        const response = NextResponse.json({ success: true });
        return clearAuthCookies(response);
    }
}
