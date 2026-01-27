'use client';

import { useState } from 'react';
import {
    Shield,
    TrendingUp,
    Info,
    Calendar,
    Building2,
    ArrowRight,
    Calculator
} from 'lucide-react';
import { AutoForms } from './AutoForms';

interface StandbyStateProps {
    turnover: number;
    threshold: number;
    assessableProfit: number;
    deductibleExpenses: number;
    nonDeductibleExpenses: number;
    taxRate: number;
    devLevy: number;
    rndIncentive: number;
    user: any;
    filings: any[];
}

export function StandbyState({
    turnover,
    threshold,
    assessableProfit,
    deductibleExpenses,
    nonDeductibleExpenses,
    taxRate,
    devLevy,
    rndIncentive,
    user,
    filings = []
}: StandbyStateProps) {
    const [shieldAmount, setShieldAmount] = useState<number>(0);
    const [activeTab, setActiveTab] = useState<'overview' | 'forms' | 'planner'>('overview');

    const percentage = Math.min((turnover / threshold) * 100, 100);
    const isWarning = percentage >= 80;

    // Simulation for Tax Shield in Standby Mode (Predictive)
    // Show them what they WOULD save if they were liable, or carry-forward value
    const simulatedDeduction = shieldAmount * 0.5; // 50% initial allowance assumption
    // For small companies, capital allowance can be carried forward indefinitely against future profits when they become liable.
    // So we frame it as "Future Tax Credit"

    const futureTaxRate = 0.30; // Assuming they graduate to large company
    const potentialFutureSavings = simulatedDeduction * futureTaxRate;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-5">
            {/* Minimalist Command Header */}
            <div className="bg-white dark:bg-slate-900 border border-[var(--border)] p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[80px] -mr-32 -mt-32" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-500/10 text-green-600 rounded-xl md:rounded-2xl border border-green-200 dark:border-green-800/30">
                            <Shield size={24} className="md:w-8 md:h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-green-600">Tax Status</span>
                                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            </div>
                            <h2 className="text-xl md:text-3xl font-black text-[var(--foreground)]">Small Company (Exempt)</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-[var(--muted)]/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-[var(--border)]">
                        <div className="text-right">
                            <p className="text-[10px] md:text-xs text-[var(--muted-foreground)] uppercase font-bold tracking-wider">CIT Rate</p>
                            <p className="text-lg md:text-2xl font-black text-green-600">0%</p>
                        </div>
                        <div className="h-8 md:h-10 w-[1px] bg-[var(--border)] mx-1 md:mx-2" />
                        <div className="text-right">
                            <p className="text-[10px] md:text-xs text-[var(--muted-foreground)] uppercase font-bold tracking-wider">Filing Duty</p>
                            <p className="text-lg md:text-xl font-bold text-[var(--foreground)]">Mandatory</p>
                        </div>
                    </div>
                </div>
            </div>

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
                        {/* Turnover Watch */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] p-4 md:p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isWarning ? 'bg-orange-100 text-orange-600' : 'bg-[var(--primary-50)] text-[var(--primary)]'}`}>
                                        <TrendingUp size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--foreground)]">Turnover Watch</h3>
                                        <p className="text-xs text-[var(--muted-foreground)]">Fiscal Year 2026</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-[var(--muted-foreground)]">Threshold</p>
                                    <p className="font-mono font-medium">₦{threshold.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-4 bg-[var(--muted)] rounded-full overflow-hidden mb-2">
                                <div
                                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isWarning ? 'bg-orange-500' : 'bg-green-500'}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className={`font-bold ${isWarning ? 'text-orange-600' : 'text-green-600'}`}>
                                    Current: ₦{turnover.toLocaleString()}
                                </span>
                                <span className="text-[var(--muted-foreground)]">
                                    {percentage.toFixed(1)}% to limit
                                </span>
                            </div>

                            {/* Warning Message */}
                            {isWarning && (
                                <div className="mt-6 flex gap-3 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl">
                                    <Info className="text-orange-600 shrink-0" size={20} />
                                    <div>
                                        <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">Approaching Tax Cliff</p>
                                        <p className="text-sm text-orange-600/90 dark:text-orange-400/90 mt-1">
                                            You are close to the ₦25M threshold. Once crossed, you will be required to file CIT (20%) and VAT returns.
                                            The Fiscal Engine will automatically switch to "Active Mode" to help you prepare.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tax Breakdown Preview */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] overflow-hidden">
                            <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--muted)]/50">
                                <h3 className="font-bold text-[var(--foreground)]">Tax Liability Breakdown</h3>
                            </div>
                            <div className="divide-y divide-[var(--border)]">
                                <div className="px-6 py-4 flex justify-between items-center text-sm">
                                    <span className="text-[var(--muted-foreground)]">Companies Income Tax (Exempt)</span>
                                    <span className="font-mono font-medium text-green-600">₦0.00</span>
                                </div>
                                <div className="px-6 py-4 flex justify-between items-center text-sm">
                                    <span className="text-[var(--muted-foreground)]">Development Levy (Exempt)</span>
                                    <span className="font-mono font-medium text-green-600">₦0.00</span>
                                </div>
                                <div className="px-6 py-4 flex justify-between items-center bg-[var(--muted)]/30">
                                    <span className="font-bold text-[var(--foreground)]">Total Tax Payable</span>
                                    <span className="font-mono font-black text-lg text-green-600">₦0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'forms' && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[var(--border)]">
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">Annual Returns</h3>
                            <p className="text-[var(--muted-foreground)] mb-6">
                                Even as a Small Company exempt from tax, you are <strong>mandated by law</strong> to file annual returns (Nil Returns) to FIRS.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="border border-[var(--border)] rounded-xl p-4 hover:bg-[var(--muted)] transition group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-lg">
                                            <Building2 size={24} />
                                        </div>
                                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase">
                                            Ready
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-[var(--foreground)] mb-1">CIT Return (Nil Return)</h4>
                                    <p className="text-xs text-[var(--muted-foreground)] mb-4">
                                        Annual Companies Income Tax return declaring ₦{assessableProfit.toLocaleString()} profit but ₦0 tax liability due to small company status.
                                    </p>
                                    <a
                                        href="/print/tax-forms/cit-return"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-bold rounded-lg hover:opacity-90 transition shadow-md hover:shadow-lg transform active:scale-95 duration-200 mt-2"
                                    >
                                        Generate Nil Return <ArrowRight size={16} />
                                    </a>
                                </div>

                                <div className="border border-[var(--border)] rounded-xl p-4 hover:bg-[var(--muted)] transition group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-100 dark:bg-purple-500/10 text-purple-600 rounded-lg">
                                            <Shield size={24} />
                                        </div>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded uppercase">
                                            Not Required
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-[var(--foreground)] mb-1">VAT Return</h4>
                                    <p className="text-xs text-[var(--muted-foreground)] mb-4">
                                        You are below the ₦25M VAT threshold. Filing is optional but good for records.
                                    </p>
                                    <button
                                        disabled
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--muted)] text-[var(--muted-foreground)] text-sm font-bold rounded-lg cursor-not-allowed mt-2"
                                    >
                                        Not Required
                                    </button>
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
                            taxPayable: 0,
                            companyName: user.businessName || 'Business Name',
                            tin: user.tin || 'NOT SET'
                        }} />
                    </div>
                )}

                {activeTab === 'planner' && (
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-[var(--border)]">
                        <div className="flex items-center gap-3 mb-6 text-[var(--primary)]">
                            <Calculator size={20} className="md:w-6 md:h-6" />
                            <h3 className="font-bold text-[var(--foreground)] text-base md:text-lg">Tax Shield Simulator (Future Planning)</h3>
                        </div>

                        <p className="text-sm text-[var(--muted-foreground)] mb-6">
                            Since you pay 0% tax now, capital allowances on assets you buy can often be <strong>carried forward</strong>.
                            Simulate how much "Future Tax Credit" you are banking by investing in assets today.
                        </p>

                        <div className="space-y-4 max-w-lg">
                            <div>
                                <label className="text-xs md:text-sm font-medium text-[var(--muted-foreground)] block mb-2">
                                    Simulate Asset Purchase (Machinery/Equipment)
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

                            <div className="p-4 bg-[var(--muted)]/50 rounded-xl space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--muted-foreground)]">Capital Allowance (Est. 50%)</span>
                                    <span className="font-mono text-[var(--foreground)]">₦{simulatedDeduction.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-[var(--muted-foreground)]">Assumed Future Tax Rate</span>
                                    <span className="font-mono text-[var(--foreground)]">30%</span>
                                </div>
                                <div className="border-t border-[var(--border)] pt-3 flex justify-between items-center">
                                    <span className="font-medium text-green-600 text-sm">Potential Future Tax Credit</span>
                                    <span className="font-mono font-bold text-green-600 text-base">₦{potentialFutureSavings.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
