'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTransaction, updateTransaction } from '../_actions';
import { TrendingUp, TrendingDown, Loader2, CheckCircle } from 'lucide-react';

interface TransactionFormProps {
    transaction?: {
        id: string;
        date: Date;
        type: string;
        amount: any;
        categoryId: string | null;
        categoryName: string | null;
        description: string | null;
        payee: string | null;
        paymentMethod: string | null;
        isDeductible: boolean;
        hasVatEvidence: boolean;
        weCompliant: boolean;
    };
}

const categories = [
    { id: 'sales', name: 'Sales', type: 'income' },
    { id: 'services', name: 'Services', type: 'income' },
    { id: 'consulting', name: 'Consulting', type: 'income' },
    { id: 'rent_income', name: 'Rent Income', type: 'income' },
    { id: 'rent', name: 'Rent', type: 'expense' },
    { id: 'utilities', name: 'Utilities', type: 'expense' },
    { id: 'supplies', name: 'Office Supplies', type: 'expense' },
    { id: 'transport', name: 'Transport', type: 'expense' },
    { id: 'salaries', name: 'Salaries', type: 'expense' },
    { id: 'marketing', name: 'Marketing', type: 'expense' },
    { id: 'professional', name: 'Professional Fees', type: 'expense' },
    { id: 'other', name: 'Other', type: 'both' },
];

export function TransactionForm({ transaction }: TransactionFormProps) {
    const router = useRouter();
    const [type, setType] = useState(transaction?.type || 'income');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const filteredCategories = categories.filter(
        (c) => c.type === type || c.type === 'both'
    );

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            formData.set('type', type);

            if (transaction) {
                await updateTransaction(transaction.id, formData);
            } else {
                await createTransaction(formData);
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/transactions');
            }, 1000);
        } catch (error) {
            console.error('Error saving transaction:', error);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <p className="font-medium text-green-800">Transaction saved successfully!</p>
                <p className="text-sm text-green-600 mt-1">Redirecting...</p>
            </div>
        );
    }

    return (
        <form action={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Type Selector */}
            <div className="p-6 border-b border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-3">Transaction Type</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition ${type === 'income'
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                    >
                        <TrendingUp size={20} />
                        <span className="font-medium">Income</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition ${type === 'expense'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                    >
                        <TrendingDown size={20} />
                        <span className="font-medium">Expense</span>
                    </button>
                </div>
            </div>

            {/* Form Fields */}
            <div className="p-6 space-y-6">
                {/* Amount & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                        <input
                            name="amount"
                            type="number"
                            step="0.01"
                            required
                            defaultValue={transaction ? Number(transaction.amount) : ''}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            name="date"
                            type="date"
                            required
                            defaultValue={transaction ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                        name="categoryName"
                        required
                        defaultValue={transaction?.categoryName || ''}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select category...</option>
                        {filteredCategories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                        name="description"
                        type="text"
                        defaultValue={transaction?.description || ''}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="What is this transaction for?"
                    />
                </div>

                {/* Payee */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {type === 'income' ? 'Customer / Client' : 'Vendor / Payee'}
                    </label>
                    <input
                        name="payee"
                        type="text"
                        defaultValue={transaction?.payee || ''}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={type === 'income' ? 'Who paid you?' : 'Who did you pay?'}
                    />
                </div>

                {/* Payment Method */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                        name="paymentMethod"
                        defaultValue={transaction?.paymentMethod || ''}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="">Select method...</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="crypto">Cryptocurrency</option>
                    </select>
                </div>

                {/* Tax Compliance (Expense only) */}
                {type === 'expense' && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl space-y-3">
                        <p className="text-sm font-medium text-yellow-800">Tax Compliance (NTA 2025)</p>
                        <label className="flex items-center gap-3">
                            <input
                                name="hasVatEvidence"
                                type="checkbox"
                                defaultChecked={transaction?.hasVatEvidence}
                                value="true"
                                className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">I have VAT receipt/invoice evidence</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                name="weCompliant"
                                type="checkbox"
                                defaultChecked={transaction?.weCompliant}
                                value="true"
                                className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">This expense is wholly & exclusively for business</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <input
                                name="isDeductible"
                                type="checkbox"
                                defaultChecked={transaction?.isDeductible}
                                value="true"
                                className="rounded border-gray-300 text-blue-600"
                            />
                            <span className="text-sm text-gray-700">Mark as tax deductible</span>
                        </label>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? 'Saving...' : transaction ? 'Update' : 'Save Transaction'}
                </button>
            </div>
        </form>
    );
}
