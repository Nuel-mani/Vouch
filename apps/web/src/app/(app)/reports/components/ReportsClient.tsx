'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Download, TrendingUp, TrendingDown, Calendar, Zap } from 'lucide-react';
import type { ProfitAndLossStatement } from '@vouch/services/src/reports';

interface MonthlyTrend {
    month: number;
    name: string;
    income: number;
    expense: number;
}

interface ReportsClientProps {
    initialPnl: ProfitAndLossStatement;
    monthlyTrend: MonthlyTrend[];
    userCurrency: string;
}

const COLORS = {
    income: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    expense: ['#ef4444', '#f87171', '#fca5a5', '#fecaca'],
};

const CustomTooltip = ({ active, payload, label, currency }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-xs">
                <p className="font-bold text-slate-700 mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
                        <span className="capitalize">{entry.name}:</span>
                        <span className="font-mono font-medium">
                            {currency}{entry.value.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function ReportsClient({ initialPnl, monthlyTrend, userCurrency }: ReportsClientProps) {
    const [pnl] = useState(initialPnl); // In future we can add date filtering state here

    // Prepare Pie Data
    const incomeData = Object.entries(pnl.income.categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const expenseData = Object.entries(pnl.expense.categories)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const formatCurrency = (val: number) => `${userCurrency}${val.toLocaleString()}`;

    return (
        <div className="space-y-8">
            <style jsx global>{`
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
            <div className="relative overflow-hidden bg-slate-900 rounded-2xl md:rounded-[2rem] p-5 md:p-10 text-white shadow-2xl border border-white/5 print:bg-slate-900 print:text-white">
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

                    <div className="flex items-center gap-3 print:hidden">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white border border-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition backdrop-blur-md"
                        >
                            <Download size={16} />
                            Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Income</span>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{formatCurrency(pnl.income.total)}</div>
                    <div className="text-xs text-slate-400 mt-2">Captured period</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Expenses</span>
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <TrendingDown size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{formatCurrency(pnl.expense.total)}</div>
                    <div className="text-xs text-slate-400 mt-2">Deductible & Non-deductible</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Net Profit</span>
                        <div className={`p-2 rounded-lg ${pnl.netProfit >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div className={`text-3xl font-bold ${pnl.netProfit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                        {formatCurrency(pnl.netProfit)}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Pre-tax estimate</div>
                </div>
            </div>

            {/* Cash Flow Trend */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px] flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6 shrink-0">Cash Flow Trend</h3>
                <div className="flex-1 min-h-0 w-full">
                    <ResponsiveContainer width="100%" height={320} minWidth={0}>
                        <BarChart data={monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `${userCurrency}${val / 1000}k`} />
                            <Tooltip content={<CustomTooltip currency={userCurrency} />} cursor={{ fill: '#F1F5F9' }} />
                            <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Breakdown Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Income Sources</h3>
                    {incomeData.length > 0 ? (
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-full h-[250px]">
                                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                                    <PieChart>
                                        <Pie
                                            data={incomeData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {incomeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.income[index % COLORS.income.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => [formatCurrency(value), 'Income']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full mt-4 space-y-2">
                                {incomeData.slice(0, 5).map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.income[index % COLORS.income.length] }} />
                                            <span className="text-slate-600">{entry.name}</span>
                                        </div>
                                        <span className="font-medium text-slate-900">{formatCurrency(entry.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                            No income data recorded
                        </div>
                    )}
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px] flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Expense Categories</h3>
                    {expenseData.length > 0 ? (
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-full h-[250px]">
                                <ResponsiveContainer width="100%" height={250} minWidth={0}>
                                    <PieChart>
                                        <Pie
                                            data={expenseData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {expenseData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.expense[index % COLORS.expense.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => [formatCurrency(value), 'Expense']} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full mt-4 space-y-2">
                                {expenseData.slice(0, 5).map((entry, index) => (
                                    <div key={index} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.expense[index % COLORS.expense.length] }} />
                                            <span className="text-slate-600">{entry.name}</span>
                                        </div>
                                        <span className="font-medium text-slate-900">{formatCurrency(entry.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                            No expense data recorded
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
