import { NextRequest, NextResponse } from 'next/server';
import { logout, clearAuthCookies, verifyToken } from '@vouch/auth';

export async function POST(request: NextRequest) {
    try {
        const accessToken = request.cookies.get('access_token')?.value;
        const refreshToken = request.cookies.get('refresh_token')?.value;

        if (accessToken) {
            const payload = await verifyToken(accessToken);
            if (payload && refreshToken) {
                await logout(refreshToken, payload.userId);
            }
        }

        // Clear cookies and redirect
        const response = NextResponse.json({ success: true });
        return clearAuthCookies(response);
    } catch (error) {
        console.error('Logout error:', error);
        // Still clear cookies even on error
        const response = NextResponse.json({ success: true });
        return clearAuthCookies(response);
    }
}
