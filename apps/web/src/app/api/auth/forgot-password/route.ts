import { NextRequest, NextResponse } from 'next/server';
import { db } from '@vouch/db';
import { UAParser } from 'ua-parser-js';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // 1. Verify user exists
        const user = await db.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            select: { id: true, email: true }
        });

        if (!user) {
            // Security: Don't reveal if user exists
            // Mimic success delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            return NextResponse.json({ success: true });
        }

        // 2. Check for existing pending requests from this user (Rate limiting)
        const pendingRequest = await db.passwordResetRequest.findFirst({
            where: {
                userId: user.id,
                status: 'pending',
                // Optional: Created within last 24h?
            }
        });

        if (pendingRequest) {
            return NextResponse.json({ success: true, message: 'Request already pending' });
        }

        // 3. Create Request
        const userAgent = request.headers.get('user-agent') || '';
        const ip = request.headers.get('x-forwarded-for') || 'unknown';

        await db.passwordResetRequest.create({
            data: {
                userId: user.id,
                email: user.email,
                status: 'pending',
                userAgent,
                ipAddress: ip,
            }
        });

        // 4. (Future) Alert Admin via Email/Slack

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Password recovery request failed:', error);
        return NextResponse.json({ error: 'Request processing failed' }, { status: 500 });
    }
}
