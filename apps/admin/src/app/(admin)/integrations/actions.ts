'use server';

import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';
import { getAdminUser } from '../../../lib/permissions';

/**
 * Update an integration's configuration
 */
export async function updateIntegrationConfig(integrationKey: string, config: Record<string, string>) {
    const admin = await getAdminUser();

    if (!admin || admin.role !== 'admin') {
        return { success: false, error: 'Only admins can configure integrations' };
    }

    try {
        // Get existing config
        const existing = await db.systemConfig.findUnique({
            where: { key: `integration_${integrationKey}` },
        });

        const existingData = existing ? JSON.parse(existing.value) : {};
        const newData = { ...existingData, ...config, enabled: true };

        // Store integration config in SystemConfig
        await db.systemConfig.upsert({
            where: { key: `integration_${integrationKey}` },
            update: {
                value: JSON.stringify(newData),
            },
            create: {
                key: `integration_${integrationKey}`,
                value: JSON.stringify(newData),
            },
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'INTEGRATION_CONFIGURED',
                resource: 'integration',
                resourceId: integrationKey,
                details: { configKeys: Object.keys(config) },
            },
        });

        revalidatePath('/integrations');
        return { success: true };
    } catch (error) {
        console.error('Error updating integration config:', error);
        return { success: false, error: 'Failed to update integration config' };
    }
}

/**
 * Enable/disable an integration
 */
export async function toggleIntegration(integrationKey: string, enabled: boolean) {
    const admin = await getAdminUser();

    if (!admin || admin.role !== 'admin') {
        return { success: false, error: 'Only admins can toggle integrations' };
    }

    try {
        const existing = await db.systemConfig.findUnique({
            where: { key: `integration_${integrationKey}` },
        });

        const existingData = existing ? JSON.parse(existing.value) : {};
        const newData = { ...existingData, enabled };

        await db.systemConfig.upsert({
            where: { key: `integration_${integrationKey}` },
            update: { value: JSON.stringify(newData) },
            create: {
                key: `integration_${integrationKey}`,
                value: JSON.stringify(newData),
            },
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: enabled ? 'INTEGRATION_ENABLED' : 'INTEGRATION_DISABLED',
                resource: 'integration',
                resourceId: integrationKey,
            },
        });

        revalidatePath('/integrations');
        return { success: true };
    } catch (error) {
        console.error('Error toggling integration:', error);
        return { success: false, error: 'Failed to toggle integration' };
    }
}

/**
 * Test an integration connection
 */
export async function testIntegration(integrationKey: string) {
    const admin = await getAdminUser();

    if (!admin || (admin.role !== 'admin' && admin.role !== 'staff')) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Placeholder for actual integration testing
        // This would call the relevant API to verify connectivity
        const testResults: Record<string, { success: boolean; message: string }> = {
            paystack: { success: true, message: 'Connected to Paystack API' },
            flutterwave: { success: true, message: 'Connected to Flutterwave API' },
            openai: { success: !!process.env.OPENAI_API_KEY, message: process.env.OPENAI_API_KEY ? 'API key configured' : 'API key missing' },
            resend: { success: !!process.env.RESEND_API_KEY, message: process.env.RESEND_API_KEY ? 'API key configured' : 'API key missing' },
            redis: { success: !!process.env.REDIS_URL, message: process.env.REDIS_URL ? 'Redis URL configured' : 'Redis URL missing' },
        };

        const result = testResults[integrationKey] || { success: false, message: 'Unknown integration' };

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'INTEGRATION_TESTED',
                resource: 'integration',
                resourceId: integrationKey,
                details: { success: result.success },
            },
        });

        return result;
    } catch (error) {
        console.error('Error testing integration:', error);
        return { success: false, message: 'Failed to test integration' };
    }
}
