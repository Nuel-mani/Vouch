import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Printer, Send, CheckCircle } from 'lucide-react';
import { InvoicePreview } from '../_components/InvoicePreview';
import { PrintButton } from './_components/PrintButton';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) return null;

    // Fetch invoice with user info
    const invoice = await db.invoice.findFirst({
        where: { id, userId: user.id },
    });

    if (!invoice) {
        notFound();
    }

    // Fetch user branding
    const fullUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
            businessName: true,
            businessAddress: true,
            phoneNumber: true,
            email: true,
            brandColor: true,
            logoUrl: true,
            taxIdentityNumber: true,
        },
    });

    const items = JSON.parse(invoice.items as string) as {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/invoices"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Invoice #{invoice.serialId.toString().padStart(4, '0')}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${invoice.status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : invoice.status === 'draft'
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {invoice.status?.toUpperCase() || 'DRAFT'}
                            </span>
                            <span className="text-gray-500 text-sm">
                                Created {invoice.dateIssued ? new Date(invoice.dateIssued).toLocaleDateString() : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {invoice.status !== 'paid' && (
                        <form action={`/api/invoices/${id}/mark-paid`} method="POST">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
                            >
                                <CheckCircle size={16} />
                                Mark Paid
                            </button>
                        </form>
                    )}
                    <a
                        href={`/api/invoices/${id}/pdf`}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                    >
                        <Download size={16} />
                        Download PDF
                    </a>
                    <PrintButton />
                </div>
            </div>

            {/* Invoice Preview */}
            <InvoicePreview
                invoice={{
                    serialId: invoice.serialId,
                    customerName: invoice.customerName || 'Unknown Customer',
                    customerEmail: invoice.customerEmail,
                    customerAddress: invoice.customerAddress,
                    items,
                    amount: Number(invoice.amount),
                    vatAmount: Number(invoice.vatAmount),
                    dateIssued: invoice.dateIssued ? new Date(invoice.dateIssued) : new Date(),
                    dateDue: invoice.dateDue ? new Date(invoice.dateDue) : null,
                    notes: invoice.notes,
                    status: invoice.status || 'draft',
                    proofUrl: invoice.proofUrl,
                }}
                user={{
                    ...fullUser!,
                    businessName: fullUser?.businessName || 'My Business',
                    brandColor: fullUser?.brandColor || '#2252c9',
                    email: fullUser?.email || '',
                }}
            />
        </div>
    );
}
