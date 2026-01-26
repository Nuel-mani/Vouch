'use server';

import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

/**
 * Get the current admin user from the session
 */
async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) return null;

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret),
            { issuer: 'vouch', audience: 'vouch' }
        );

        return {
            userId: payload.userId as string,
            email: payload.email as string,
            role: payload.role as string,
        };
    } catch {
        return null;
    }
}

/**
 * Update system settings
 */
export async function updateSettings(formData: FormData) {
    const user = await getCurrentUser();

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const entries = Array.from(formData.entries());
        const updatedKeys: string[] = [];

        for (const [key, value] of entries) {
            // Handle checkbox values (on/off to true/false)
            const stringValue = value === 'on' ? 'true' : String(value);

            await db.systemSetting.upsert({
                where: { setting_key: key },
                update: {
                    setting_value: stringValue,
                    // updatedBy is not in schema, ignoring for now or could log to audit
                },
                create: {
                    setting_key: key,
                    setting_value: stringValue,
                },
            });

            updatedKeys.push(key);
        }

        // Log the action
        await db.auditLog.create({
            data: {
                userId: user.userId,
                action: 'SETTINGS_UPDATED',
                resource: 'system_settings',
                details: { updatedKeys },
            },
        });

        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error updating settings:', error);
        return { success: false, error: 'Failed to update settings' };
    }
}

/**
 * Clear all audit logs (dangerous action)
 */
export async function clearAuditLogs() {
    const user = await getCurrentUser();

    // Only admin (not staff) can clear logs
    if (!user || user.role !== 'admin') {
        return { success: false, error: 'Unauthorized - Admin only' };
    }

    try {
        const count = await db.auditLog.count();

        await db.auditLog.deleteMany({});

        // Create a new log entry for the clear action
        await db.auditLog.create({
            data: {
                userId: user.userId,
                action: 'AUDIT_LOGS_CLEARED',
                details: { deletedCount: count },
            },
        });

        revalidatePath('/audit-logs');
        revalidatePath('/settings');
        return { success: true, deletedCount: count };
    } catch (error) {
        console.error('Error clearing audit logs:', error);
        return { success: false, error: 'Failed to clear audit logs' };
    }
}

/**
 * Reset platform statistics (recalculate aggregates)
 */
export async function resetPlatformStatistics() {
    const user = await getCurrentUser();

    if (!user || user.role !== 'admin') {
        return { success: false, error: 'Unauthorized - Admin only' };
    }

    try {
        // This would typically trigger a recalculation of cached statistics
        // For now, we just log the action
        await db.auditLog.create({
            data: {
                userId: user.userId,
                action: 'PLATFORM_STATS_RESET',
                details: { requestedAt: new Date().toISOString() },
            },
        });

        revalidatePath('/dashboard');
        revalidatePath('/settings');
        return { success: true };
    } catch (error) {
        console.error('Error resetting statistics:', error);
        return { success: false, error: 'Failed to reset statistics' };
    }
}
