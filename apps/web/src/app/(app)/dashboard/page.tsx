import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import Link from 'next/link';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    FileText,
    Plus,
    ArrowRight,
    Receipt,
    AlertTriangle
} from 'lucide-react';
import { ThresholdMonitor } from './_components/ThresholdMonitor';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = token ? await validateSession(token) : null;

    if (!user) return null; // Should be handled by middleware

    // Fetch real data from database
    const [transactions, invoices, recentTransactions] = await Promise.all([
        db.transaction.findMany({
            where: { userId: user.id },
            select: { type: true, amount: true },
        }),
        db.invoice.findMany({
            where: { userId: user.id },
            select: { status: true, amount: true },
        }),
        db.transaction.findMany({
            where: { userId: user.id },
            orderBy: { date: 'desc' },
            take: 5,
        }),
    ]);

    // Calculate stats
    const stats = {
        income: 0,
        expense: 0,
        balance: 0,
        pendingInvoices: 0,
        pendingAmount: 0,
    };

    transactions.forEach((t) => {
        const amount = Number(t.amount);
        if (t.type === 'income') {
            stats.income += amount;
        } else {
            stats.expense += amount;
        }
    });
    stats.balance = stats.income - stats.expense;

    invoices.forEach((inv) => {
        if (inv.status === 'pending' || inv.status === 'sent') {
            stats.pendingInvoices++;
            stats.pendingAmount += Number(inv.amount);
        }
    });

    const transactionCount = transactions.length;

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
                    <p className="text-[var(--muted-foreground)] mt-1">
                        Welcome back, {user.businessName || user.email.split('@')[0]}
                    </p>
                </div>
                <div className="flex gap-3">
                    {/* Conditional "New Invoice" button - only for Business */}
                    {user.accountType === 'business' && (
                        <Link
                            href="/invoices/new"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition shadow-sm"
                        >
                            <FileText size={16} />
                            New Invoice
                        </Link>
                    )}
                    <Link
                        href="/transactions/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm"
                    >
                        <Plus size={16} />
                        Add Transaction
                    </Link>
                </div>
            </div>

            {/* Threshold Monitor */}
            <ThresholdMonitor accountType={user.accountType} totalIncome={stats.income} />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Balance */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-[var(--primary-50)] dark:bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl">
                            <Wallet size={24} />
                        </div>
                        <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Balance</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight truncate" title={`₦${stats.balance.toLocaleString()}`}>
                        ₦{stats.balance.toLocaleString()}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">{transactionCount} transactions</p>
                </div>

                {/* Income */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-xl">
                            <TrendingUp size={24} />
                        </div>
                        <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Income</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight truncate" title={`₦${stats.income.toLocaleString()}`}>
                        ₦{stats.income.toLocaleString()}
                    </h3>
                    <p className="text-sm text-green-600 mt-1">This period</p>
                </div>

                {/* Expenses */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-xl">
                            <TrendingDown size={24} />
                        </div>
                        <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Expenses</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight truncate" title={`₦${stats.expense.toLocaleString()}`}>
                        ₦{stats.expense.toLocaleString()}
                    </h3>
                    <p className="text-sm text-red-600 mt-1">This period</p>
                </div>

                {/* Pending Invoices */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 rounded-xl">
                            <Receipt size={24} />
                        </div>
                        <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Pending</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[var(--foreground)] tracking-tight truncate">
                        {stats.pendingInvoices}
                    </h3>
                    <p className="text-sm text-yellow-600 mt-1">₦{stats.pendingAmount.toLocaleString()} outstanding</p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
                        <h3 className="font-bold text-[var(--foreground)]">Recent Transactions</h3>
                        <Link href="/transactions" className="text-sm text-[var(--primary)] font-medium hover:underline flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    {recentTransactions.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--muted-foreground)]">
                                <Receipt size={32} />
                            </div>
                            <p className="font-medium text-[var(--foreground)]">No transactions yet</p>
                            <p className="text-sm text-[var(--muted-foreground)] mt-1">Add your first income or expense to get started.</p>
                            <Link
                                href="/transactions/new"
                                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                            >
                                <Plus size={16} />
                                Add Transaction
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-[var(--border)]">
                            {recentTransactions.map((tx) => (
                                <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--muted)] transition">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income'
                                            ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                                            : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                                            }`}>
                                            {tx.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-[var(--foreground)]">{tx.description || 'Untitled'}</p>
                                            <p className="text-xs text-[var(--muted-foreground)]">
                                                {new Date(tx.date).toLocaleDateString()} • {tx.categoryName || 'Uncategorized'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'income' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h3 className="font-bold text-[var(--foreground)]">Quick Actions</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        <Link
                            href="/transactions/new"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--muted)] transition"
                        >
                            <div className="p-2 bg-green-100 dark:bg-green-500/10 text-green-600 rounded-lg">
                                <TrendingUp size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Record Income</p>
                                <p className="text-xs text-[var(--muted-foreground)]">Add sales or revenue</p>
                            </div>
                        </Link>
                        <Link
                            href="/transactions/new?type=expense"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--muted)] transition"
                        >
                            <div className="p-2 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-lg">
                                <TrendingDown size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Record Expense</p>
                                <p className="text-xs text-[var(--muted-foreground)]">Track business costs</p>
                            </div>
                        </Link>
                        {user.accountType === 'business' && (
                            <Link
                                href="/invoices/new"
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--muted)] transition"
                            >
                                <div className="p-2 bg-[var(--primary-50)] dark:bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--foreground)]">Create Invoice</p>
                                    <p className="text-xs text-[var(--muted-foreground)]">Bill your customers</p>
                                </div>
                            </Link>
                        )}
                        <Link
                            href="/optimizer"
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--muted)] transition"
                        >
                            <div className="p-2 bg-purple-100 dark:bg-purple-500/10 text-purple-600 rounded-lg">
                                <AlertTriangle size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Tax Checkup</p>
                                <p className="text-xs text-[var(--muted-foreground)]">Review compliance status</p>
                            </div>
                        </Link>

                        {/* NTA 2025 Tax Forms Link */}
                        <a
                            href={user.accountType === 'business' ? '/fiscal' : '/print/tax-forms/form-a'}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--muted)] transition border border-dashed border-[var(--primary)]/30"
                        >
                            <div className="p-2 bg-[var(--primary)] text-white rounded-lg">
                                <FileText size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-[var(--foreground)]">Print Tax Forms</p>
                                <p className="text-xs text-[var(--muted-foreground)]">
                                    {user.accountType === 'business' ? 'Go to Fiscal Engine' : 'NTA 2025 Form A'}
                                </p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </div >
    );
}
