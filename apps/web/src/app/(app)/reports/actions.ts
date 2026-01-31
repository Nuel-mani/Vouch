'use server';

import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { generateProfitAndLoss, generateCashFlowTrend, DateRange, ProfitAndLossStatement } from '@vouch/services';

async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    return token ? await validateSession(token) : null;
}

export async function getProfitAndLoss(range: DateRange): Promise<ProfitAndLossStatement> {
    const user = await getCurrentUser();

    // Safety check - although middleware handles this, good to be safe
    if (!user) {
        throw new Error('Unauthorized');
    }

    return await generateProfitAndLoss(user.id, range);
}

export async function getCashFlowTrend(year: number) {
    const user = await getCurrentUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    return await generateCashFlowTrend(user.id, year);
}
