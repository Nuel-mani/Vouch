'use client';

import { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Save, ShieldCheck, HelpCircle } from 'lucide-react';
import { bulkCreateTransactionsJSON } from '../_actions'; // We will need a bulk create action, but for now we might map one by one or add a new action
import { useRouter } from 'next/navigation';

interface ExtractedTransaction {
    id: string;
    date: Date;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    narration: string;
    compliance: {
        isInternalTransfer: boolean;
        isTaxCredit: boolean;
        isBankCharge: boolean;
        isDigitalAsset: boolean;
        flaggedForReview: boolean;
        notes: string[];
    };
}

interface ImportPreviewProps {
    transactions: ExtractedTransaction[];
    onCancel: () => void;
    onSave: () => void;
    accountType: string;
}

export function ImportPreview({ transactions, onCancel, onSave, accountType }: ImportPreviewProps) {
    const [reviewedTransactions, setReviewedTransactions] = useState(
        transactions.map(t => ({ ...t, selected: true }))
    );
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    const handleToggleSelect = (id: string) => {
        setReviewedTransactions(prev => prev.map(t =>
            t.id === id ? { ...t, selected: !t.selected } : t
        ));
    };

    const handleToggleAll = () => {
        const allSelected = reviewedTransactions.every(t => t.selected);
        setReviewedTransactions(prev => prev.map(t => ({ ...t, selected: !allSelected })));
    };

    const handleSave = async () => {
        setSaving(true);
        const toSave = reviewedTransactions.filter(t => t.selected);

        try {
            // Create payload
            const payload = JSON.stringify({
                transactions: toSave.map(t => ({
                    date: t.date,
                    type: t.type,
                    amount: t.amount,
                    description: t.description,
                    narration: t.narration,
                    categoryName: t.compliance.isBankCharge ? 'Bank Charges' :
                        t.compliance.isTaxCredit ? 'Tax Credits' :
                            t.compliance.isDigitalAsset ? 'Digital Assets' : null,
                    isDeductible: t.compliance.isBankCharge || t.type === 'expense',
                    complianceMeta: t.compliance,
                })),
                accountType
            });

            const result = await bulkCreateTransactionsJSON(payload);

            if (result.success) {
                onSave();
                router.refresh();
            } else {
                console.error('Failed to save', result);
                // Show error state?
            }

        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--foreground)]">Review Import</h2>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            {reviewedTransactions.length} transactions extracted • {accountType === 'personal' ? 'Personal' : 'Business'} Account
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-200 flex items-center gap-1">
                            <ShieldCheck size={12} /> NTA 2025 Compliance Active
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-auto flex-1 p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase tracking-wider sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 w-10">
                                    <input
                                        type="checkbox"
                                        checked={reviewedTransactions.length > 0 && reviewedTransactions.every(t => t.selected)}
                                        onChange={handleToggleAll}
                                        className="rounded border-[var(--border)]"
                                    />
                                </th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3">Compliance Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {reviewedTransactions.map((tx) => (
                                <tr key={tx.id} className={`hover:bg-[var(--muted)]/50 transition-colors ${!tx.selected ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={tx.selected}
                                            onChange={() => handleToggleSelect(tx.id)}
                                            className="rounded border-[var(--border)]"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[var(--muted-foreground)]">
                                        {new Date(tx.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-[var(--foreground)] truncate max-w-xs">{tx.description}</p>
                                        <p className="text-xs text-[var(--muted-foreground)] truncate max-w-xs" title={tx.narration}>{tx.narration}</p>
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === 'income' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {tx.compliance.isInternalTransfer && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 w-fit">
                                                    <ShieldCheck size={10} /> Internal Transfer
                                                </span>
                                            )}
                                            {tx.compliance.isTaxCredit && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 w-fit">
                                                    <CheckCircle size={10} /> Tax Credit
                                                </span>
                                            )}
                                            {tx.compliance.isBankCharge && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 w-fit">
                                                    <CheckCircle size={10} /> Deductible Fee
                                                </span>
                                            )}
                                            {tx.compliance.isDigitalAsset && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700 w-fit">
                                                    <AlertTriangle size={10} /> Crypto Asset
                                                </span>
                                            )}
                                            {!tx.compliance.isInternalTransfer && !tx.compliance.isTaxCredit && !tx.compliance.isBankCharge && !tx.compliance.isDigitalAsset && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium text-[var(--muted-foreground)]">
                                                    Standard
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border)] bg-gray-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <div className="text-sm text-[var(--muted-foreground)]">
                        {reviewedTransactions.filter(t => t.selected).length} transactions selected for import
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || reviewedTransactions.filter(t => t.selected).length === 0}
                            className="btn-primary flex items-center gap-2"
                        >
                            {saving ? (
                                <span className="animate-spin">⏳</span>
                            ) : (
                                <Save size={16} />
                            )}
                            Save to Ledger
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
