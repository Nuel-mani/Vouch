'use server';

import { insightService } from '@vouch/services';

export async function getStrategicInsights() {
    try {
        const insights = await insightService.getInsights(true);
        return { success: true, data: insights };
    } catch (error) {
        console.error('Failed to fetch insights:', error);
        return { success: false, error: 'Failed to load insights' };
    }
}
