'use server';

import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';
import { getAdminUser } from '../../../lib/permissions';
import { sendAdminAlert } from '../../../lib/notifications';
import bcrypt from 'bcryptjs';

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

        await sendAdminAlert(`User Deleted: ${userId}`, {
            level: 'critical',
            details: {
                adminId: admin.userId,
                userId,
                deletedEmail: user?.email
            }
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Failed to delete user' };
    }
}

/**
 * Get linked user details
 */
export async function getLinkedUser(linkedUserId: string) {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    try {
        const linkedUser = await db.user.findUnique({
            where: { id: linkedUserId },
            select: {
                id: true,
                email: true,
                businessName: true,
                accountType: true,
            }
        });

        if (!linkedUser) return { success: false, error: 'Linked user not found' };

        return { success: true, linkedUser };
    } catch (error) {
        console.error('Error fetching linked user:', error);
        return { success: false, error: 'Failed to fetch linked user' };
    }
}

/**
 * Reset Switch PIN for a user and their linked account
 */
export async function resetSwitchPin(userId: string, newPin: string) {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    try {
        // Hash the new PIN
        // Hash the new PIN
        const pinHash = await bcrypt.hash(newPin, 10);

        // Get the user to find if they have a link
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { linkedUserId: true }
        });

        if (!user) return { success: false, error: 'User not found' };

        // Update main user
        await db.user.update({
            where: { id: userId },
            data: { switchPinHash: pinHash }
        });

        // Update linked user if exists
        if (user.linkedUserId) {
            await db.user.update({
                where: { id: user.linkedUserId },
                data: { switchPinHash: pinHash }
            });
        }

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'SWITCH_PIN_RESET',
                resource: 'user',
                resourceId: userId,
                details: { linkedUserId: user.linkedUserId },
            },
        });

        await sendAdminAlert(`Switch PIN Reset: ${userId}`, {
            level: 'warning',
            details: {
                adminId: admin.userId,
                userId,
                linkedUserId: user.linkedUserId
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error resetting PIN:', error);
        return { success: false, error: 'Failed to reset PIN' };
    }
}

/**
 * Unlink two accounts
 */
export async function unlinkAccounts(userId: string) {
    const admin = await getAdminUser();
    if (!admin || admin.role !== 'admin') return { success: false, error: 'Unauthorized' };

    try {
        const user = await db.user.findUnique({
            where: { id: userId },
            select: { linkedUserId: true }
        });

        if (!user || !user.linkedUserId) {
            return { success: false, error: 'No linked account found' };
        }

        const linkedUserId = user.linkedUserId;

        // Remove link from User 1
        await db.user.update({
            where: { id: userId },
            data: { linkedUserId: null, switchPinHash: null }
        });

        // Remove link from User 2
        await db.user.update({
            where: { id: linkedUserId },
            data: { linkedUserId: null, switchPinHash: null }
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'ACCOUNTS_UNLINKED',
                resource: 'user',
                resourceId: userId,
                details: { unlinkedFrom: linkedUserId },
            },
        });

        await sendAdminAlert(`Accounts Unlinked: ${userId}`, {
            level: 'critical',
            details: {
                adminId: admin.userId,
                userId,
                unlinkedFrom: linkedUserId
            }
        });

        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Error unlinking accounts:', error);
        return { success: false, error: 'Failed to unlink accounts' };
    }
}
