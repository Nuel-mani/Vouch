'use client';

interface InvoicePreviewProps {
    invoice: {
        serialId: number;
        customerName: string;
        customerEmail: string | null;
        customerAddress: string | null;
        items: { description: string; quantity: number; unitPrice: number }[];
        amount: number;
        vatAmount: number;
        dateIssued: Date;
        dateDue: Date | null;
        notes: string | null;
        status: string;
        proofUrl?: string | null;
    };
    user: {
        businessName: string | null;
        businessAddress: string | null;
        phoneNumber: string | null;
        email: string;
        brandColor: string;
        logoUrl: string | null;
        taxIdentityNumber: string | null;
    };
}

export function InvoicePreview({ invoice, user }: InvoicePreviewProps) {
    const subtotal = invoice.amount - invoice.vatAmount;

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden print:shadow-none print:border-0">
            <div className="p-8 print:p-6" id="invoice-content">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        {user.logoUrl ? (
                            <img src={user.logoUrl} alt="Logo" className="w-16 h-16 object-contain" />
                        ) : (
                            <div
                                className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-2xl"
                                style={{ backgroundColor: user.brandColor }}
                            >
                                {(user.businessName?.[0] || 'O').toUpperCase()}
                            </div>
                        )}
                        <h2 className="font-bold text-xl mt-3" style={{ color: user.brandColor }}>
                            {user.businessName || 'Your Business'}
                        </h2>
                        {user.businessAddress && (
                            <p className="text-gray-500 text-sm mt-1">{user.businessAddress}</p>
                        )}
                        {user.phoneNumber && (
                            <p className="text-gray-500 text-sm">{user.phoneNumber}</p>
                        )}
                        <p className="text-gray-500 text-sm">{user.email}</p>
                        {user.taxIdentityNumber && (
                            <p className="text-gray-500 text-sm">TIN: {user.taxIdentityNumber}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <h1 className="text-3xl font-black" style={{ color: user.brandColor }}>
                            INVOICE
                        </h1>
                        <p className="text-lg font-mono text-gray-600 mt-1">
                            #{invoice.serialId.toString().padStart(4, '0')}
                        </p>
                        <div className="mt-4 text-sm text-gray-500">
                            <p>
                                <span className="font-medium text-gray-700">Date: </span>
                                {new Date(invoice.dateIssued).toLocaleDateString('en-NG', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </p>
                            {invoice.dateDue && (
                                <p>
                                    <span className="font-medium text-gray-700">Due: </span>
                                    {new Date(invoice.dateDue).toLocaleDateString('en-NG', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            )}
                        </div>
                        {invoice.status === 'paid' && (
                            <div
                                className="inline-block mt-4 px-4 py-1 bg-green-100 text-green-700 font-bold text-sm rounded-full"
                            >
                                PAID
                            </div>
                        )}
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-8 p-4 rounded-xl" style={{ backgroundColor: user.brandColor + '08' }}>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Bill To</p>
                    <p className="font-semibold text-gray-900 text-lg">{invoice.customerName}</p>
                    {invoice.customerEmail && (
                        <p className="text-gray-600">{invoice.customerEmail}</p>
                    )}
                    {invoice.customerAddress && (
                        <p className="text-gray-600">{invoice.customerAddress}</p>
                    )}
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr style={{ backgroundColor: user.brandColor + '10' }}>
                            <th className="text-left py-3 px-4 font-semibold text-gray-700 rounded-l-lg">Description</th>
                            <th className="text-center py-3 px-4 font-semibold text-gray-700 w-24">Qty</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700 w-32">Unit Price</th>
                            <th className="text-right py-3 px-4 font-semibold text-gray-700 w-32 rounded-r-lg">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                                <td className="py-3 px-4 text-gray-900">{item.description}</td>
                                <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-3 px-4 text-right text-gray-600">
                                    ₦{item.unitPrice.toLocaleString()}
                                </td>
                                <td className="py-3 px-4 text-right font-medium text-gray-900">
                                    ₦{(item.quantity * item.unitPrice).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-64 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₦{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>VAT (7.5%)</span>
                            <span>₦{invoice.vatAmount.toLocaleString()}</span>
                        </div>
                        <div
                            className="flex justify-between font-bold text-lg pt-2 border-t-2"
                            style={{ borderColor: user.brandColor }}
                        >
                            <span>Total</span>
                            <span style={{ color: user.brandColor }}>₦{invoice.amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Notes & Proof */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {invoice.notes && (
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">Notes</p>
                            <p className="text-gray-600 text-sm whitespace-pre-line">{invoice.notes}</p>
                        </div>
                    )}

                    {invoice.proofUrl && (
                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <p className="text-xs text-blue-500 uppercase tracking-wider font-medium mb-2">Proof of Payment</p>
                            <div className="mt-2">
                                <img
                                    src={invoice.proofUrl}
                                    alt="Payment Proof"
                                    className="max-h-48 rounded-lg shadow-sm cursor-pointer hover:scale-[1.02] transition-transform"
                                    onClick={() => window.open(invoice.proofUrl!, '_blank')}
                                />
                                <p className="text-[10px] text-blue-400 mt-2 italic">* Click image to view full size</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
                    <p>Thank you for your business!</p>
                    <p className="mt-1">
                        Vouched by <span style={{ color: user.brandColor || 'var(--primary)' }}>Vouch</span> • Tax-Compliant Invoice
                    </p>
                </div>
            </div>
        </div>
    );
}
