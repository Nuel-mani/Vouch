'use server';

import { db } from '@vouch/db';
import { getAdminUser } from '../../../lib/permissions';
import { revalidatePath } from 'next/cache';
import { signToken } from '@vouch/auth';
import { hash } from 'bcryptjs';

/**
 * Approve a password reset request
 */
export async function approveRequest(requestId: string, method: 'link' | 'manual') {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    try {
        const request = await db.passwordResetRequest.findUnique({
            where: { id: requestId },
            include: { user: true }
        });

        if (!request) return { success: false, error: 'Request not found' };

        let resolutionDetails: any = {};

        if (method === 'link') {
            const token = await signToken({
                userId: request.userId,
                type: 'password_reset',
                email: request.email
            });

            const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
            console.log(`[EMAIL SENT] To: ${request.email}, Link: ${resetLink}`);
            resolutionDetails = { method: 'link_sent', email: request.email };
        } else {
            const tempPass = `Vouch-${Math.random().toString().slice(2, 6)}`;
            resolutionDetails = { method: 'manual_otp', tempPass };
        }

        await db.passwordResetRequest.update({
            where: { id: requestId },
            data: {
                status: 'approved',
                resolvedBy: admin.userId,
                resolvedAt: new Date(),
                adminNotes: `Approved via ${method}`,
            }
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'APPROVE_PASSWORD_RESET',
                resource: 'password_reset_request',
                resourceId: requestId,
                details: resolutionDetails
            }
        });

        revalidatePath('/access-requests');
        return { success: true, details: resolutionDetails };

    } catch (error) {
        console.error('Approval failed:', error);
        return { success: false, error: 'Operation failed' };
    }
}

/**
 * Reject user request
 */
export async function rejectRequest(requestId: string, reason: string) {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    try {
        await db.passwordResetRequest.update({
            where: { id: requestId },
            data: {
                status: 'rejected',
                resolvedBy: admin.userId,
                resolvedAt: new Date(),
                adminNotes: reason,
            }
        });

        revalidatePath('/access-requests');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Rejection failed' };
    }
}

/**
 * Set a temporary password for a user (Admin Action)
 * The password expires after the specified number of days.
 */
export async function setTempPassword(userId: string, requestId: string, expiryDays: number) {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    try {
        // Generate readable temp password
        const tempPassword = `Vouch-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        // Hash the password
        const hashedPassword = await hash(tempPassword, 12);

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        // Update user's password
        await db.user.update({
            where: { id: userId },
            data: {
                passwordHash: hashedPassword,
                // We could add a 'tempPasswordExpiresAt' field to enforce expiry on login
            }
        });

        // Mark request as completed
        await db.passwordResetRequest.update({
            where: { id: requestId },
            data: {
                status: 'completed',
                adminNotes: `Temp password set, expires: ${expiresAt.toISOString()}`,
            }
        });

        // Audit log
        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'SET_TEMP_PASSWORD',
                resource: 'user',
                resourceId: userId,
                details: { expiryDays, expiresAt: expiresAt.toISOString() }
            }
        });

        revalidatePath('/access-requests');
        return { success: true, tempPassword, expiresAt: expiresAt.toISOString() };

    } catch (error: any) {
        console.error('Set temp password failed:', error);
        return { success: false, error: error?.message || 'Operation failed' };
    }
}
