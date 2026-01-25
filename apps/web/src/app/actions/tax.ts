'use server';

import { db } from '@vouch/db';
import { validateSession } from '@vouch/auth';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function recordTaxFiling(data: {
    formType: string;
    taxYear: number;
    turnover: number;
    assessableProfit: number;
    totalTaxPaid: number;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = token ? await validateSession(token) : null;

    if (!user) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        await db.taxFiling.create({
            data: {
                userId: user.id,
                formType: data.formType,
                taxYear: data.taxYear,
                status: 'filed', // Auto-mark as filed for now
                filingDate: new Date(),
                turnover: data.turnover,
                assessableProfit: data.assessableProfit,
                totalTaxPaid: data.totalTaxPaid,
            },
        });

        revalidatePath('/fiscal');
        return { success: true };
    } catch (error) {
        console.error('Failed to record tax filing:', error);
        return { success: false, error: 'Failed to record filing' };
    }
}
