import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { InvoiceForm } from '../_components/InvoiceForm';

export default async function NewInvoicePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) return null;

    // Fetch user branding for preview
    const fullUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
            businessName: true,
            businessAddress: true,
            phoneNumber: true,
            email: true,
            brandColor: true,
            logoUrl: true,
            turnoverBand: true,
        },
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Create Invoice</h1>
                <p className="text-[var(--muted-foreground)] mt-1">Generate a professional invoice for your customer</p>
            </div>


            <InvoiceForm user={fullUser!} />
        </div>
    );
}
