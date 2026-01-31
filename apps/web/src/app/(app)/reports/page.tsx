import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { redirect } from 'next/navigation';
import { generateProfitAndLoss, generateCashFlowTrend } from '@vouch/services';
import { ReportsClient } from './components/ReportsClient';
import { Download } from 'lucide-react';

export default async function ReportsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = token ? await validateSession(token) : null;

    if (!user) {
        redirect('/login');
    }

    // Default to current year
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const [pnl, monthlyTrend] = await Promise.all([
        generateProfitAndLoss(user.id, { startDate, endDate }),
        generateCashFlowTrend(user.id, currentYear)
    ]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <ReportsClient
                initialPnl={pnl}
                monthlyTrend={monthlyTrend}
                userCurrency={pnl.currency}
            />
        </div>
    );
}
