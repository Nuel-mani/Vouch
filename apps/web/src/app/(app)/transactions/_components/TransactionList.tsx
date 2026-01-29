'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, MoreVertical, Pencil, Trash2, CheckCircle, AlertTriangle, Info, ChevronDown, ChevronUp, FileText, Calendar, User, CreditCard, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { deleteTransaction, bulkDeleteTransactions, restoreTransaction } from '../_actions';
import { EditTransactionModal } from './EditTransactionModal';
import { UploadReceiptModal } from '../../optimizer/_components/UploadReceiptModal';
import { useRouter } from 'next/navigation';
import type { Transaction } from '@vouch/types';

interface TransactionListProps {
    transactions: Transaction[];
    userBusinessName?: string | null;
}

export function TransactionList({ transactions, userBusinessName }: TransactionListProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [uploadingTxId, setUploadingTxId] = useState<string | null>(null);
    const router = useRouter();

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === transactions.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(transactions.map((t) => t.id)));
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleRestore = async (id: string) => {
        await restoreTransaction(id);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this transaction? It will be archived for 15 days.')) {
            await deleteTransaction(id);
            setOpenMenuId(null);
            router.refresh();
        }
    };

    const handleBulkDelete = async () => {
        const count = selectedIds.size;
        if (confirm(`Are you sure you want to delete ${count} transactions? They will be archived for 15 days.`)) {
            await bulkDeleteTransactions(Array.from(selectedIds));
            setSelectedIds(new Set());
            router.refresh();
        }
    };

    if (transactions.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-[var(--border)] p-12 text-center">
                <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--muted-foreground)]">
                    <TrendingUp size={32} />
                </div>
                <p className="font-medium text-[var(--foreground)]">No transactions found</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">Try adjusting your filters or add a new transaction.</p>
            </div>
        );
    }

    // Group transactions by month/year
    const groupedTransactions = transactions.reduce((groups, tx) => {
        const date = new Date(tx.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-NG', { month: 'long', year: 'numeric' });

        if (!groups[monthYear]) {
            groups[monthYear] = { label, transactions: [] };
        }
        groups[monthYear].transactions.push(tx);
        return groups;
    }, {} as Record<string, { label: string; transactions: Transaction[] }>);

    // Sort groups by date (newest first)
    const sortedGroups = Object.entries(groupedTransactions).sort((a, b) => b[0].localeCompare(a[0]));

    return (
        <>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-[var(--border)] overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--muted)] border-b border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    <div className="col-span-1">
                        <input
                            type="checkbox"
                            checked={selectedIds.size === transactions.length}
                            onChange={toggleSelectAll}
                            className="rounded border-[var(--border)]"
                        />
                    </div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-3">Description</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1"></div>
                </div>

                {/* Transaction Rows Grouped by Month */}
                <div>
                    {sortedGroups.map(([monthKey, { label, transactions: monthTxs }]) => (
                        <div key={monthKey}>
                            {/* Month Header */}
                            <div className="px-6 py-3 bg-gradient-to-r from-[var(--muted)] to-transparent border-b border-[var(--border)] sticky top-0 z-[5]">
                                <h3 className="text-sm font-bold text-[var(--foreground)]">{label}</h3>
                                <p className="text-xs text-[var(--muted-foreground)]">
                                    {monthTxs.length} transaction{monthTxs.length !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Transactions in this month */}
                            <div className="divide-y divide-[var(--border)]">
                                {monthTxs.map((tx) => (
                                    <div key={tx.id} className="transition-colors hover:bg-[var(--muted)]/50">
                                        <div
                                            className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer"
                                            onClick={() => toggleExpand(tx.id)}
                                        >
                                            {/* Checkbox */}
                                            <div className="hidden md:block col-span-1" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(tx.id)}
                                                    onChange={() => toggleSelect(tx.id)}
                                                    className="rounded border-[var(--border)]"
                                                />
                                            </div>

                                            {/* Date */}
                                            <div className="col-span-2 text-sm text-[var(--muted-foreground)]">
                                                {new Date(tx.date).toLocaleDateString('en-NG', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </div>

                                            {/* Description */}
                                            <div className="col-span-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'income'
                                                        ? 'bg-green-100 dark:bg-green-500/10 text-green-600'
                                                        : 'bg-red-100 dark:bg-red-500/10 text-red-600'
                                                        }`}>
                                                        {tx.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-[var(--foreground)]">{tx.description || 'Untitled'}</p>
                                                        {tx.payee && <p className="text-xs text-[var(--muted-foreground)]">{tx.payee}</p>}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Category */}
                                            <div className="col-span-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--foreground)]">
                                                    {tx.categoryName || 'Uncategorized'}
                                                </span>
                                            </div>

                                            {/* Amount */}
                                            <div className={`col-span-2 text-right font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'income' ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}
                                            </div>

                                            {/* Compliance Status */}
                                            <div className="col-span-1">
                                                {tx.isDeductible && tx.weCompliant && (() => {
                                                    const hasReceipts = tx.receiptUrls && Array.isArray(tx.receiptUrls) && tx.receiptUrls.length > 0;
                                                    return tx.hasVatEvidence || hasReceipts;
                                                })() ? (
                                                    <span className="text-green-600" title="Tax Compliant">
                                                        <CheckCircle size={18} />
                                                    </span>
                                                ) : tx.type === 'expense' && (() => {
                                                    const hasReceipts = tx.receiptUrls && Array.isArray(tx.receiptUrls) && tx.receiptUrls.length > 0;
                                                    const hasEvidence = tx.hasVatEvidence || hasReceipts;
                                                    return !hasEvidence;
                                                })() ? (
                                                    <span className="text-yellow-500" title="Missing VAT Evidence">
                                                        <AlertTriangle size={18} />
                                                    </span>
                                                ) : tx.type === 'expense' ? (
                                                    <span className="text-blue-500" title="Review for Deductibility">
                                                        <Info size={18} />
                                                    </span>
                                                ) : null}
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-1 text-right relative flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => toggleExpand(tx.id)}
                                                    className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] md:hidden"
                                                >
                                                    {expandedId === tx.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === tx.id ? null : tx.id)}
                                                    className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {tx.deletedAt && (
                                                    <button
                                                        onClick={() => handleRestore(tx.id)}
                                                        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-all shadow-sm border border-amber-200"
                                                    >
                                                        <RotateCcw size={14} />
                                                        Restore
                                                    </button>
                                                )}

                                                {openMenuId === tx.id && (
                                                    <>
                                                        <div
                                                            className="fixed inset-0 z-10"
                                                            onClick={() => setOpenMenuId(null)}
                                                        />
                                                        <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-[var(--border)] py-1 z-20">
                                                            {tx.deletedAt ? (
                                                                <button
                                                                    onClick={() => {
                                                                        handleRestore(tx.id);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 font-medium"
                                                                >
                                                                    <RotateCcw size={14} />
                                                                    Restore
                                                                </button>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            setEditingTransaction(tx);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                                                                    >
                                                                        <Pencil size={14} />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(tx.id)}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Archive Status Banner */}
                                        {tx.deletedAt && (
                                            <div className="px-6 py-1.5 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle size={12} className="text-amber-500" />
                                                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-500 uppercase tracking-wider">
                                                        Archived for Audit Preservation
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-amber-600/80">
                                                    Purge Scheduled: {new Date(new Date(tx.deletedAt).getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}

                                        {/* Expanded Details for Invoice-linked Transactions */}
                                        {expandedId === tx.id && (tx as any).invoice && (
                                            <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2">
                                                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-[var(--border)] p-6">
                                                    <h4 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-6 border-b border-[var(--border)] pb-2">
                                                        Invoice Breakdown
                                                    </h4>

                                                    {/* Items Table Header */}
                                                    <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-medium text-[var(--muted-foreground)] mb-4 px-2">
                                                        <div className="col-span-6">Description</div>
                                                        <div className="col-span-2 text-center">Qty</div>
                                                        <div className="col-span-2 text-right">Amount</div>
                                                        <div className="col-span-2 text-right">Total</div>
                                                    </div>

                                                    <div className="space-y-4 mb-8">
                                                        {Array.isArray((tx as any).invoice.items) && (tx as any).invoice.items.map((item: any, index: number) => (
                                                            <div key={item.id || index} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 text-sm px-2 border-b border-[var(--border)] md:border-0 pb-3 md:pb-0 last:border-0">
                                                                <div className="md:col-span-6 font-medium text-[var(--foreground)]">
                                                                    {item.description}
                                                                </div>
                                                                <div className="md:col-span-6 grid grid-cols-3 gap-2 items-center">
                                                                    <div className="text-left md:text-center text-[var(--muted-foreground)] text-xs md:text-sm">
                                                                        <span className="md:hidden font-medium">Qty: </span>{item.quantity}
                                                                    </div>
                                                                    <div className="text-center md:text-right text-[var(--muted-foreground)] text-xs md:text-sm">
                                                                        <span className="md:hidden font-medium">@ </span>₦{Number(item.unitPrice).toLocaleString()}
                                                                    </div>
                                                                    <div className="text-right font-medium text-[var(--foreground)]">
                                                                        ₦{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {(!Array.isArray((tx as any).invoice.items) || (tx as any).invoice.items.length === 0) && (
                                                            <p className="text-center text-sm text-[var(--muted-foreground)] py-4">No line items found.</p>
                                                        )}
                                                    </div>

                                                    {/* Footer Summary */}
                                                    <div className="flex flex-col items-end gap-2 border-t border-[var(--border)] pt-6">
                                                        <div className="w-full max-w-xs space-y-2">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-[var(--muted-foreground)]">Subtotal</span>
                                                                <span className="font-bold text-[var(--foreground)]">₦{((tx as any).invoice.amount - (tx as any).invoice.vatAmount).toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-[var(--muted-foreground)]">VAT Paid</span>
                                                                <span className="font-bold text-red-500">
                                                                    {(tx as any).invoice.vatAmount > 0 ? `₦${(tx as any).invoice.vatAmount.toLocaleString()}` : '-'}
                                                                </span>
                                                            </div>

                                                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex justify-between items-center mt-4">
                                                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Paid</span>
                                                                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                                                    ₦{(tx as any).invoice.amount.toLocaleString()}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Expanded Details for Transactions (non-invoice) */}
                                        {expandedId === tx.id && !(tx as any).invoice && (
                                            <div className="px-6 pb-6 pt-2 bg-[var(--muted)]/20 border-t border-[var(--border)] grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Details</h4>
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-[var(--muted-foreground)] block">Category</span>
                                                                <span className="font-medium text-[var(--foreground)]">{tx.categoryName || 'N/A'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[var(--muted-foreground)] block">VAT Paid</span>
                                                                <span className="font-medium text-[var(--foreground)]">₦{(Number(tx.vatAmount) || 0).toLocaleString()}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[var(--muted-foreground)] block">Payee</span>
                                                                <span className="font-medium text-[var(--foreground)]">{tx.payee || 'N/A'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-[var(--muted-foreground)] block">Authorized By</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <User size={14} className="text-[var(--muted-foreground)]" />
                                                                    <span className="font-medium text-[var(--foreground)]">{tx.authorizedBy || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-[var(--muted-foreground)] block">Payment Method</span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <CreditCard size={14} className="text-[var(--muted-foreground)]" />
                                                                    <span className="font-medium text-[var(--foreground)] capitalize">{tx.paymentMethod || 'N/A'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Timestamps</h4>
                                                        <div className="text-xs text-[var(--muted-foreground)] space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={12} />
                                                                <span>Created: {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'N/A'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Calendar size={12} />
                                                                <span>Updated: {tx.updatedAt ? new Date(tx.updatedAt).toLocaleString() : 'N/A'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Receipts & Evidence</h4>
                                                    {Array.isArray(tx.receiptUrls) && tx.receiptUrls.length > 0 ? (
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {tx.receiptUrls.map((url: string, index: number) => (
                                                                <a
                                                                    key={index}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="block group relative aspect-video bg-white dark:bg-slate-800 rounded-lg border border-[var(--border)] overflow-hidden hover:border-blue-500 transition-colors"
                                                                >
                                                                    {url.endsWith('.pdf') ? (
                                                                        <div className="flex items-center justify-center h-full text-red-500">
                                                                            <FileText size={24} />
                                                                        </div>
                                                                    ) : (
                                                                        <img src={url} alt={`Receipt ${index + 1}`} className="w-full h-full object-cover" />
                                                                    )}
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-end p-2 opacity-0 group-hover:opacity-100">
                                                                        <span className="text-[10px] items-center bg-black/75 text-white px-1.5 py-0.5 rounded flex gap-1">
                                                                            <FileText size={10} /> View
                                                                        </span>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="border border-dashed border-[var(--border)] rounded-lg p-6 text-center">
                                                            <FileText size={24} className="mx-auto text-[var(--muted-foreground)] mb-2" />
                                                            <p className="text-sm text-[var(--muted-foreground)]">No receipts attached</p>
                                                            <button
                                                                onClick={() => {
                                                                    setUploadingTxId(tx.id);
                                                                }}
                                                                className="mt-2 text-xs text-blue-600 hover:underline"
                                                            >
                                                                Upload Evidence
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bulk Actions */}
                {selectedIds.size > 0 && (
                    <div className="px-6 py-3 bg-[var(--primary-50)] dark:bg-[var(--primary)]/10 border-t border-[var(--primary-100)] flex items-center justify-between">
                        <span className="text-sm text-[var(--primary)]">
                            {selectedIds.size} transaction{selectedIds.size > 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleBulkDelete}
                                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-500/10 rounded transition"
                            >
                                Delete Selected
                            </button>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="px-3 py-1.5 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] rounded transition"
                            >
                                Clear Selection
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {editingTransaction && (
                <EditTransactionModal
                    transaction={editingTransaction}
                    userBusinessName={userBusinessName}
                    onClose={() => setEditingTransaction(null)}
                />
            )}

            {uploadingTxId && (
                <UploadReceiptModal
                    transactionId={uploadingTxId}
                    onClose={() => setUploadingTxId(null)}
                />
            )}
        </>
    );
}
