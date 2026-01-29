'use client';

import { useState } from 'react';
import { X, Loader2, Upload, FileText, Image as ImageIcon, Trash2, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { updateTransaction } from '../_actions';
import { useRouter } from 'next/navigation';

interface EditTransactionModalProps {
    transaction: any;
    userBusinessName?: string | null;
    onClose: () => void;
}

// Categories matching the Add Transaction page
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

export function EditTransactionModal({ transaction, userBusinessName, onClose }: EditTransactionModalProps) {
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [removedReceipts, setRemovedReceipts] = useState<string[]>([]);
    const [newFile, setNewFile] = useState<File | null>(null);
    const router = useRouter();

    // Transaction type state (allows reclassification)
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
        transaction.type === 'expense' ? 'expense' : 'income'
    );

    // Category state (to properly handle controlled select)
    const [selectedCategory, setSelectedCategory] = useState<string>(transaction.categoryName || '');

    // Filter categories based on selected type
    const filteredCategories = categories.filter(
        (c) => c.type === transactionType || c.type === 'both'
    );

    // When type changes, reset category if current selection is not valid for new type
    const handleTypeChange = (newType: 'income' | 'expense') => {
        setTransactionType(newType);
        // Check if current category is still valid for new type
        const validCategory = categories.find(
            c => c.name === selectedCategory && (c.type === newType || c.type === 'both')
        );
        if (!validCategory) {
            setSelectedCategory(''); // Reset category if not valid for new type
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setNewFile(file);
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => setPreview(reader.result as string);
                reader.readAsDataURL(file);
            } else {
                setPreview(null);
            }
        }
    };

    const toggleRemoveReceipt = (url: string) => {
        setRemovedReceipts(prev =>
            prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        // Set the transaction type from state
        formData.set('type', transactionType);

        try {
            await updateTransaction(transaction.id, formData);
            router.refresh();
            onClose();
        } catch (error) {
            console.error('Failed to update transaction:', error);
            alert('Failed to update transaction');
        } finally {
            setLoading(false);
        }
    };


    // Initialize state with default values or from transaction
    const [amount, setAmount] = useState<string>(transaction.amount?.toString() || '');
    const [vatAmount, setVatAmount] = useState<string>(transaction.vatAmount?.toString() || '');

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = e.target.value;
        setAmount(newAmount);

        // Auto-calculate VAT (7.5%)
        if (newAmount && !isNaN(parseFloat(newAmount))) {
            const calculatedVat = (parseFloat(newAmount) * 0.075).toFixed(2);
            setVatAmount(calculatedVat);
        } else {
            setVatAmount('');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-300 border border-gray-200 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Edit Transaction</h3>
                        <p className="text-sm text-gray-500">Update transaction details.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <input type="hidden" name="date" value={new Date(transaction.date).toISOString()} />

                    {/* Transaction Type Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Transaction Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleTypeChange('income')}
                                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${transactionType === 'income'
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <TrendingUp size={18} />
                                <span className="font-medium">Income</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange('expense')}
                                className={`p-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all ${transactionType === 'expense'
                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                                    : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                <TrendingDown size={18} />
                                <span className="font-medium">Expense</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            name="description"
                            defaultValue={transaction.description || ''}
                            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Amount (₦)
                            </label>
                            <input
                                type="number"
                                name="amount"
                                step="0.01"
                                value={amount}
                                onChange={handleAmountChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                VAT Paid (₦)
                            </label>
                            <input
                                type="number"
                                name="vatAmount"
                                step="0.01"
                                value={vatAmount}
                                onChange={(e) => setVatAmount(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category
                            </label>
                            <select
                                name="categoryName"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select category...</option>
                                {filteredCategories.map((cat) => (
                                    <option key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Payment Method
                            </label>
                            <select
                                name="paymentMethod"
                                defaultValue={transaction.paymentMethod || ''}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select...</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="mobile_money">Mobile Money</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Payee (Business)
                            </label>
                            <input
                                type="text"
                                name="payee"
                                defaultValue={transaction.payee || userBusinessName || ''}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Authorized By
                            </label>
                            <input
                                type="text"
                                name="authorizedBy"
                                defaultValue={transaction.authorizedBy || ''}
                                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Receipt Management */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Receipts & Evidence
                        </label>

                        {/* Current Receipts */}
                        {transaction.receiptUrls && transaction.receiptUrls.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                                {transaction.receiptUrls.map((url: string, idx: number) => {
                                    const isRemoved = removedReceipts.includes(url);
                                    return (
                                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 dark:border-slate-800">
                                            <img src={url} alt="Receipt" className={`w-full h-full object-cover transition-opacity ${isRemoved ? 'opacity-30' : ''}`} />
                                            {isRemoved && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Removing</span>
                                                </div>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => toggleRemoveReceipt(url)}
                                                className={`absolute top-1 right-1 p-1 rounded-full shadow-sm transition-colors ${isRemoved ? 'bg-blue-500 text-white' : 'bg-red-500 text-white opacity-0 group-hover:opacity-100'
                                                    }`}
                                            >
                                                {isRemoved ? <RotateCcw size={12} /> : <X size={12} />}
                                            </button>
                                            {isRemoved && <input type="hidden" name="removedReceipts" value={url} />}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* New Receipt Upload */}
                        <div className="flex gap-4 items-start">
                            <div className="flex-1">
                                <label className="relative flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                                    <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover:scale-110 transition-transform">
                                        <Upload size={18} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                        {newFile ? 'Replace new file' : 'Add new receipt'}
                                    </span>
                                    <input
                                        type="file"
                                        name="receiptFile"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            {newFile && (
                                <div className="w-24 aspect-square relative rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/10 overflow-hidden flex items-center justify-center">
                                    {preview ? (
                                        <img src={preview} alt="New Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="text-blue-500" size={24} />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => { setNewFile(null); setPreview(null); }}
                                        className="absolute top-1 right-1 p-1 bg-white/80 dark:bg-slate-800/80 rounded-full text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Audit Readiness Options */}
                    <div className="flex flex-wrap gap-4 py-2 border-t border-gray-100 dark:border-slate-800 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="weCompliant"
                                defaultChecked={transaction.weCompliant}
                                value="true"
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                NTA 2025 Compliant
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="isDeductible"
                                defaultChecked={transaction.isDeductible}
                                value="true"
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                Deductible Expense
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input
                                type="checkbox"
                                name="hasVatEvidence"
                                defaultChecked={transaction.hasVatEvidence}
                                value="true"
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                                Has VAT Evidence
                            </span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2"
                        >
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
