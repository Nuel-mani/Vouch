import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import Link from 'next/link';
import { Plus, Download } from 'lucide-react';
import { TransactionList } from './_components/TransactionList';
import { TransactionFilters } from './_components/TransactionFilters';
import { ImportButton } from './_components/ImportButton';
import type { Transaction } from '@vouch/types';
import { ExportButton } from '../_components/ExportButton';
import { exportTransactions } from './_actions';

interface PageProps {
    searchParams: Promise<{
        type?: string;
        category?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        status?: string;
    }>;
}

export default async function TransactionsPage({ searchParams }: PageProps) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);
    const params = await searchParams;

    if (!user) return null;

    const showArchived = params.status === 'archived';

    // Build query filters
    const where: any = {
        userId: user.id,
        deletedAt: showArchived ? { not: null } : null
    };

    if (params.type && params.type !== 'all') {
        where.type = params.type;
    }

    if (params.category) {
        where.categoryId = params.category;
    }

    if (params.startDate) {
        where.date = { ...where.date, gte: new Date(params.startDate) };
    }

    if (params.endDate) {
        where.date = { ...where.date, lte: new Date(params.endDate) };
    }

    if (params.search) {
        // Basic UUID validation regex
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.search);

        if (isUUID) {
            where.OR = [
                { id: params.search },
                // Still allow searching text fields just in case
                { description: { contains: params.search, mode: 'insensitive' } },
            ];
        } else {
            where.OR = [
                { description: { contains: params.search, mode: 'insensitive' } },
                { payee: { contains: params.search, mode: 'insensitive' } },
                { refId: { contains: params.search, mode: 'insensitive' } },
                { categoryName: { contains: params.search, mode: 'insensitive' } },
            ];
        }
    }

    // Fetch transactions with linked invoice data
    const dbTransactions = await db.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: 100,
        include: {
            invoices: {
                select: {
                    id: true,
                    serialId: true,
                    customerName: true,
                    customerEmail: true,
                    amount: true,
                    vatAmount: true,
                    status: true,
                    dateIssued: true,
                    dateDue: true,
                    items: true,
                }
            }
        }
    });

    const transactions = dbTransactions.map(t => {
        // Parse invoice items if present
        let invoiceItems: any[] = [];
        if (t.invoices) {
            try {
                if (Array.isArray(t.invoices.items)) {
                    invoiceItems = t.invoices.items;
                } else if (typeof t.invoices.items === 'string') {
                    invoiceItems = JSON.parse(t.invoices.items);
                }
            } catch (e) {
                console.error('Failed to parse invoice items:', e);
            }
        }

        // Destructure to exclude the raw invoices relation (contains Decimal/Date objects)
        const { invoices: _invoices, ...rest } = t;

        return {
            ...rest,
            type: t.type || 'expense',
            amount: Number(t.amount),
            vatAmount: t.vatAmount ? Number(t.vatAmount) : 0,
            isDeductible: t.isDeductible ?? false,
            hasVatEvidence: t.hasVatEvidence ?? false,
            weCompliant: t.weCompliant ?? false,
            authorizedBy: t.authorizedBy || null,
            paymentMethod: t.paymentMethod || null,
            receiptUrls: t.receiptUrls || [],
            // Convert invoice data to serializable format
            invoice: t.invoices ? {
                id: t.invoices.id,
                serialId: t.invoices.serialId,
                customerName: t.invoices.customerName,
                customerEmail: t.invoices.customerEmail,
                amount: Number(t.invoices.amount),
                vatAmount: Number(t.invoices.vatAmount),
                status: t.invoices.status,
                dateIssued: t.invoices.dateIssued ? t.invoices.dateIssued.toISOString() : null,
                dateDue: t.invoices.dateDue ? t.invoices.dateDue.toISOString() : null,
                items: invoiceItems,
            } : null,
        };
    }) as unknown as Transaction[];

    // Calculate totals
    const totals = {
        income: 0,
        expense: 0,
    };

    transactions.forEach((t) => {
        const amount = Number(t.amount);
        if (t.type === 'income') {
            totals.income += amount;
        } else {
            totals.expense += amount;
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Transactions</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        {transactions.length} transactions found
                    </p>
                </div>
                <div className="flex gap-3">
                    <ImportButton userAccountType={user.accountType || 'personal'} />
                    <ExportButton
                        model="transaction"
                        filters={params}
                        exportAction={exportTransactions}
                    />
                    <Link
                        href="/transactions/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                    >
                        <Plus size={16} />
                        Add Transaction
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[var(--border)]">
                    <p className="text-sm text-[var(--muted-foreground)]">Total Income</p>
                    <p className="text-xl font-bold text-green-600">₦{totals.income.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[var(--border)]">
                    <p className="text-sm text-[var(--muted-foreground)]">Total Expenses</p>
                    <p className="text-xl font-bold text-red-600">₦{totals.expense.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-[var(--border)]">
                    <p className="text-sm text-[var(--muted-foreground)]">Net</p>
                    <p className={`text-xl font-bold ${totals.income - totals.expense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₦{(totals.income - totals.expense).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <Suspense fallback={null}>
                <TransactionFilters />
            </Suspense>

            {/* Transaction List */}
            <TransactionList transactions={transactions} userBusinessName={user.businessName} />
        </div>
    );
}
