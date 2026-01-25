'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, Eye, Pencil, Trash2, Send, Printer, FileText, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { deleteInvoice, markInvoiceAsPaid, validateInvoice } from '../_actions';
import { ValidateInvoiceModal } from './ValidateInvoiceModal';

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: any;
}

interface Invoice {
    id: string;
    serialId: number;
    customerName: string | null;
    customerEmail: string | null;
    amount: any;
    vatAmount: any;
    status: string | null;
    dateIssued: Date | null;
    dateDue: Date | null;
    datePaid: Date | null;
    items: InvoiceItem[];
}

interface InvoiceListProps {
    invoices: Invoice[];
}

const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400',
    sent: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    pending: 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    paid: 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400',
    overdue: 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400',
};

export function InvoiceList({ invoices }: InvoiceListProps) {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [validatingInvoice, setValidatingInvoice] = useState<Invoice | null>(null);

    const getStatus = (invoice: Invoice) => {
        if (invoice.status === 'paid') return 'paid';
        if (invoice.status === 'draft') return 'draft';
        if (invoice.dateDue && new Date(invoice.dateDue) < new Date()) return 'overdue';
        return invoice.status;
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            await deleteInvoice(id);
            setOpenMenuId(null);
        }
    };

    const handleMarkPaid = async (id: string) => {
        await markInvoiceAsPaid(id);
        setOpenMenuId(null);
    };

    const handleValidationSuccess = async (formData: FormData) => {
        await validateInvoice(formData);
        setValidatingInvoice(null);
        // Force client refresh to update badges immediately
        window.location.reload();
    };

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (invoices.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-[var(--border)] p-12 text-center">
                <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--muted-foreground)]">
                    <FileText size={32} />
                </div>
                <p className="font-medium text-[var(--foreground)]">No invoices yet</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">Create your first invoice to start tracking payments.</p>
                <Link
                    href="/invoices/new"
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                >
                    Create Invoice
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-[var(--border)]">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--muted)] border-b border-[var(--border)] text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                <div className="col-span-1">Invoice</div>
                <div className="col-span-3">Customer</div>
                <div className="col-span-1 text-center">Items</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-1"></div>
            </div>

            {/* Invoice Rows */}
            <div className="divide-y divide-[var(--border)]">
                {invoices.map((inv) => {
                    const status = getStatus(inv);
                    const isExpanded = expandedId === inv.id;
                    const subtotal = Number(inv.amount) - Number(inv.vatAmount);

                    return (
                        <div
                            key={inv.id}
                            className={`transition-colors hover:bg-[var(--muted)]/50 ${openMenuId === inv.id ? 'relative z-30' : ''}`}
                        >
                            {/* Main Row */}
                            <div
                                onClick={() => toggleExpand(inv.id)}
                                className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-4 items-center cursor-pointer relative"
                            >
                                {/* Invoice Number & Date (Mobile Group) */}
                                <div className="col-span-2 md:col-span-1 flex justify-start items-center gap-3 md:block">
                                    <span className="font-mono text-sm font-medium text-[var(--foreground)]">
                                        #{inv.serialId.toString().padStart(4, '0')}
                                    </span>
                                    <span className="md:hidden text-xs text-[var(--muted-foreground)]">
                                        • {inv.dateIssued ? new Date(inv.dateIssued).toLocaleDateString('en-NG', {
                                            day: '2-digit', month: '2-digit', year: '2-digit'
                                        }) : '-'}
                                    </span>
                                </div>

                                {/* Customer */}
                                <div className="col-span-2 md:col-span-3">
                                    <p className="font-medium text-[var(--foreground)] truncate">{inv.customerName}</p>
                                    {inv.customerEmail && (
                                        <p className="text-xs text-[var(--muted-foreground)] truncate">{inv.customerEmail}</p>
                                    )}
                                </div>

                                {/* Items Count - Hide on mobile */}
                                <div className="hidden md:block md:col-span-1 text-center">
                                    <span className="text-sm text-[var(--muted-foreground)]">{inv.items.length}</span>
                                </div>

                                {/* Issue Date - Desktop */}
                                <div className="hidden md:block md:col-span-2 text-sm text-[var(--muted-foreground)]">
                                    {inv.dateIssued ? new Date(inv.dateIssued).toLocaleDateString('en-NG', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit'
                                    }) : '-'}
                                </div>

                                {/* Amount */}
                                <div className="col-span-1 md:col-span-2 text-left md:text-right">
                                    <p className="font-bold text-[var(--foreground)]">₦{Number(inv.amount).toLocaleString()}</p>
                                </div>

                                {/* Status */}
                                <div className="col-span-1 md:col-span-2 text-right md:text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status || 'draft']}`}>
                                        {status || 'draft'}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div
                                    className="absolute top-4 right-4 md:static md:col-span-1 flex justify-end z-10"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(`/print/invoices/${inv.id}`, '_blank');
                                        }}
                                        className="inline-flex p-1 text-[var(--primary)] hover:opacity-80 rounded mr-2"
                                        title="Reprint"
                                    >
                                        <Printer size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === inv.id ? null : inv.id);
                                        }}
                                        className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded relative z-10"
                                    >
                                        <MoreVertical size={18} />
                                    </button>

                                    {/* Floating Menu */}
                                    {openMenuId === inv.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setOpenMenuId(null)}
                                            />
                                            <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-[var(--border)] py-1 z-20">
                                                <Link
                                                    href={`/invoices/${inv.id}`}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                                                >
                                                    <Eye size={14} />
                                                    View
                                                </Link>

                                                {(status === 'pending' || status === 'overdue' || status === 'sent') && (
                                                    <button
                                                        onClick={() => {
                                                            setValidatingInvoice(inv);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--primary)] hover:bg-[var(--muted)]"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Validate
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => handleDelete(inv.id)}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <div className="px-6 pb-6 pt-2">
                                    <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-[var(--border)] p-6">
                                        <h4 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-6 border-b border-[var(--border)] pb-2">
                                            Invoice Breakdown
                                        </h4>

                                        {/* Items Table - Header (Hidden on Mobile) */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-medium text-[var(--muted-foreground)] mb-4 px-2">
                                            <div className="col-span-6">Description</div>
                                            <div className="col-span-2 text-center">Qty</div>
                                            <div className="col-span-2 text-right">Amount</div>
                                            <div className="col-span-2 text-right">Total</div>
                                        </div>

                                        <div className="space-y-4 mb-8">
                                            {Array.isArray(inv.items) && inv.items.map((item, index) => (
                                                <div key={item.id || index} className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 text-sm px-2 border-b border-[var(--border)] md:border-0 pb-3 md:pb-0 last:border-0">
                                                    {/* Description */}
                                                    <div className="md:col-span-6 font-medium text-[var(--foreground)]">
                                                        {item.description}
                                                    </div>

                                                    {/* Mobile Details Group */}
                                                    <div className="md:col-span-6 grid grid-cols-3 gap-2 items-center">
                                                        {/* Qty */}
                                                        <div className="text-left md:text-center text-[var(--muted-foreground)] text-xs md:text-sm md:col-span-1">
                                                            <span className="md:hidden font-medium">Qty: </span>{item.quantity}
                                                        </div>
                                                        {/* Unit Price */}
                                                        <div className="text-center md:text-right text-[var(--muted-foreground)] text-xs md:text-sm md:col-span-1">
                                                            <span className="md:hidden font-medium">@ </span>₦{Number(item.unitPrice).toLocaleString()}
                                                        </div>
                                                        {/* Total */}
                                                        <div className="text-right font-medium text-[var(--foreground)] md:col-span-1">
                                                            ₦{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {(!Array.isArray(inv.items) || inv.items.length === 0) && (
                                                <p className="text-center text-sm text-[var(--muted-foreground)] py-4">No line items found.</p>
                                            )}
                                        </div>

                                        {/* Footer Summary */}
                                        <div className="flex flex-col items-end gap-2 border-t border-[var(--border)] pt-6">
                                            <div className="w-full max-w-xs space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[var(--muted-foreground)]">Subtotal</span>
                                                    <span className="font-bold text-[var(--foreground)]">₦{subtotal.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[var(--muted-foreground)]">VAT Paid</span>
                                                    <span className="font-bold text-red-500">
                                                        {Number(inv.vatAmount) > 0 ? `₦${Number(inv.vatAmount).toLocaleString()}` : '-'}
                                                    </span>
                                                </div>

                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 flex justify-between items-center mt-4">
                                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Paid</span>
                                                    <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                                        ₦{Number(inv.amount).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Validation Modal */}
            {validatingInvoice && (
                <ValidateInvoiceModal
                    invoiceId={validatingInvoice.id}
                    invoiceNumber={validatingInvoice.serialId.toString().padStart(4, '0')}
                    amount={Number(validatingInvoice.amount)}
                    isOpen={true}
                    onClose={() => setValidatingInvoice(null)}
                    onValidate={handleValidationSuccess}
                />
            )}
        </div>
    );
}
