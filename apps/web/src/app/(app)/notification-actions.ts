'use server';

import { db } from '@vouch/db';
import { validateSession } from '@vouch/auth';
import { cookies } from 'next/headers';

export type NotificationLevel = 'critical' | 'warning' | 'info';

export interface NotificationItem {
    id: string;
    level: NotificationLevel;
    title: string;
    message: string;
    actionUrl: string;
    actionLabel: string;
}

export async function getNotifications(): Promise<NotificationItem[]> {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = token ? await validateSession(token) : null;

    if (!user) return [];

    const alerts: NotificationItem[] = [];

    // 1. VAT Trap Check (Compliance)
    // 25M limit. We check total income this year.
    // Ideally we use a cached value or optimized query.
    // For now, let's sum transactions.
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const incomeAgg = await db.transaction.aggregate({
        where: {
            userId: user.id,
            type: 'income',
            date: { gte: startOfYear },
            deletedAt: null
        },
        _sum: { amount: true }
    });
    const totalTurnover = Number(incomeAgg._sum.amount || 0);

    if (totalTurnover > 25_000_000) {
        // user.isVatExempt check? Assuming no for now.
        alerts.push({
            id: 'vat-trap',
            level: 'critical',
            title: 'VAT Threshold Exceeded',
            message: `You've crossed ₦25M turnover (Current: ₦${(totalTurnover / 1000000).toFixed(1)}M). Mandatory VAT filing is now required.`,
            actionUrl: '/fiscal',
            actionLabel: 'View Compliance'
        });
    } else if (totalTurnover > 20_000_000) {
        alerts.push({
            id: 'vat-warning',
            level: 'warning',
            title: 'Approaching VAT Limit',
            message: `You are close to the ₦25M VAT registration threshold.`,
            actionUrl: '/fiscal',
            actionLabel: 'Check Status'
        });
    }

    // 2. Receipt Hunter (Logic from Dashboard)
    // Expense > 50k AND (No vat evidence AND No receipts)
    const riskyCount = await db.transaction.count({
        where: {
            userId: user.id,
            type: { not: 'income' },
            amount: { gt: 50000 },
            deletedAt: null,
            hasVatEvidence: false,
            // Simple check: receiptUrls is empty array or null. 
            // In Prisma JSON filter, exact matching array is tricky, but let's try path.
            // Or just check hasVatEvidence false for simplicity as per user request earlier.
            // Logic: "Risky" = >50k & !hasEvidence
        }
    });

    if (riskyCount > 0) {
        alerts.push({
            id: 'missing-receipts',
            level: 'warning',
            title: 'Missing Documentation',
            message: `${riskyCount} high-value expenses are missing VAT evidence or receipts.`,
            actionUrl: '/transactions?status=risky', // Need to implement this filter eventually
            actionLabel: 'Fix Now'
        });
    }

    // 3. Overdue Invoices (Cashflow)
    const overdueCount = await db.invoice.count({
        where: {
            userId: user.id,
            status: { in: ['overdue', 'Overdue'] }
        }
    });

    if (overdueCount > 0) {
        alerts.push({
            id: 'overdue-invoices',
            level: 'critical',
            title: 'Overdue Invoices',
            message: `You have ${overdueCount} overdue invoices requiring attention.`,
            actionUrl: '/invoices?status=overdue',
            actionLabel: 'View Invoices'
        });
    }

    // 4. Filing Deadline (e.g. VAT due by 21st)
    const today = new Date();
    if (today.getDate() >= 15 && today.getDate() <= 21) {
        alerts.push({
            id: 'vat-deadline',
            level: 'info',
            title: 'Filing Deadline Approaching',
            message: 'VAT Returns are due by the 21st of this month.',
            actionUrl: '/print/tax-forms/vat-return',
            actionLabel: 'File Return'
        });
    }

    return alerts;
}
