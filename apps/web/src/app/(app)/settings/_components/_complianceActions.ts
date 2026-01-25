'use server';

import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';

export async function submitComplianceDocument(requestType: string, imageBase64: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return { success: false, error: 'Not authenticated' };
    }

    const user = await validateSession(token);
    if (!user) {
        return { success: false, error: 'Invalid session' };
    }

    try {
        // Check for existing pending/approved request of same type
        const existing = await db.complianceRequest.findFirst({
            where: {
                userId: user.id,
                requestType,
                status: { in: ['pending', 'approved'] },
            },
        });

        if (existing) {
            if (existing.status === 'approved') {
                return { success: false, error: 'This document type is already verified' };
            }
            return { success: false, error: 'You already have a pending verification for this document type' };
        }

        // In production, you would:
        // 1. Upload imageBase64 to S3/Cloudinary
        // 2. Store the URL in documentUrl
        // For now, we store the base64 directly (not recommended for production)

        // Create new compliance request
        await db.complianceRequest.create({
            data: {
                userId: user.id,
                requestType,
                documentUrl: imageBase64, // Store the base64 image (or upload to storage first)
                documentName: `${requestType}_${Date.now()}`,
                status: 'pending',
            },
        });

        revalidatePath('/settings');
        revalidatePath('/settings/branding');

        return { success: true };
    } catch (error) {
        console.error('Failed to submit compliance document:', error);
        return { success: false, error: 'Failed to submit request' };
    }
}

export async function getUserComplianceRequests() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) return [];

    const user = await validateSession(token);
    if (!user) return [];

    try {
        const requests = await db.complianceRequest.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                requestType: true,
                status: true,
                documentName: true,
                createdAt: true,
            },
        });
        return requests;
    } catch (error) {
        console.error('Failed to fetch compliance requests:', error);
        return [];
    }
}
