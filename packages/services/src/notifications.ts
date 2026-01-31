import { db } from '@vouch/db';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface CreateNotificationParams {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    data?: any;
}

export async function createNotification(params: CreateNotificationParams) {
    return await db.notification.create({
        data: {
            userId: params.userId,
            type: params.type,
            title: params.title,
            message: params.message,
            actionUrl: params.actionUrl,
            data: params.data,
            isRead: false,
        },
    });
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
    return await db.notification.updateMany({
        where: {
            id: notificationId,
            userId,
        },
        data: {
            isRead: true,
        },
    });
}

export async function markAllNotificationsAsRead(userId: string) {
    return await db.notification.updateMany({
        where: {
            userId,
            isRead: false,
        },
        data: {
            isRead: true,
        },
    });
}

export async function getUnreadNotifications(userId: string, limit = 10) {
    return await db.notification.findMany({
        where: {
            userId,
            isRead: false,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    });
}

export async function getAllNotifications(userId: string, limit = 20) {
    return await db.notification.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: limit,
    });
}
