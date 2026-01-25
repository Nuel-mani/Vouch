'use server';

import { insightService, CreateInsightInput, UpdateInsightInput } from '@vouch/services';
import { revalidatePath } from 'next/cache';

export async function getInsights() {
    try {
        const insights = await insightService.getInsights(false); // Fetch all, including inactive
        return { success: true, data: insights };
    } catch (error) {
        console.error('Admin: Failed to fetch insights:', error);
        return { success: false, error: 'Failed to fetch insights' };
    }
}

export async function getInsight(id: string) {
    try {
        const insight = await insightService.getInsightById(id);
        return { success: true, data: insight };
    } catch (error) {
        return { success: false, error: 'Insight not found' };
    }
}

export async function createInsight(data: CreateInsightInput) {
    try {
        await insightService.createInsight(data);
        revalidatePath('/insights');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to create insight' };
    }
}

export async function updateInsight(id: string, data: UpdateInsightInput) {
    try {
        await insightService.updateInsight(id, data);
        revalidatePath('/insights');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to update insight' };
    }
}

export async function deleteInsight(id: string) {
    try {
        await insightService.deleteInsight(id);
        revalidatePath('/insights');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to delete insight' };
    }
}

export async function seedInsights() {
    try {
        // We import the data on the server side
        const { INITIAL_INSIGHTS } = await import('@vouch/services');
        await insightService.seedInsights(INITIAL_INSIGHTS);
        revalidatePath('/insights');
        return { success: true, message: 'Seeding initiated' };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to seed insights' };
    }
}
