'use server';

import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';
import { getAdminUser } from '../../../lib/permissions';

/**
 * Update a user's role
 */
export async function updateUserRole(userId: string, newRole: 'user' | 'staff' | 'admin') {
    const admin = await getAdminUser();

    if (!admin || admin.role !== 'admin') {
        return { success: false, error: 'Only admins can change user roles' };
    }

    try {
        await db.user.update({
            where: { id: userId },
            data: { role: newRole },
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'USER_ROLE_UPDATED',
                resource: 'user',
                resourceId: userId,
                details: { newRole },
            },
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating user role:', error);
        return { success: false, error: 'Failed to update user role' };
    }
}

/**
 * Update a user's subscription tier
 */
export async function updateSubscriptionTier(userId: string, tier: string) {
    const admin = await getAdminUser();

    if (!admin || (admin.role !== 'admin' && admin.role !== 'staff')) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await db.user.update({
            where: { id: userId },
            data: { subscriptionTier: tier },
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'SUBSCRIPTION_TIER_UPDATED',
                resource: 'user',
                resourceId: userId,
                details: { newTier: tier },
            },
        });

        revalidatePath('/users');
        revalidatePath('/subscriptions');
        return { success: true };
    } catch (error) {
        console.error('Error updating subscription tier:', error);
        return { success: false, error: 'Failed to update subscription tier' };
    }
}

/**
 * Suspend a user account
 */
export async function suspendUser(userId: string) {
    const admin = await getAdminUser();

    if (!admin || (admin.role !== 'admin' && admin.role !== 'staff')) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // In a real implementation, you'd have a 'suspended' field on the User model
        // For now, we'll log the action
        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'USER_SUSPENDED',
                resource: 'user',
                resourceId: userId,
            },
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Error suspending user:', error);
        return { success: false, error: 'Failed to suspend user' };
    }
}

/**
 * Delete a user account (dangerous)
 */
export async function deleteUser(userId: string) {
    const admin = await getAdminUser();

    // Only full admins can delete users
    if (!admin || admin.role !== 'admin') {
        return { success: false, error: 'Only admins can delete users' };
    }

    try {
        // Get user info for audit before deletion
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });

        await db.user.delete({
            where: { id: userId },
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'USER_DELETED',
                resource: 'user',
                resourceId: userId,
                details: { deletedEmail: user?.email },
            },
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}
