import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { redirect } from 'next/navigation';
import { TaxFormList } from './_components/TaxFormList';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default async function TaxFormsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = token ? await validateSession(token) : null;

    if (!user) redirect('/auth/login');

    // Security: Only for Personal Accounts (Business uses Fiscal Engine)
    if (user.accountType === 'business') {
        redirect('/fiscal');
    }

    // Fetch Filings
    const filings = await db.taxFiling.findMany({
        where: { userId: user.id },
        orderBy: { taxYear: 'desc' }
    });

    // Calculate Summary Stats
    const currentYear = new Date().getFullYear();
    const currentReturn = filings.find(f => f.taxYear === currentYear);
    const isFiled = currentReturn?.status === 'filed';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">My Tax Forms</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        Manage your Personal Income Tax (PIT) filings and compliance.
                    </p>
                </div>
                <div className="flex gap-3">
                    <a
                        href="/print/tax-forms/form-a"
                        className="btn-primary flex items-center gap-2"
                    >
                        <Clock size={16} />
                        File {currentYear} Return
                    </a>
                </div>
            </div>

            {/* Status Card */}
            <div className={`p-6 rounded-2xl border ${isFiled
                ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30'
                : 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30'
                }`}>
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${isFiled
                        ? 'bg-green-500 text-white'
                        : 'bg-blue-500 text-white'
                        }`}>
                        {isFiled ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg mb-1 ${isFiled
                            ? 'text-green-900 dark:text-green-100'
                            : 'text-blue-900 dark:text-blue-100'
                            }`}>
                            {isFiled
                                ? `You're all set for ${currentYear}!`
                                : `2025 Filing Due Soon`}
                        </h3>
                        <p className={`text-sm ${isFiled
                            ? 'text-green-800 dark:text-green-200'
                            : 'text-blue-800 dark:text-blue-200'
                            }`}>
                            {isFiled
                                ? `Your Form A return for ${currentYear} has been filed successfully.`
                                : `You haven't filed your return for the ${currentYear} tax year yet. The deadline is usually March 31st.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* List Component */}
            <TaxFormList
                filings={filings.map(f => ({
                    id: f.id,
                    formType: f.formType,
                    taxYear: f.taxYear,
                    status: f.status,
                    filingDate: f.filingDate,
                    totalTaxPaid: Number(f.totalTaxPaid),
                    grossIncome: Number(f.turnover || 0),
                }))}
                userName={user.businessName || user.email}
            />
        </div>
    );
}
