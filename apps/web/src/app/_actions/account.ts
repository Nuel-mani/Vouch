'use server';

import { cookies } from 'next/headers';
import { validateSession, signToken, signRefreshToken } from '@vouch/auth';
import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

/**
 * Creates a personal account linked to the current business account.
 * Requires an 8-digit numeric PIN.
 */
export async function createPersonalAccount(pin: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    // Validation
    if (!pin || !/^\d{8}$/.test(pin)) {
        return { success: false, error: 'PIN must be exactly 8 digits' };
    }

    try {
        // Fetch full user to get details for cloning/linking
        const businessUser = await db.user.findUnique({
            where: { id: user.id },
        });

        if (!businessUser) {
            return { success: false, error: 'User not found' };
        }

        const bUser: any = businessUser;

        // IDEMPOTENCY CHECK 1: Already properly linked?
        if (bUser.linkedUserId) {
            // Check if the linked user actually exists
            const linkedUser = await db.user.findUnique({ where: { id: bUser.linkedUserId } });
            if (linkedUser) {
                // Update the PIN just in case they forgot it and are re-enrolling
                const pinHash = await bcrypt.hash(pin, 10);
                await db.user.update({
                    where: { id: businessUser.id },
                    data: { switchPinHash: pinHash } as any
                });
                await db.user.update({
                    where: { id: linkedUser.id },
                    data: { switchPinHash: pinHash } as any
                });

                return { success: true, message: 'Account already linked. PIN updated.', recovered: true };
            }
            // If linked user ID exists but user doesn't, we have a zombie link. Fall through to re-create/repair.
        }

        // Only allow for Sole Proprietorship or single-owner LLC/Ltd
        const allowedStructures = [
            'Sole Proprietorship',
            'LLC (Limited Liability Company)',
            'Private Limited Company (Ltd)'
        ];

        if (!allowedStructures.includes(businessUser.businessStructure || '')) {
            return { success: false, error: 'Business structure not eligible for dual account' };
        }

        // Hash PIN
        const pinHash = await bcrypt.hash(pin, 10);
        const personalEmail = `personal+${businessUser.email}`;

        // IDEMPOTENCY CHECK 2: Personal Account exists but not linked? (Dangling)
        let personalUser = await db.user.findUnique({
            where: { email: personalEmail }
        });

        if (personalUser) {
            // Repair the link
            await db.user.update({
                where: { id: personalUser.id },
                data: {
                    linkedUserId: businessUser.id,
                    switchPinHash: pinHash,
                    // Ensure these are synced
                    nin: businessUser.nin,
                    bvn: businessUser.bvn,
                } as any
            });
        } else {
            // Create Personal User
            personalUser = await db.user.create({
                data: {
                    email: personalEmail,
                    passwordHash: businessUser.passwordHash,
                    role: 'user',
                    accountType: 'personal',
                    businessName: businessUser.businessName,
                    countryCode: businessUser.countryCode,
                    currencySymbol: businessUser.currencySymbol,
                    sector: 'Personal',
                    phoneNumber: businessUser.phoneNumber,
                    nin: businessUser.nin,
                    bvn: businessUser.bvn,
                    taxIdentityNumber: businessUser.taxIdentityNumber,
                    linkedUserId: businessUser.id,
                    switchPinHash: pinHash,
                    onboardingCompleted: true,
                    emailVerified: true,
                } as any
            });
        }

        // Link Business -> Personal
        await db.user.update({
            where: { id: businessUser.id },
            data: {
                linkedUserId: personalUser.id,
                switchPinHash: pinHash
            } as any
        });

        revalidatePath('/settings/branding');
        return { success: true, recovered: !!personalUser };

    } catch (error: any) {
        console.error('Create Personal Account Error:', error);
        return { success: false, error: error.message || 'Failed to create personal account' };
    }
}

/**
 * Switches the current session to the linked account.
 * Requires valid 8-digit PIN.
 */
export async function switchAccount(pin: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const currentUser = await db.user.findUnique({
            where: { id: user.id },
        });

        if (!currentUser) return { success: false, error: 'User not found' };

        const cUser: any = currentUser;

        if (!cUser.linkedUserId || !cUser.switchPinHash) {
            return { success: false, error: 'No linked account found' };
        }

        // Verify PIN
        const isValid = await bcrypt.compare(pin, cUser.switchPinHash);
        if (!isValid) {
            return { success: false, error: 'Invalid PIN' };
        }

        // Get target user to generate token
        const targetUser = await db.user.findUnique({
            where: { id: cUser.linkedUserId }
        });

        if (!targetUser) {
            return { success: false, error: 'Linked account not found' };
        }

        // Create new session tokens
        const accessToken = await signToken({
            userId: targetUser.id,
            email: targetUser.email || '',
            role: targetUser.role,
        });

        const refreshToken = await signRefreshToken(targetUser.id);

        // Store refresh token
        await db.refreshToken.create({
            data: {
                userId: targetUser.id,
                token: refreshToken,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            }
        });

        // Set Cookies
        cookieStore.set('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        cookieStore.set('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return { success: true };

    } catch (error: any) {
        console.error('Switch Account Error:', error);
        return { success: false, error: 'Failed to switch account' };
    }
}
