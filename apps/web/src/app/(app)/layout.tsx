import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { Sidebar } from './_components/Sidebar';
import { TopBar } from './_components/TopBar';
import { db } from '@vouch/db';
import Link from 'next/link';
import { AlertTriangle, Settings } from 'lucide-react';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth check handled by middleware
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const rawUser = token ? await validateSession(token) : null;

    if (!rawUser) return null;

    // Check for compliance suspension
    const dbUser = await db.user.findUnique({
        where: { id: rawUser.id },
        select: { complianceSuspended: true }
    });

    const isSuspended = dbUser?.complianceSuspended;

    // Fetch Receipt Hunter stats
    let riskyCount = 0;

    const [transactions, invoiceCount] = await Promise.all([
        db.transaction.findMany({
            where: {
                userId: rawUser.id,
                type: { not: 'income' },
                amount: { gt: 50000 },
                deletedAt: null,
            },
            select: {
                hasVatEvidence: true,
                receiptUrls: true,
            }
        }),
        db.invoice.count({
            where: {
                userId: rawUser.id,
                status: { in: ['pending', 'overdue', 'Pending', 'Overdue'] }
            }
        })
    ]);

    const riskyTxCount = transactions.filter((tx: any) => {
        const hasReceipts = tx.receiptUrls && Array.isArray(tx.receiptUrls) && tx.receiptUrls.length > 0;
        const hasEvidence = tx.hasVatEvidence || hasReceipts;
        return !hasEvidence;
    }).length;

    riskyCount = riskyTxCount + invoiceCount;

    const user = JSON.parse(JSON.stringify(rawUser));

    // If suspended, show restricted UI
    if (isSuspended) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col">
                {/* Suspended Header */}
                <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} />
                        <div>
                            <div className="font-bold">Account Restricted</div>
                            <div className="text-sm opacity-90">Your account is suspended due to failed verification attempts</div>
                        </div>
                    </div>
                    <Link
                        href={rawUser.accountType === 'business' ? '/settings/branding' : '/settings'}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                    >
                        <Settings size={18} />
                        Verify Now
                    </Link>
                </div>

                {/* Main Content - Only Settings */}
                <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full">
                    {children}
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--muted)] dark:bg-slate-950 flex">
            {/* Sidebar */}
            <Sidebar user={user} riskyCount={riskyCount} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Top Bar */}
                <TopBar user={user} />

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
