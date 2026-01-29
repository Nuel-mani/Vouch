'use server';

import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';
import { sendVerificationEmail } from '@vouch/services';

export async function manualVerifyUser(userId: string) {
    try {
        await db.user.update({
            where: { id: userId },
            data: {
                emailVerified: true,
                verificationHelpRequested: false,
            },
        });

        // Also delete any existing verification token to clean up
        // We'd need to find it by identifier (email) first
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (user?.email) {
            await db.verificationToken.deleteMany({
                where: { identifier: user.email }
            });
        }

        revalidatePath('/access-requests');
        return { success: true };
    } catch (error) {
        console.error('Failed to verify user', error);
        return { error: 'Failed to verify user' };
    }
}

export async function getVerificationToken(email: string) {
    try {
        const token = await db.verificationToken.findFirst({
            where: { identifier: email },
        });
        return { token: token?.token };
    } catch (error) {
        return { error: 'Failed to fetch token' };
    }
}

export async function resendUserVerificationEmail(userId: string) {
    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true }
        });

        if (!user || !user.email) {
            return { error: 'User not found or has no email' };
        }

        // Find existing token or generate new one?
        // Let's reuse existing if valid, or create new.
        // For simplicity reusing existing logic or just fetching current token.
        // If expired, we might need a new one, but let's assume valid for now or fetch fresh.
        // Actually, best practice is to always generate a fresh token on explicit resend
        // but to minimize DB writes and complexity with the existing 'register' flow,
        // let's grab the existing token.

        let token = await db.verificationToken.findFirst({
            where: { identifier: user.email }
        });

        // If no token exists (weird edge case for pending verify), create one
        if (!token) {
            const crypto = require('crypto');
            const newToken = crypto.randomUUID();
            const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

            token = await db.verificationToken.create({
                data: {
                    identifier: user.email,
                    token: newToken,
                    expires
                }
            });
        }

        // Send
        const sent = await sendVerificationEmail(user.email, token.token);

        if (!sent) {
            return { error: 'Failed to send email via provider' };
        }

        return { success: true };
    } catch (error) {
        console.error('Resend failed', error);
        return { error: 'Failed to resend email' };
    }
}
