'use client';

import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface RiskyTransaction {
    id: string;
    description: string | null;
    amount: number;
    date: Date;
    hasVatEvidence?: boolean; // Optional for invoices
    receiptUrls?: any;
    type?: 'expense' | 'invoice';
    status?: string;
    actionUrl?: string;
}

interface ReceiptHunterProps {
    riskyTransactions: RiskyTransaction[];
}

import { UploadReceiptModal } from './UploadReceiptModal';
import { useState } from 'react';

export function ReceiptHunter({ riskyTransactions }: ReceiptHunterProps) {
    const isClean = riskyTransactions.length === 0;
    const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

    return (
        <>
            <div className={`rounded-2xl border p-6 transition-all duration-300 ${isClean
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
                : 'bg-white dark:bg-slate-800 border-red-200 dark:border-red-900 shadow-sm'
                }`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                        <h2 className={`text-lg font-bold flex items-center gap-2 ${isClean ? 'text-green-800 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                            {isClean ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                            Receipt Hunter
                        </h2>
                        <p className={`text-sm ${isClean ? 'text-green-700 dark:text-green-500' : 'text-[var(--muted-foreground)]'}`}>
                            {isClean
                                ? "Your high-value transactions are audit-proof. You are bulletproof."
                                : `Found ${riskyTransactions.length} items requiring attention (Risky Expenses or Pending Invoices).`
                            }
                        </p>
                    </div>
                </div>

                {!isClean && (
                    <div className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
                            <div className="flex items-center gap-2 text-red-800 dark:text-red-300 text-sm font-semibold mb-3">
                                <span className="animate-pulse relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                </span>
                                Immediate Action Required
                            </div>
                            <div className="space-y-2">
                                {riskyTransactions.map(tx => (
                                    <div key={tx.id} className="flex justify-between items-center py-2 border-b border-red-100 dark:border-red-800/20 last:border-0">
                                        <div>
                                            <p className="font-medium text-[var(--foreground)]">{tx.description || 'Untitled Transaction'}</p>
                                            <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                                                <span>{new Date(tx.date).toLocaleDateString()}</span>
                                                {tx.type === 'invoice' && (
                                                    <span className="px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 capitalize">
                                                        {tx.status}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-600 dark:text-red-400">
                                                ₦{Number(tx.amount).toLocaleString()}
                                            </p>
                                            {tx.type === 'invoice' ? (
                                                <Link
                                                    href={`/invoices`}
                                                    className="text-xs text-[var(--primary)] hover:underline flex items-center justify-end gap-0.5 mt-0.5"
                                                >
                                                    Validate <ArrowRight size={10} />
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedTxId(tx.id)}
                                                    className="text-xs text-[var(--primary)] hover:underline flex items-center justify-end gap-0.5 mt-0.5 cursor-pointer"
                                                >
                                                    Fix Now <ArrowRight size={10} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {selectedTxId && (
                <UploadReceiptModal
                    transactionId={selectedTxId}
                    onClose={() => setSelectedTxId(null)}
                />
            )}
        </>
    );
}
