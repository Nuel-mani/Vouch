'use client';

import { useState } from 'react';
import { Pencil, Trash2, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { TransactionEditModal } from './TransactionEditModal';
import { softDeleteTransaction } from '../actions';

// Basic formatter if package not avail
const fmt = (amount: number) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);

export function TransactionTable({ transactions }: { transactions: any[] }) {
    const [editingTx, setEditingTx] = useState<any | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to archive this transaction?')) return;
        const res = await softDeleteTransaction(id);
        if (!res.success) alert(res.error);
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm text-left text-slate-400">
                <thead className="bg-slate-950 text-slate-200 font-medium">
                    <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Description</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-800/50 transition">
                            <td className="p-4 whitespace-nowrap">
                                {new Date(tx.date).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                                <div className="text-white font-medium">{tx.user?.businessName || 'N/A'}</div>
                                <div className="text-xs text-slate-500">{tx.user?.email}</div>
                            </td>
                            <td className="p-4">
                                <div className="text-white truncate max-w-[200px]" title={tx.description}>
                                    {tx.description || tx.narration || '-'}
                                </div>
                                <div className="text-xs text-slate-500">{tx.payee}</div>
                            </td>
                            <td className={`p-4 font-mono font-medium ${tx.type === 'income' ? 'text-green-400' : 'text-slate-200'}`}>
                                {fmt(Number(tx.amount))}
                            </td>
                            <td className="p-4 capitalize">
                                <span className={`px-2 py-1 rounded-full text-xs ${tx.type === 'income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                    }`}>
                                    {tx.type}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center gap-1.5">
                                    {tx.deletedAt ? (
                                        <span className="text-red-500 text-xs flex items-center gap-1"><Trash2 size={12} /> Archived</span>
                                    ) : (
                                        <>
                                            {tx.weCompliant ? (
                                                <span className="text-green-500" title="Compliant"><CheckCircle size={14} /></span>
                                            ) : (
                                                <span className="text-slate-600" title="Not Marked Compliant"><CheckCircle size={14} /></span>
                                            )}
                                            {tx.invoiceId && (
                                                <span className="text-purple-400" title="Has Invoice"><FileText size={14} /></span>
                                            )}
                                        </>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => setEditingTx(tx)}
                                        className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition"
                                        title="Override / Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(tx.id)}
                                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition"
                                        title="Archive"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={7} className="p-8 text-center text-slate-500">
                                No transactions found matching filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {editingTx && (
                <TransactionEditModal
                    transaction={editingTx}
                    onClose={() => setEditingTx(null)}
                    onSuccess={() => { /* revalidation handles sync */ }}
                />
            )}
        </div>
    );
}
