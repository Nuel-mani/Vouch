import { NextRequest, NextResponse } from 'next/server';
import { register, AuthError } from '@vouch/auth';
import { db } from '@vouch/db';
import { sendVerificationEmail } from '@vouch/services';
import crypto from 'crypto';

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

        // Generate verification token
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store verification token
        await db.verificationToken.create({
            data: {
                identifier: result.user.email!,
                token,
                expires,
            },
        });

        // Send verification email (don't block registration if email fails)
        try {
            const emailSent = await sendVerificationEmail(result.user.email!, token);
            if (!emailSent) {
                console.warn('Failed to send verification email to:', result.user.email);
            } else {
                console.log('Verification email sent to:', result.user.email);
            }
        } catch (emailError) {
            console.error('Error sending verification email:', emailError);
        }

        // Return user data but DO NOT set auth cookies
        // Frontend will detect requiresVerification and show success screen
        return NextResponse.json({
            success: true,
            requiresVerification: true,
            email: result.user.email,
        });
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
