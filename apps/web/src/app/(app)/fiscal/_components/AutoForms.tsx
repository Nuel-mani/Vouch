'use client';

import { useState } from 'react';
import { Copy, FileText, Check } from 'lucide-react';

interface AutoFormsProps {
    data: {
        turnover: number;
        assessableProfit: number;
        totalExpenses: number;
        taxPayable: number;
        companyName: string;
        tin: string;
    };
}

export function AutoForms({ data }: AutoFormsProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const renderCopyButton = (value: string | number, id: string) => {
        const textValue = value.toString();
        return (
            <button
                onClick={() => handleCopy(textValue, id)}
                className="ml-2 p-1 text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors"
                title="Copy to clipboard"
            >
                {copiedField === id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
        );
    };

    return (
        <div className="space-y-8">
            {/* CIT Form 001 */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-[var(--border)] overflow-hidden">
                <div className="bg-[var(--muted)]/50 px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-lg">
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--foreground)]">CIT Form 001</h3>
                            <p className="text-xs text-[var(--muted-foreground)]">Companies Income Tax Return</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-6">
                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {[
                            { label: 'Company Name', value: data.companyName, code: 'Section A, L1', id: 'm-company' },
                            { label: 'Tax ID (TIN)', value: data.tin || 'NOT SET', code: 'Section A, L3', id: 'm-tin' },
                            { label: 'Total Revenue', value: `₦${data.turnover.toLocaleString()}`, raw: data.turnover, code: 'Section B, L10', id: 'm-turnover' },
                            { label: 'Deductible Exp.', value: `₦${data.totalExpenses.toLocaleString()}`, raw: data.totalExpenses, code: 'Section B, L25', id: 'm-expenses' },
                            { label: 'Assessing Profit', value: `₦${data.assessableProfit.toLocaleString()}`, raw: data.assessableProfit, code: 'Section C, L40', id: 'm-profit', highlight: true },
                            { label: 'Tax Payable', value: `₦${data.taxPayable.toLocaleString()}`, raw: data.taxPayable, code: 'Section D, L55', id: 'm-tax', primary: true },
                        ].map((item) => (
                            <div key={item.id} className={`p-4 rounded-xl border ${item.primary ? 'bg-blue-600 border-blue-500 text-white' : item.highlight ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' : 'bg-[var(--muted)]/30 border-[var(--border)]'} shadow-sm relative overflow-hidden`}>
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] uppercase font-bold tracking-wider ${item.primary ? 'text-blue-100' : 'text-[var(--muted-foreground)]'}`}>{item.code}</span>
                                    {renderCopyButton(item.raw || item.value, item.id)}
                                </div>
                                <p className={`text-xs font-medium mb-1 ${item.primary ? 'text-blue-100' : 'text-[var(--muted-foreground)]'}`}>{item.label}</p>
                                <p className={`text-xl font-black font-mono ${item.primary || item.highlight ? '' : 'text-[var(--foreground)]'}`}>{item.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-[var(--border)]">
                                <tr className="group hover:bg-[var(--muted)]/30 transition-colors">
                                    <td className="py-3 px-2 text-[var(--muted-foreground)] w-1/3">Section A, L1</td>
                                    <td className="py-3 px-2 font-medium text-[var(--foreground)]">Company Name</td>
                                    <td className="py-3 px-2 text-right font-mono">
                                        {data.companyName}
                                        {renderCopyButton(data.companyName, 'companyName')}
                                    </td>
                                </tr>
                                <tr className="group hover:bg-[var(--muted)]/30 transition-colors">
                                    <td className="py-3 px-2 text-[var(--muted-foreground)]">Section A, L3</td>
                                    <td className="py-3 px-2 font-medium text-[var(--foreground)]">Tax Identity Number (TIN)</td>
                                    <td className="py-3 px-2 text-right font-mono">
                                        {data.tin || 'NOT SET'}
                                        {renderCopyButton(data.tin || '', 'tin')}
                                    </td>
                                </tr>
                                <tr className="group hover:bg-[var(--muted)]/30 transition-colors">
                                    <td className="py-3 px-2 text-[var(--muted-foreground)]">Section B, L10</td>
                                    <td className="py-3 px-2 font-medium text-[var(--foreground)]">Total Revenue (Turnover)</td>
                                    <td className="py-3 px-2 text-right font-mono">
                                        ₦{data.turnover.toLocaleString()}
                                        {renderCopyButton(data.turnover, 'turnover')}
                                    </td>
                                </tr>
                                <tr className="group hover:bg-[var(--muted)]/30 transition-colors">
                                    <td className="py-3 px-2 text-[var(--muted-foreground)]">Section B, L25</td>
                                    <td className="py-3 px-2 font-medium text-[var(--foreground)]">Deductible Expenses</td>
                                    <td className="py-3 px-2 text-right font-mono">
                                        ₦{data.totalExpenses.toLocaleString()}
                                        {renderCopyButton(data.totalExpenses, 'expenses')}
                                    </td>
                                </tr>
                                <tr className="group hover:bg-[var(--muted)]/30 transition-colors bg-blue-50/50 dark:bg-blue-500/5">
                                    <td className="py-3 px-2 text-blue-600 dark:text-blue-400">Section C, L40</td>
                                    <td className="py-3 px-2 font-bold text-blue-700 dark:text-blue-300">Total Assessing Profit</td>
                                    <td className="py-3 px-2 text-right font-mono font-bold text-blue-700 dark:text-blue-300">
                                        ₦{data.assessableProfit.toLocaleString()}
                                        {renderCopyButton(data.assessableProfit, 'profit')}
                                    </td>
                                </tr>
                                <tr className="group hover:bg-[var(--muted)]/30 transition-colors bg-[var(--primary)]/5">
                                    <td className="py-3 px-2 text-[var(--primary)]">Section D, L55</td>
                                    <td className="py-3 px-2 font-bold text-[var(--foreground)]">Total Tax Payable (CIT)</td>
                                    <td className="py-3 px-2 text-right font-mono font-bold text-[var(--primary)]">
                                        ₦{data.taxPayable.toLocaleString()}
                                        {renderCopyButton(data.taxPayable, 'tax')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 p-4 bg-[var(--muted)] rounded-xl text-xs text-[var(--muted-foreground)] flex gap-3">
                        <InfoIcon size={16} className="shrink-0 mt-0.5" />
                        <p className="leading-relaxed">Use these exact values when filing on the TaxPromax portal. Values are automatically derived from your ledger history.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoIcon({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    );
}
