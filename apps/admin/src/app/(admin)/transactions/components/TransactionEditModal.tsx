'use client';

import { useState } from 'react';
import { X, Loader2, Save } from 'lucide-react';
import { overrideTransaction } from '../actions';

interface TransactionEditModalProps {
    transaction: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function TransactionEditModal({ transaction, onClose, onSuccess }: TransactionEditModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : '',
        amount: transaction.amount,
        type: transaction.type || 'expense',
        payee: transaction.payee || '',
        description: transaction.description || '',
        categoryName: transaction.categoryName || '',
        vatAmount: transaction.vatAmount || 0,
        isDeductible: transaction.isDeductible || false,
        weCompliant: transaction.weCompliant || false,
        syncStatus: transaction.syncStatus || 'synced'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!confirm('This will override the user transaction data and log an audit event. Continue?')) return;

        setLoading(true);
        const res = await overrideTransaction(transaction.id, formData);
        setLoading(false);

        if (res.success) {
            alert('Transaction updated successfully');
            onSuccess();
            onClose();
        } else {
            alert(res.error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Override Transaction</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                            >
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">VAT</label>
                            <input
                                type="number"
                                step="0.01"
                                name="vatAmount"
                                value={formData.vatAmount}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
                        <input
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Payee</label>
                        <input
                            type="text"
                            name="payee"
                            value={formData.payee}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                        <input
                            type="text"
                            name="categoryName"
                            value={formData.categoryName}
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                name="isDeductible"
                                checked={formData.isDeductible}
                                onChange={handleChange}
                                className="rounded bg-slate-900 border-slate-700"
                            />
                            Is Deductible
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                                type="checkbox"
                                name="weCompliant"
                                checked={formData.weCompliant}
                                onChange={handleChange}
                                className="rounded bg-slate-900 border-slate-700"
                            />
                            Tax Compliant
                        </label>
                    </div>

                    <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save Override
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
