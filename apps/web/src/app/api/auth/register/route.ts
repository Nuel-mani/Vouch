import { NextRequest, NextResponse } from 'next/server';
import { register, AuthError, setAuthCookies } from '@vouch/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            email,
            password,
            businessName,
            accountType,
            businessStructure,
            turnoverBand,
            sector,
            taxIdentityNumber,
            phoneNumber,
            businessAddress,
            rentAmount,
            paysRent,
            annualIncome,
            isVatExempt,
            isTaxExempt
        } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get client info for audit
        const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;

        // Attempt registration
        const result = await register(
            email,
            password,
            {
                businessName,
                accountType: accountType || 'personal',
                businessStructure,
                turnoverBand,
                sector,
                taxIdentityNumber,
                businessAddress,
                phoneNumber,
                rentAmount: rentAmount ? Number(rentAmount) : undefined,
                paysRent: !!paysRent,
                annualIncome: annualIncome ? Number(annualIncome) : undefined,
                isVatExempt,
                isTaxExempt
            },
            ipAddress
        );

        // Create response with user data
        const response = NextResponse.json({
            success: true,
            user: result.user,
        });

        // Set auth cookies
        return setAuthCookies(response, result.accessToken, result.refreshToken);
    } catch (error) {
        if (error instanceof AuthError) {
            const status = error.code === 'USER_EXISTS' ? 409 : 400;
            return NextResponse.json(
                { error: error.message },
                { status }
            );
        }

        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
