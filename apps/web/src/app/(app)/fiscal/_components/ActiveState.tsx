'use client';

import { useState } from 'react';
import {
    Calculator,
    TrendingDown,
    Calendar,
    Briefcase,
    Building2,
    ArrowRight,
    Shield,
    Info,
    AlertTriangle
} from 'lucide-react';
import { AutoForms } from './AutoForms';

interface ActiveStateProps {
    turnover: number;
    assessableProfit: number;
    deductibleExpenses: number;
    nonDeductibleExpenses: number;
    taxRate: number; // 0.2 or 0.3
    devLevy: number;
    rndIncentive: number;
    user: any;
    filings: any[];
}

export function ActiveState({ turnover, assessableProfit, deductibleExpenses, nonDeductibleExpenses, taxRate, devLevy, rndIncentive, user, filings = [] }: ActiveStateProps) {
    const [shieldAmount, setShieldAmount] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'forms' | 'planner'>('overview');

    const taxLiability = (assessableProfit * taxRate) + devLevy - rndIncentive;
    const monthlyPayment = taxLiability / 6; // 6-month spread

    const citBase = assessableProfit * taxRate;

    // Simple Capital Allowance simulation (assuming 50% initial allowance for machinery as example)
    const simulatedDeduction = shieldAmount * 0.5;
    const simulatedProfit = Math.max(0, assessableProfit - simulatedDeduction);
    const simulatedCit = simulatedProfit * taxRate;
    const simulatedTax = simulatedCit + devLevy - rndIncentive;
    const taxSavings = taxLiability - simulatedTax;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Command Center Header */}
            <div className="bg-slate-900 text-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl md:rounded-2xl border border-blue-500/20">
                            <Shield size={24} className="md:w-8 md:h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-blue-400">Tax Band</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                            </div>
                            <h2 className="text-xl md:text-3xl font-black">{taxRate === 0.3 ? 'Large Scale (Standard)' : 'Special Status'}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/10">
                        <div className="text-right">
                            <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider">CIT Rate</p>
                            <p className="text-lg md:text-2xl font-black text-blue-400">{(taxRate * 100).toFixed(0)}%</p>
                        </div>
                        <div className="h-8 md:h-10 w-[1px] bg-white/10 mx-1 md:mx-2" />
                        <div className="text-right">
                            <p className="text-[10px] md:text-xs text-slate-400 uppercase font-bold tracking-wider">Dev Levy</p>
                            <p className="text-lg md:text-2xl font-black text-orange-400">4%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* VAT Trap Warning */}
            {turnover >= 20_000_000 && turnover < 25_000_000 && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-400 rounded-2xl p-4 md:p-6 mb-6 animate-in fade-in duration-500">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-500 text-white rounded-xl flex-shrink-0">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-orange-900 dark:text-orange-100 mb-1">Approaching VAT Registration Threshold</h3>
                            <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                                Your turnover is ₦{turnover.toLocaleString()}, which is close to the ₦25,000,000 VAT registration threshold.
                                You are <strong>₦{(25_000_000 - turnover).toLocaleString()}</strong> away from mandatory VAT registration.
                            </p>
                            <div className="bg-orange-100 dark:bg-orange-900/40 rounded-lg p-3 text-xs text-orange-900 dark:text-orange-100">
                                <strong>Action Required:</strong> Once you exceed ₦25M, you must register for VAT and file monthly returns at 7.5%.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {turnover >= 25_000_000 && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-2xl p-4 md:p-6 mb-6 animate-in fade-in duration-500">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-red-500 text-white rounded-xl flex-shrink-0 animate-pulse">
                            <AlertTriangle size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-red-900 dark:text-red-100 mb-1 text-lg">⚠️ VAT Registration Required</h3>
                            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                                Your turnover is ₦{turnover.toLocaleString()}, which <strong>exceeds</strong> the ₦25,000,000 threshold.
                                You are now <strong>legally required</strong> to register for VAT.
                            </p>
                            <div className="bg-red-100 dark:bg-red-900/40 rounded-lg p-3 text-xs text-red-900 dark:text-red-100 mb-3">
                                <strong>Immediate Action:</strong> Visit FIRS to obtain your VAT Certificate. You must file monthly VAT returns (Form 002) and charge 7.5% on applicable sales.
                            </div>
                            <a
                                href="/print/tax-forms/vat-return"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition"
                            >
                                Generate VAT Return <ArrowRight size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-[var(--muted)] rounded-xl md:rounded-2xl overflow-x-auto scrollbar-hide no-scrollbar">
                {['overview', 'planner', 'forms'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as 'overview' | 'forms' | 'planner')}
                        className={`px-4 md:px-8 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex-1 text-center ${activeTab === tab
                            ? 'bg-white dark:bg-slate-800 text-[var(--primary)] shadow-sm'
                            : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Compliance Summary Boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-green-100 dark:bg-green-500/10 text-green-600 rounded-xl">
                                        <Shield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--foreground)]">Deductible Expenses</h3>
                                        <p className="text-xs text-[var(--muted-foreground)]">Claimable for Tax Relief</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-green-600 mb-4">₦{deductibleExpenses.toLocaleString()}</p>
                                <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${(deductibleExpenses / (deductibleExpenses + nonDeductibleExpenses || 1)) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-xl">
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--foreground)]">Non-Deductible / Review</h3>
                                        <p className="text-xs text-[var(--muted-foreground)]">Requires Compliance Flags</p>
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-blue-600 mb-4">₦{nonDeductibleExpenses.toLocaleString()}</p>
                                <p className="text-xs text-[var(--muted-foreground)]">
                                    {nonDeductibleExpenses > 0
                                        ? "Transactions with blue ⓘ icons have receipts but need 'Deductible' & 'W&E' flags toggled to Yes."
                                        : "All expenses are fully optimized."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Tax Breakdown Table */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--muted)]/50">
                                    <h3 className="font-bold text-[var(--foreground)]">Liability Breakdown</h3>
                                </div>
                                <div className="divide-y divide-[var(--border)]">
                                    <div className="px-6 py-4 flex justify-between items-center text-sm">
                                        <span className="text-[var(--muted-foreground)]">CIT ({(taxRate * 100).toFixed(0)}%)</span>
                                        <span className="font-mono font-medium">₦{citBase.toLocaleString()}</span>
                                    </div>
                                    <div className="px-6 py-4 flex justify-between items-center text-sm">
                                        <span className="text-[var(--muted-foreground)]">Development Levy (4%)</span>
                                        <span className="font-mono font-medium">₦{devLevy.toLocaleString()}</span>
                                    </div>
                                    {rndIncentive > 0 && (
                                        <div className="px-6 py-4 flex justify-between items-center text-sm bg-green-50 dark:bg-green-500/5">
                                            <span className="text-green-600 font-medium">R&D Incentive (5%)</span>
                                            <span className="font-mono font-medium text-green-600">-₦{rndIncentive.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="px-6 py-4 flex justify-between items-center bg-[var(--muted)]/30">
                                        <span className="font-bold text-[var(--foreground)]">Total Tax Payable</span>
                                        <span className="font-mono font-black text-lg text-[var(--primary)]">₦{taxLiability.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tax Shield Simulator */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-sm">
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-6 text-[var(--primary)]">
                                        <Calculator size={20} className="md:w-6 md:h-6" />
                                        <h3 className="font-bold text-[var(--foreground)] text-base md:text-lg">Tax Shield Simulator</h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs md:text-sm font-medium text-[var(--muted-foreground)] block mb-2">
                                                Simulate Asset Purchase
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm">₦</span>
                                                <input
                                                    type="number"
                                                    value={shieldAmount || ''}
                                                    onChange={(e) => setShieldAmount(Number(e.target.value))}
                                                    placeholder="Enter amount..."
                                                    className="w-full pl-8 p-2.5 md:p-3 rounded-lg border border-[var(--border)] bg-transparent focus:ring-2 focus:ring-[var(--primary)] outline-none text-sm md:text-base"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-3 md:p-4 bg-[var(--muted)]/50 rounded-xl space-y-3">
                                            <div className="flex justify-between items-center text-xs md:text-sm">
                                                <span className="text-[var(--muted-foreground)]">Capital Allowance (Est. 50%)</span>
                                                <span className="font-mono text-[var(--foreground)]">-₦{simulatedDeduction.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs md:text-sm">
                                                <span className="text-[var(--muted-foreground)]">New CIT Liability</span>
                                                <span className="font-mono text-[var(--foreground)]">₦{simulatedCit.toLocaleString()}</span>
                                            </div>
                                            <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center">
                                                <span className="font-medium text-green-600 text-xs md:text-sm">Potential Tax Savings</span>
                                                <span className="font-mono font-bold text-green-600 text-sm md:text-base">₦{taxSavings.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'forms' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[var(--border)]">
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Tax Filings & Returns</h3>
                            <p className="text-[var(--muted-foreground)] mb-6">
                                Generate your NTA 2025 compliant tax returns. These forms are pre-filled with your data from OpCore.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-[var(--border)] rounded-xl p-4 hover:bg-[var(--muted)] transition group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-lg">
                                            <Building2 size={24} />
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">
                                            Ready to Print
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-[var(--foreground)] mb-1">CIT Return (Companies Income Tax)</h4>
                                    <p className="text-xs text-[var(--muted-foreground)] mb-4">
                                        For Limited Liability Companies. Includes Development Levy computation and Small Company exemption logic.
                                    </p>
                                    <a
                                        href="/print/tax-forms/cit-return"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-bold rounded-lg hover:opacity-90 transition shadow-md hover:shadow-lg transform active:scale-95 duration-200 mt-2"
                                    >
                                        Generate & Print <ArrowRight size={16} />
                                    </a>
                                </div>

                                <div className="border border-[var(--border)] rounded-xl p-4 hover:bg-[var(--muted)] transition group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-500/10 text-purple-600 rounded-lg">
                                            <Shield size={24} />
                                        </div>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded uppercase">
                                            Ready to Print
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-[var(--foreground)] mb-1">VAT Return (Form 002)</h4>
                                    <p className="text-xs text-[var(--muted-foreground)] mb-4">
                                        Monthly Value Added Tax return for vatable services and goods. Required for businesses with turnover ≥ ₦25M.
                                    </p>
                                    <a
                                        href="/print/tax-forms/vat-return"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-bold rounded-lg hover:opacity-90 transition shadow-md hover:shadow-lg transform active:scale-95 duration-200 mt-2"
                                    >
                                        Generate & Print <ArrowRight size={16} />
                                    </a>
                                </div>
                            </div>

                            {/* Filing History */}
                            {filings && filings.length > 0 && (
                                <div className="mt-8 border-t border-[var(--border)] pt-8">
                                    <h4 className="font-bold text-[var(--foreground)] mb-4">Filing History</h4>
                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-[var(--border)] overflow-hidden">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                                                <tr>
                                                    <th className="px-4 py-3 font-medium">Form</th>
                                                    <th className="px-4 py-3 font-medium">Year</th>
                                                    <th className="px-4 py-3 font-medium">Filed On</th>
                                                    <th className="px-4 py-3 font-medium text-right">Tax Paid</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--border)]">
                                                {filings.map((filing: any) => (
                                                    <tr key={filing.id}>
                                                        <td className="px-4 py-3 uppercase font-medium">{filing.formType.replace('-', ' ')}</td>
                                                        <td className="px-4 py-3">{filing.taxYear}</td>
                                                        <td className="px-4 py-3 text-[var(--muted-foreground)]">
                                                            {new Date(filing.filingDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono">
                                                            ₦{Number(filing.totalTaxPaid).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <AutoForms data={{
                            turnover,
                            assessableProfit,
                            totalExpenses: turnover - assessableProfit,
                            taxPayable: taxLiability,
                            companyName: user.businessName || 'Business Name',
                            tin: user.tin || 'NOT SET'
                        }} />
                    </div>
                )}

                {activeTab === 'planner' && (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-[var(--border)] text-center max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-[var(--primary-50)] text-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Smooth Payment Plan</h3>
                        <p className="text-[var(--muted-foreground)] mb-8">
                            Instead of a lump sum, you can spread your ₦{taxLiability.toLocaleString()} liability over 6 months.
                        </p>

                        <div className="flex items-center justify-center gap-4 mb-8">
                            <div className="text-left">
                                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Lump Sum</p>
                                <p className="text-2xl font-bold text-red-500">₦{taxLiability.toLocaleString()}</p>
                            </div>
                            <ArrowRight className="text-[var(--muted-foreground)]" />
                            <div className="text-left">
                                <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Monthly</p>
                                <p className="text-2xl font-bold text-green-600">₦{monthlyPayment.toLocaleString()}</p>
                            </div>
                        </div>

                        <button className="px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-lg hover:opacity-90 transition">
                            Generate Payment Schedule
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
