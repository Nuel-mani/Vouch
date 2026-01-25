'use client';

import { useState } from 'react';

export function ComplianceCalculator() {
    const [turnover, setTurnover] = useState(20); // in Millions

    const getStatus = (val: number) => {
        if (val <= 25) return {
            status: 'Exempt',
            color: 'text-emerald-500',
            desc: 'You pay ₦0 Company Tax. Use OpCore to prove it.',
            bg: 'bg-emerald-500/10'
        };
        if (val <= 100) return {
            status: 'Small Business',
            color: 'text-amber-500',
            desc: 'You entered the Tax Zone. OpCore can help you optimize deductions.',
            bg: 'bg-amber-500/10'
        };
        return {
            status: 'Company Taxable',
            color: 'text-rose-500',
            desc: 'Full CIT & VAT Compliance required. OpCore is your shield against audits.',
            bg: 'bg-rose-500/10'
        };
    };

    const result = getStatus(turnover);

    return (
        <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-700 max-w-2xl mx-auto transition-colors">
            <h3 className="text-2xl font-black mb-8 text-center text-slate-900 dark:text-white">Tax Liability Preview</h3>

            <div className="space-y-12">
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            Annual Turnover
                        </label>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">
                            ₦{turnover}M
                        </span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="200"
                        step="1"
                        value={turnover}
                        onChange={(e) => setTurnover(parseInt(e.target.value))}
                        className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                    />
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        <span>₦1M</span>
                        <span>₦25M (VAT Threshold)</span>
                        <span>₦200M+</span>
                    </div>
                </div>

                <div className={`p-8 rounded-3xl ${result.bg} transition-colors duration-500 border border-transparent`}>
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${result.color.replace('text', 'bg')}`} />
                        <span className={`text-sm font-black uppercase tracking-widest ${result.color}`}>
                            Status: {result.status}
                        </span>
                    </div>
                    <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                        {result.desc}
                    </p>
                </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-400 font-medium">
                *Preliminary estimation based on Finance Act 2024 & NTA 2025 guidelines.
            </p>
        </div>
    );
}
