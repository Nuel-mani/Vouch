import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';

// Onboarding API - Updates Vouch ID after onboarding

export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const user = await validateSession(token);
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const formData = await request.formData();

        const accountType = formData.get('accountType') as string;
        const businessName = formData.get('businessName') as string;
        const sector = formData.get('sector') as string;
        const turnoverBand = formData.get('turnoverBand') as string;
        const tinNumber = formData.get('tinNumber') as string;

        // Determine tax exemptions based on turnover
        const isCitExempt = ['micro', 'small_lower', 'small_upper'].includes(turnoverBand);
        const isVatExempt = ['micro', 'small_lower'].includes(turnoverBand);

        // Update Vouch ID
        await db.user.update({
            where: { id: user.id },
            data: {
                accountType: accountType || 'personal',
                businessName: businessName || null,
                sector: sector || null,
                turnoverBand: turnoverBand || 'micro',
                taxIdentityNumber: tinNumber || null,
                isCitExempt,
                isVatExempt,
            },
        });

        // Log the onboarding
        await db.auditLog.create({
            data: {
                userId: user.id,
                action: 'onboarding_completed',
                resource: 'user',
                resourceId: user.id,
                details: {
                    accountType,
                    sector,
                    turnoverBand,
                },
            },
        });

        // Redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
        console.error('Onboarding error:', error);
        return NextResponse.redirect(new URL('/onboarding?error=failed', request.url));
    }
}
