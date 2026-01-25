'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, CheckCircle, FileText, Eye } from 'lucide-react';
import { createInvoice } from '../_actions';

interface InvoiceFormProps {
    user: {
        businessName: string | null;
        businessAddress: string | null;
        phoneNumber: string | null;
        email: string | null;
        brandColor: string | null;
        logoUrl: string | null;
        turnoverBand: string | null;
    };
}

interface LineItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export function InvoiceForm({ user }: InvoiceFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [invoiceId, setInvoiceId] = useState('');
    const [today, setToday] = useState('');
    const [minDate, setMinDate] = useState('');

    useEffect(() => {
        setInvoiceId(String(Date.now()).slice(-4));
        setToday(new Date().toLocaleDateString());
        setMinDate(new Date().toISOString().split('T')[0]);
    }, []);

    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [dateDue, setDateDue] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<LineItem[]>([
        { id: '1', description: '', quantity: 1, unitPrice: 0 },
    ]);

    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    // NTA 2025 VAT Logic
    const isVatExempt = user.turnoverBand === 'micro' && subtotal <= 25000000;
    const vatRate = isVatExempt ? 0 : 0.075;
    const vatAmount = subtotal * vatRate;
    const total = subtotal + vatAmount;

    // Simple UUID generator for client-side compatibility
    const generateId = () => {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    };

    const addLineItem = () => {
        setItems([...items, { id: generateId(), description: '', quantity: 1, unitPrice: 0 }]);
    };

    const removeLineItem = (id: string) => {
        if (items.length > 1) {
            setItems(items.filter((item) => item.id !== id));
        }
    };

    const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
        setItems(
            items.map((item) =>
                item.id === id ? { ...item, [field]: value } : item
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createInvoice({
                customerName,
                customerEmail,
                customerAddress,
                customerPhone,
                items: items.map(({ description, quantity, unitPrice }) => ({
                    description,
                    quantity,
                    unitPrice,
                })),
                dateDue,
                notes,
            });

            setSuccess(true);
            setTimeout(() => {
                router.push('/invoices');
            }, 1500);
        } catch (error) {
            console.error('Error creating invoice:', error);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                    <CheckCircle size={32} />
                </div>
                <p className="font-medium text-green-800 dark:text-green-400 text-lg">Invoice created successfully!</p>
                <p className="text-sm text-green-600 dark:text-green-500 mt-1">Redirecting to invoices...</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form - Takes up 3 cols (60%) for wide inputs */}
            <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-6">
                {/* Customer Details */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h3 className="font-semibold text-[var(--foreground)]">Customer Details</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                Customer Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                placeholder="John Doe or Company Ltd"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                placeholder="customer@email.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                Address
                            </label>
                            <textarea
                                value={customerAddress}
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                placeholder="Street address, city, state"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                placeholder="+234..."
                            />
                        </div>
                    </div>
                </div>

                {/* Line Items */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center">
                        <h3 className="font-semibold text-[var(--foreground)]">Line Items</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {/* Hidden headers for accessibility/layout structure if needed, but matching the clean image design */}
                        <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-1 text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                            <div className="col-span-7">Description</div>
                            <div className="col-span-2">Qty</div>
                            <div className="col-span-3">Price</div>
                        </div>

                        {items.map((item) => (
                            <div key={item.id} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                                {/* Description */}
                                <div className="col-span-1 sm:col-span-7">
                                    <label className="block sm:hidden text-xs font-medium mb-1 text-[var(--muted-foreground)]">Description</label>
                                    <input
                                        type="text"
                                        required
                                        value={item.description}
                                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                        className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                                        placeholder="Description"
                                    />
                                </div>

                                {/* Quantity */}
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block sm:hidden text-xs font-medium mb-1 text-[var(--muted-foreground)]">Qty</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={item.quantity}
                                        onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-center text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                                        placeholder="1"
                                    />
                                </div>

                                {/* Price */}
                                <div className="col-span-1 sm:col-span-3 flex items-center gap-3">
                                    <div className="relative w-full">
                                        <label className="block sm:hidden text-xs font-medium mb-1 text-[var(--muted-foreground)]">Price</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            value={item.unitPrice || ''}
                                            onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-right text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] transition-all placeholder:text-[var(--muted-foreground)]"
                                            placeholder="0"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeLineItem(item.id)}
                                        className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors shrink-0"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addLineItem}
                            className="inline-flex items-center gap-1 text-[var(--primary)] hover:opacity-80 font-medium px-1 pt-2"
                        >
                            <Plus size={18} />
                            Add Line Item
                        </button>

                        {/* Totals */}
                        <div className="border-t border-[var(--border)] pt-4 mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--muted-foreground)]">Subtotal</span>
                                <span className="font-medium text-[var(--foreground)]">₦{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--muted-foreground)]">VAT ({vatRate * 100}%) {isVatExempt && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Exempt</span>}</span>
                                <span className="font-medium text-[var(--foreground)]">₦{vatAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg pt-2 border-t border-[var(--border)]">
                                <span className="font-semibold text-[var(--foreground)]">Total</span>
                                <span className="font-bold text-[var(--foreground)]">₦{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h3 className="font-semibold text-[var(--foreground)]">Additional Details</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={dateDue}
                                onChange={(e) => setDateDue(e.target.value)}
                                min={minDate}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                placeholder="Payment terms, bank details, thank you message..."
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 text-[var(--foreground)] font-medium hover:bg-[var(--muted)] rounded-xl transition"
                    >
                        Cancel
                    </button>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--muted)] text-[var(--foreground)] font-medium rounded-xl hover:bg-[var(--border)] transition lg:hidden"
                        >
                            <Eye size={18} />
                            Preview
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !customerName || items.some((i) => !i.description)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-xl hover:opacity-90 transition disabled:opacity-50"
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? 'Creating...' : 'Create Invoice'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Live Preview - keeping white bg for invoice appearance */}
            <div className={`${showPreview ? 'block' : 'hidden'} lg:block lg:col-span-2`}>
                <div className="sticky top-8">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500">LIVE PREVIEW</span>
                            <FileText size={14} className="text-gray-400" />
                        </div>

                        {/* Invoice Preview */}
                        <div className="p-6 text-sm" style={{ fontSize: '11px' }}>
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    {user.logoUrl ? (
                                        <img src={user.logoUrl || undefined} alt="Logo" className="w-12 h-12 object-contain" />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                            style={{ backgroundColor: user.brandColor || '#2252c9' }}
                                        >
                                            {(user.businessName?.[0] || 'O').toUpperCase()}
                                        </div>
                                    )}
                                    <p className="font-bold mt-2" style={{ color: user.brandColor || '#2252c9' }}>
                                        {user.businessName || 'Your Business'}
                                    </p>
                                    <p className="text-gray-500 text-xs">{user.businessAddress || 'Address'}</p>
                                    <p className="text-gray-500 text-xs">{user.phoneNumber || 'Phone'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold" style={{ color: user.brandColor || '#2252c9' }}>INVOICE</p>
                                    <p className="text-gray-500">#{invoiceId || '0000'}</p>
                                    <p className="text-gray-500">{today || 'Date'}</p>
                                </div>
                            </div>

                            {/* Bill To */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bill To</p>
                                <p className="font-medium text-gray-900">{customerName || 'Customer Name'}</p>
                                {customerEmail && <p className="text-gray-500">{customerEmail}</p>}
                                {customerAddress && <p className="text-gray-500">{customerAddress}</p>}
                                {customerPhone && <p className="text-gray-500">{customerPhone}</p>}
                            </div>

                            {/* Items Table */}
                            <table className="w-full mb-4">
                                <thead>
                                    <tr className="border-b border-gray-200" style={{ backgroundColor: (user.brandColor || '#2252c9') + '10' }}>
                                        <th className="text-left py-2 px-2 text-gray-700">Item</th>
                                        <th className="text-center py-2 px-2 text-gray-700">Qty</th>
                                        <th className="text-right py-2 px-2 text-gray-700">Price</th>
                                        <th className="text-right py-2 px-2 text-gray-700">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item) => (
                                        <tr key={item.id} className="border-b border-gray-100">
                                            <td className="py-2 px-2 text-gray-900">{item.description || '-'}</td>
                                            <td className="py-2 px-2 text-center text-gray-900">{item.quantity}</td>
                                            <td className="py-2 px-2 text-right text-gray-900">₦{item.unitPrice.toLocaleString()}</td>
                                            <td className="py-2 px-2 text-right font-medium text-gray-900">
                                                ₦{(item.quantity * item.unitPrice).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="flex justify-end">
                                <div className="w-48 space-y-1">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>₦{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>VAT ({vatRate * 100}%)</span>
                                        <span>₦{vatAmount.toLocaleString()}</span>
                                    </div>
                                    <div
                                        className="flex justify-between font-bold pt-1 border-t text-gray-900"
                                        style={{ borderColor: user.brandColor || '#2252c9' }}
                                    >
                                        <span>Total</span>
                                        <span style={{ color: user.brandColor || '#2252c9' }}>₦{total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Due Date & Notes */}
                            {(dateDue || notes) && (
                                <div className="mt-4 pt-4 border-t border-gray-100 text-xs">
                                    {dateDue && (
                                        <p className="text-gray-500">
                                            <span className="font-medium">Due Date:</span> {new Date(dateDue).toLocaleDateString()}
                                        </p>
                                    )}
                                    {notes && <p className="text-gray-500 mt-1">{notes}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
