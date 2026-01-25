import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import {
    TrendingUp,
    TrendingDown,
    PieChart,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    Zap,
    Calendar,
    MousePointer2
} from 'lucide-react';

export default async function AnalyticsPage(props: { searchParams: Promise<{ view?: string }> }) {
    const searchParams = await props.searchParams;
    const view = searchParams.view === 'annual' ? 'annual' : 'monthly';
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) return null;

    // Fetch transaction data for analytics
    const transactions = await db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: 'asc' },
    });

    // Calculate monthly aggregates
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    const categoryBreakdown: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((tx) => {
        if (!tx.date) return;

        try {
            const date = new Date(tx.date);
            if (isNaN(date.getTime())) return;

            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM (Local)
            const amount = Number(tx.amount);
            const category = tx.categoryName || 'Other';

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { income: 0, expense: 0 };
            }
            if (!categoryBreakdown[category]) {
                categoryBreakdown[category] = { income: 0, expense: 0 };
            }

            if (tx.type === 'income') {
                monthlyData[monthKey].income += amount;
                categoryBreakdown[category].income += amount;
            } else {
                monthlyData[monthKey].expense += amount;
                categoryBreakdown[category].expense += amount;
            }
        } catch (e) {
            console.error('Error parsing transaction date:', e);
        }
    });

    // Aggregation for selected view
    let chartData: Record<string, { income: number; expense: number }> = {};
    if (view === 'monthly') {
        chartData = monthlyData;
    } else {
        // Aggregate annually
        transactions.forEach((tx) => {
            const date = new Date(tx.date);
            const yearKey = date.getFullYear().toString();
            const amount = Number(tx.amount);
            if (!chartData[yearKey]) chartData[yearKey] = { income: 0, expense: 0 };
            if (tx.type === 'income') chartData[yearKey].income += amount;
            else chartData[yearKey].expense += amount;
        });
    }

    // Get sorted keys for chart (show all data)
    const sortedKeys = Object.keys(chartData).sort();

    // Category totals
    const topExpenseCategories = Object.entries(categoryBreakdown)
        .filter(([_, data]) => data.expense > 0)
        .sort((a, b) => b[1].expense - a[1].expense)
        .slice(0, 5);

    const topIncomeCategories = Object.entries(categoryBreakdown)
        .filter(([_, data]) => data.income > 0)
        .sort((a, b) => b[1].income - a[1].income)
        .slice(0, 5);

    // Overall totals
    const totals = transactions.reduce(
        (acc, tx) => {
            const amount = Number(tx.amount);
            if (tx.type === 'income') {
                acc.income += amount;
            } else {
                acc.expense += amount;
            }
            return acc;
        },
        { income: 0, expense: 0 }
    );

    const profitMargin = totals.income > 0
        ? ((totals.income - totals.expense) / totals.income * 100)
        : 0;

    return (
        <div className="px-4 md:px-0 space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-12 max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-2xl md:rounded-[2rem] p-5 md:p-10 text-white shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] -mr-48 -mt-48 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 blur-[80px] -ml-32 -mb-32 pointer-events-none" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-blue-400 animate-pulse" />
                            <span className="text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-blue-400">Financial Insights</span>
                        </div>
                        <h1 className="text-2xl md:text-5xl font-black tracking-tight leading-none">Analytics</h1>
                        <p className="text-[11px] md:text-lg text-slate-400 max-w-xl font-medium leading-relaxed">
                            Visualizing your cash flow and performance metrics with automated intelligence.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10 backdrop-blur-md w-full md:w-auto md:min-w-[200px]">
                        <div className="p-2 md:p-3 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
                            <Zap size={18} className="md:w-6 md:h-6" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] md:text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate text-opacity-80">Total Profit</p>
                            <p className="text-base md:text-2xl font-black truncate tracking-tight">₦{(totals.income - totals.expense).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {/* Income Card */}
                <div className="group bg-white dark:bg-slate-800 p-5 md:p-8 rounded-[1.5rem] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-green-500/30 transition-all duration-300 relative overflow-hidden w-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-green-500/10 transition-colors" />

                    <div className="flex items-center justify-between mb-5 md:mb-6">
                        <div className="p-2.5 md:p-3 bg-green-50 dark:bg-green-500/10 text-green-600 rounded-2xl border border-green-100 dark:border-green-500/20">
                            <TrendingUp size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div className="flex items-center gap-1 text-green-600 font-bold text-[10px] md:text-xs bg-green-100/50 dark:bg-green-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
                            <ArrowUpRight size={12} className="md:w-[14px] md:h-[14px]" />
                            Active
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-[var(--muted-foreground)] mb-1">Total Income</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tight truncate" title={`₦${totals.income.toLocaleString()}`}>
                            ₦{totals.income.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Expenses Card */}
                <div className="group bg-white dark:bg-slate-800 p-5 md:p-8 rounded-[1.5rem] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-red-500/30 transition-all duration-300 relative overflow-hidden w-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-red-500/10 transition-colors" />

                    <div className="flex items-center justify-between mb-5 md:mb-6">
                        <div className="p-2.5 md:p-3 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-2xl border border-red-100 dark:border-red-500/20">
                            <TrendingDown size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div className="flex items-center gap-1 text-red-600 font-bold text-[10px] md:text-xs bg-red-100/50 dark:bg-red-500/10 px-2 py-1 rounded-full uppercase tracking-wider">
                            <ArrowDownRight size={12} className="md:w-[14px] md:h-[14px]" />
                            Tracked
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-[var(--muted-foreground)] mb-1">Total Expenses</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tight truncate" title={`₦${totals.expense.toLocaleString()}`}>
                            ₦{totals.expense.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Profit Margin Card */}
                <div className="group bg-white dark:bg-slate-800 p-5 md:p-8 rounded-[1.5rem] border border-[var(--border)] shadow-sm hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 relative overflow-hidden w-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

                    <div className="flex items-center justify-between mb-5 md:mb-6">
                        <div className="p-2.5 md:p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                            <PieChart size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div className="px-2 py-1 bg-blue-100/50 dark:bg-blue-500/10 rounded-full shrink-0">
                            <Percent size={12} className="text-blue-600 md:w-[14px] md:h-[14px]" />
                        </div>
                    </div>

                    <div>
                        <p className="text-[10px] md:text-xs uppercase font-bold tracking-widest text-[var(--muted-foreground)] mb-1">Profit Margin</p>
                        <p className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--foreground)] tracking-tight">
                            {profitMargin.toFixed(1)}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden group">
                <div className="p-6 md:p-8 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg">
                            <BarChart3 size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Financial Trend</h2>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        {/* View Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                            <a
                                href="/analytics?view=monthly"
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'monthly' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Monthly
                            </a>
                            <a
                                href="/analytics?view=annual"
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'annual' ? 'bg-white dark:bg-slate-600 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Annual
                            </a>
                        </div>
                        <div className="flex items-center gap-6 text-[10px] md:text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] bg-[var(--muted)]/50 px-4 py-2 rounded-xl">
                            <span className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                Income
                            </span>
                            <span className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,44,44,0.5)]" />
                                Expenses
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-10 relative">
                    {/* Background Y-Axis Grid */}
                    <div className="absolute inset-0 px-6 md:px-10 py-6 md:p-10 flex flex-col justify-between pointer-events-none opacity-10">
                        <div className="h-px w-full bg-slate-500" />
                        <div className="h-px w-full bg-slate-500" />
                        <div className="h-px w-full bg-slate-500" />
                        <div className="h-px w-full bg-slate-500" />
                        <div className="h-px w-full bg-slate-500" />
                    </div>

                    {sortedKeys.length === 0 ? (
                        <div className="h-72 md:h-96 flex flex-col items-center justify-center text-[var(--muted-foreground)] bg-[var(--muted)]/20 rounded-2xl border border-dashed border-[var(--border)] relative z-10">
                            <BarChart3 size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">No historical data found</p>
                            <p className="text-sm opacity-60">Add some transactions to generate trends</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto pb-4 no-scrollbar relative z-10 w-full">
                            <div className={`h-72 md:h-96 flex items-end gap-2 md:gap-8 px-2 ${sortedKeys.length > 6 ? 'min-w-[800px]' : 'w-full'}`}>
                                {sortedKeys.map((key) => {
                                    const data = chartData[key];
                                    const maxValue = Math.max(1, ...sortedKeys.map((k) => Math.max(chartData[k].income, chartData[k].expense)));
                                    const incomeHeight = (data.income / maxValue) * 100;
                                    const expenseHeight = (data.expense / maxValue) * 100;

                                    let label = key;
                                    let subLabel = '';
                                    if (view === 'monthly') {
                                        const [year, month] = key.split('-').map(Number);
                                        const date = new Date(year, month - 1, 1);
                                        label = date.toLocaleDateString('en-NG', { month: 'short' }).toUpperCase();
                                        subLabel = `'${year.toString().slice(-2)}`;
                                    }

                                    return (
                                        <div key={key} className="flex-1 group/bar flex flex-col items-center relative h-full">
                                            {/* Hover Tooltip Overlay */}
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-slate-900 text-white text-[10px] py-2 px-3 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-all duration-300 whitespace-nowrap z-50 shadow-2xl border border-white/10 pointer-events-none">
                                                <div className="flex flex-col gap-1 text-center">
                                                    <span className="font-bold border-b border-white/10 pb-1 mb-1">
                                                        {view === 'monthly'
                                                            ? (() => {
                                                                const [y, m] = key.split('-').map(Number);
                                                                return new Date(y, m - 1, 1).toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });
                                                            })()
                                                            : `Year ${key}`
                                                        }
                                                    </span>
                                                    <span className="text-green-400">Income: ₦{data.income.toLocaleString()}</span>
                                                    <span className="text-red-400">Expense: ₦{data.expense.toLocaleString()}</span>
                                                </div>
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-900" />
                                            </div>

                                            <div className="flex gap-1 md:gap-2 items-end flex-1 w-full justify-center">
                                                <div className="relative w-4 md:w-10 h-full flex items-end">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-green-600 to-green-400 rounded-t-sm md:rounded-t-lg transition-all duration-700 delay-100 ease-out shadow-[0_4px_12px_rgba(34,197,94,0.1)] shrink-0"
                                                        style={{ height: `${Math.max(1, incomeHeight)}%` }}
                                                    />
                                                </div>
                                                <div className="relative w-4 md:w-10 h-full flex items-end">
                                                    <div
                                                        className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-sm md:rounded-t-lg transition-all duration-700 delay-200 ease-out shadow-[0_4px_12px_rgba(239,44,44,0.1)] shrink-0"
                                                        style={{ height: `${Math.max(1, expenseHeight)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="h-10 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-tighter">
                                                    {label}
                                                </span>
                                                {subLabel && (
                                                    <span className="text-[8px] md:text-[10px] font-bold text-slate-400/60 leading-none">
                                                        {subLabel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                    }
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Top Expense Categories */}
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden flex flex-col w-full">
                    <div className="p-5 md:p-8 border-b border-[var(--border)] bg-red-50/30 dark:bg-red-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 dark:bg-red-500/10 text-red-600 rounded-lg">
                                <PieChart size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Top Expenses</h2>
                        </div>
                    </div>

                    <div className="p-5 md:p-8 flex-1">
                        {topExpenseCategories.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                <TrendingDown size={32} className="mb-2" />
                                <p className="text-sm font-medium">No recorded expenses</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {topExpenseCategories.map(([category, data]) => {
                                    const percentage = (data.expense / totals.expense) * 100;
                                    return (
                                        <div key={category} className="group/cat">
                                            <div className="flex justify-between items-end text-sm mb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                                    <span className="font-bold text-[var(--foreground)] tracking-tight">{category}</span>
                                                </div>
                                                <span className="font-mono font-medium text-[var(--muted-foreground)]">₦{data.expense.toLocaleString()}</span>
                                            </div>
                                            <div className="relative h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-end mt-1.5">
                                                <span className="text-[10px] uppercase font-black text-red-500/60 tracking-widest">{percentage.toFixed(0)}% contribution</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Income Categories */}
                <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden flex flex-col w-full">
                    <div className="p-5 md:p-8 border-b border-[var(--border)] bg-green-50/30 dark:bg-green-500/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-500/10 text-green-600 rounded-lg">
                                <TrendingUp size={20} />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Top Income Sources</h2>
                        </div>
                    </div>

                    <div className="p-5 md:p-8 flex-1">
                        {topIncomeCategories.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                                <TrendingUp size={32} className="mb-2" />
                                <p className="text-sm font-medium">No recorded income</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {topIncomeCategories.map(([category, data]) => {
                                    const percentage = (data.income / totals.income) * 100;
                                    return (
                                        <div key={category} className="group/cat">
                                            <div className="flex justify-between items-end text-sm mb-2.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                                    <span className="font-bold text-[var(--foreground)] tracking-tight">{category}</span>
                                                </div>
                                                <span className="font-mono font-medium text-[var(--muted-foreground)]">₦{data.income.toLocaleString()}</span>
                                            </div>
                                            <div className="relative h-2.5 bg-[var(--muted)] rounded-full overflow-hidden">
                                                <div
                                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-end mt-1.5">
                                                <span className="text-[10px] uppercase font-black text-green-500/60 tracking-widest">{percentage.toFixed(0)}% contribution</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
