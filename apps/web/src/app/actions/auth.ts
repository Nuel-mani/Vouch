'use server';

import { db } from '@vouch/db';
import { sendVerificationEmail } from '@vouch/services';

export async function requestVerificationHelp(email: string) {
    if (!email) return { error: 'Email is required' };

    try {
        await db.user.update({
            where: { email },
            data: { verificationHelpRequested: true },
        });

        return { success: true };
    } catch (error) {
        console.error('Failed to request verification help', error);
        return { error: 'Failed to request help' };
    }
}
