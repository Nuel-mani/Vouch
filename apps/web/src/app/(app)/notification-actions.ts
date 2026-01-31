'use server';

import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@vouch/services';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    return token ? await validateSession(token) : null;
}

export async function getMyUnreadNotifications() {
    const user = await getCurrentUser();
    if (!user) return [];

    return await getUnreadNotifications(user.id);
}

export async function markAsRead(notificationId: string) {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    await markNotificationAsRead(notificationId, user.id);
    return { success: true };
}

export async function markAllAsRead() {
    const user = await getCurrentUser();
    if (!user) return { success: false };

    await markAllNotificationsAsRead(user.id);
    return { success: true };
}
