'use server';

import { db } from '@vouch/db';
import { getAdminUser } from '../../lib/permissions';
import { signToken } from '@vouch/auth';

/**
 * Impersonate a user
 * Generates a short-lived token for the web app
 */
export async function impersonateUser(userId: string) {
    const admin = await getAdminUser();

    // Strict Role Check: Only Admin and Staff can impersonate
    if (!admin || (admin.role !== 'admin' && admin.role !== 'staff')) {
        return { success: false, error: 'Unauthorized: Insufficient permissions' };
    }

    try {
        // 1. Verify target user exists
        const targetUser = await db.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true }
        });

        if (!targetUser) {
            return { success: false, error: 'User not found' };
        }

        // 2. Log Audit Event (CRITICAL)
        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'ADMIN_IMPERSONATE_USER',
                resource: 'user',
                resourceId: targetUser.id,
                details: {
                    targetEmail: targetUser.email,
                    adminEmail: admin.email,
                    reason: 'Support investigation'
                },
                // Use the admin's IP if available, passed via context in a real app
            },
        });

        // 3. Generate Impersonation Token
        // We sign it with the shared JWT_SECRET.
        // The payload must match what apps/web expects in `validateSession` or middleware.
        const token = await signToken({
            userId: targetUser.id,
            email: targetUser.email || '',
            role: 'user', // Force user role to avoid elevating privelages if they were admin
            impersonatedBy: admin.userId // Traceability claim
        });

        // 4. Construct Redirect URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirectUrl = `${appUrl}/api/auth/impersonate?token=${token}`;

        return { success: true, url: redirectUrl };
    } catch (error: any) {
        console.error('Error in impersonation:', error);
        return { success: false, error: error?.message || 'Impersonation failed' };
    }
}
