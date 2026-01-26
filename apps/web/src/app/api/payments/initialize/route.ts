import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import crypto from 'crypto';

// Paystack Payment Integration

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackHeaders {
    Authorization: string;
    'Content-Type': string;
}

// function getHeaders(): PaystackHeaders {
function getHeaders(): HeadersInit {
    return {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    };
}

// Initialize a payment transaction
export async function POST(request: NextRequest) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await validateSession(token);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!PAYSTACK_SECRET_KEY) {
        return NextResponse.json(
            { error: 'Payment gateway not configured' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();
        const { amount, plan, email, metadata } = body;

        // Fetch user details
        const fullUser = await db.user.findUnique({
            where: { id: user.id },
            select: { email: true },
        });

        const customerEmail = email || fullUser?.email;

        if (!amount || !customerEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Generate unique reference
        const reference = `OPCORE-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

        // Initialize transaction with Paystack
        const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                email: customerEmail,
                amount: amount * 100, // Paystack uses kobo
                currency: 'NGN',
                reference,
                callback_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payments/callback`,
                metadata: {
                    userId: user.id,
                    plan: plan || null,
                    custom_fields: [
                        {
                            display_name: 'User ID',
                            variable_name: 'user_id',
                            value: user.id,
                        },
                    ],
                    ...metadata,
                },
            }),
        });

        const data = await response.json();

        if (!data.status) {
            console.error('Paystack error:', data);
            return NextResponse.json(
                { error: data.message || 'Payment initialization failed' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference: data.data.reference,
        });
    } catch (error) {
        console.error('Payment initialization error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize payment' },
            { status: 500 }
        );
    }
}
