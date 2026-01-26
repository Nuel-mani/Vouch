import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { notFound } from 'next/navigation';
import { InvoicePreview } from '../../../(app)/invoices/_components/InvoicePreview';
import { AutoPrint } from './AutoPrint';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function PrintInvoicePage({ params }: PageProps) {
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

    // Parse items safely
    let items = [];
    try {
        if (Array.isArray(invoice.items)) {
            items = invoice.items;
        } else if (typeof invoice.items === 'string') {
            items = JSON.parse(invoice.items);
        }
    } catch (e) {
        // Fallback to empty if parse fails
    }

    return (
        <div className="min-h-screen bg-white p-0 md:p-8 flex justify-center items-start">
            <AutoPrint />
            <div className="w-full max-w-4xl">
                <InvoicePreview
                    invoice={{
                        serialId: invoice.serialId,
                        customerName: invoice.customerName || 'Unknown Customer',
                        customerEmail: invoice.customerEmail,
                        customerAddress: invoice.customerAddress,
                        items: items as any[],
                        amount: Number(invoice.amount),
                        vatAmount: Number(invoice.vatAmount),
                        dateIssued: invoice.dateIssued || new Date(),
                        dateDue: invoice.dateDue,
                        notes: invoice.notes,
                        status: invoice.status || 'draft',
                    }}
                    user={{
                        ...fullUser!,
                        email: fullUser!.email || '',
                        brandColor: fullUser!.brandColor || '#2252c9',
                        taxIdentityNumber: fullUser!.taxIdentityNumber
                    }}
                />
            </div>

            {/* Return link for safety - hidden on print */}
            <div className="fixed top-4 right-4 print:hidden">
                <a
                    href="/invoices"
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm font-medium shadow-sm transition border border-gray-300"
                >
                    Back to Invoices
                </a>
            </div>
        </div>
    );
}
