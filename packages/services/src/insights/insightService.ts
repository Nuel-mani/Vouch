import { db } from '@vouch/db';
import { StrategicInsight } from '@prisma/client';

export type CreateInsightInput = {
    title: string;
    insight: string;
    law?: string;
    category: string;
    type?: 'warning' | 'opportunity' | 'success';
    impact?: string;
    isActive?: boolean;
};

export type UpdateInsightInput = Partial<CreateInsightInput>;

export const insightService = {
    /**
     * Get all insights, optionally filtered by active status
     */
    getInsights: async (onlyActive = true) => {
        return await db.strategicInsight.findMany({
            where: onlyActive ? { isActive: true } : undefined,
            orderBy: { createdAt: 'desc' },
        });
    },

    /**
     * Get a single insight by ID
     */
    getInsightById: async (id: string) => {
        return await db.strategicInsight.findUnique({
            where: { id },
        });
    },

    /**
     * Create a new strategic insight
     */
    createInsight: async (data: CreateInsightInput) => {
        return await db.strategicInsight.create({
            data: {
                title: data.title,
                insight: data.insight,
                law: data.law,
                category: data.category,
                type: data.type || 'opportunity',
                impact: data.impact,
                isActive: data.isActive ?? true,
            },
        });
    },

    /**
     * Update an existing insight
     */
    updateInsight: async (id: string, data: UpdateInsightInput) => {
        return await db.strategicInsight.update({
            where: { id },
            data,
        });
    },

    /**
     * Delete an insight
     */
    deleteInsight: async (id: string) => {
        return await db.strategicInsight.delete({
            where: { id },
        });
    },

    /**
     * Seed the initial 50 insights
     * This is idempotent - it will not create duplicates if title matches (optional logic)
     * For now, we will just create them if the table is empty.
     */
    seedInsights: async (insights: CreateInsightInput[]) => {
        const count = await db.strategicInsight.count();
        if (count > 0) {
            console.log('Insights already seeded, skipping...');
            return;
        }

        console.log(`Seeding ${insights.length} insights...`);
        // Use transaction or createMany
        await db.strategicInsight.createMany({
            data: insights.map(i => ({
                ...i,
                type: i.type || 'opportunity',
                isActive: true
            })),
        });
        console.log('Seeding complete.');
    }
};
