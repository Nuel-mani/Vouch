import { NextResponse } from 'next/server';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;
        const user = token ? await validateSession(token) : null;

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch Receipt Hunter stats
        const [transactions, invoiceCount] = await Promise.all([
            db.transaction.findMany({
                where: {
                    userId: user.id,
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
                    userId: user.id,
                    status: { in: ['pending', 'overdue', 'Pending', 'Overdue'] }
                }
            })
        ]);

        const riskyTxCount = transactions.filter((tx: any) => {
            const hasReceipts = tx.receiptUrls && Array.isArray(tx.receiptUrls) && tx.receiptUrls.length > 0;
            const hasEvidence = tx.hasVatEvidence || hasReceipts;
            return !hasEvidence;
        }).length;

        const count = riskyTxCount + invoiceCount;

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error fetching risky count:', error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}
