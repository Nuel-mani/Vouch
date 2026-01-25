'use server';

import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';
import { getAdminUser } from '../../../lib/permissions';

/**
 * Update a subscription's status
 */
export async function updateSubscriptionStatus(
    subscriptionId: string,
    status: 'active' | 'cancelled' | 'paused' | 'expired'
) {
    const admin = await getAdminUser();

    if (!admin || (admin.role !== 'admin' && admin.role !== 'staff')) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const subscription = await db.subscription.update({
            where: { id: subscriptionId },
            data: { status },
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'SUBSCRIPTION_STATUS_UPDATED',
                resource: 'subscription',
                resourceId: subscriptionId,
                details: { newStatus: status },
            },
        });

        revalidatePath('/subscriptions');
        return { success: true, subscription };
    } catch (error) {
        console.error('Error updating subscription:', error);
        return { success: false, error: 'Failed to update subscription' };
    }
}

/**
 * Update subscription plan type
 */
export async function updateSubscriptionPlan(
    subscriptionId: string,
    planType: 'free' | 'pro' | 'enterprise'
) {
    const admin = await getAdminUser();

    if (!admin || (admin.role !== 'admin' && admin.role !== 'staff')) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const subscription = await db.subscription.update({
            where: { id: subscriptionId },
            data: { planType },
            include: { user: { select: { id: true, email: true } } },
        });

        // Also update the user's subscription tier
        await db.user.update({
            where: { id: subscription.user.id },
            data: { subscriptionTier: planType },
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'SUBSCRIPTION_PLAN_UPDATED',
                resource: 'subscription',
                resourceId: subscriptionId,
                details: { newPlan: planType, userId: subscription.user.id },
            },
        });

        revalidatePath('/subscriptions');
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Error updating subscription plan:', error);
        return { success: false, error: 'Failed to update subscription plan' };
    }
}

/**
 * Extend subscription period
 */
export async function extendSubscription(subscriptionId: string, days: number) {
    const admin = await getAdminUser();

    if (!admin || admin.role !== 'admin') {
        return { success: false, error: 'Only admins can extend subscriptions' };
    }

    try {
        const subscription = await db.subscription.findUnique({
            where: { id: subscriptionId },
        });

        if (!subscription) {
            return { success: false, error: 'Subscription not found' };
        }

        const newEndDate = new Date(subscription.currentPeriodEnd || new Date());
        newEndDate.setDate(newEndDate.getDate() + days);

        await db.subscription.update({
            where: { id: subscriptionId },
            data: { currentPeriodEnd: newEndDate },
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'SUBSCRIPTION_EXTENDED',
                resource: 'subscription',
                resourceId: subscriptionId,
                details: { daysAdded: days, newEndDate: newEndDate.toISOString() },
            },
        });

        revalidatePath('/subscriptions');
        return { success: true };
    } catch (error) {
        console.error('Error extending subscription:', error);
        return { success: false, error: 'Failed to extend subscription' };
    }
}

/**
 * Cancel subscription immediately
 */
export async function cancelSubscription(subscriptionId: string) {
    const admin = await getAdminUser();

    if (!admin || (admin.role !== 'admin' && admin.role !== 'staff')) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const subscription = await db.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: 'cancelled',
                cancelledAt: new Date(),
            },
            include: { user: { select: { id: true } } },
        });

        // Downgrade user to free tier
        await db.user.update({
            where: { id: subscription.user.id },
            data: { subscriptionTier: 'free' },
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'SUBSCRIPTION_CANCELLED',
                resource: 'subscription',
                resourceId: subscriptionId,
            },
        });

        revalidatePath('/subscriptions');
        revalidatePath('/users');
        return { success: true };
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        return { success: false, error: 'Failed to cancel subscription' };
    }
}
