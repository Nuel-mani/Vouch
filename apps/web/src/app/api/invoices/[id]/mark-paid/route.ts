import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await validateSession(token);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch invoice
    const invoice = await db.invoice.findFirst({
        where: { id, userId: user.id },
    });

    if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'paid') {
        return NextResponse.json({ error: 'Invoice already paid' }, { status: 400 });
    }

    // Update invoice status
    await db.invoice.update({
        where: { id },
        data: {
            status: 'paid',
            datePaid: new Date(),
        },
    });

    // Create income transaction
    await db.transaction.create({
        data: {
            userId: user.id,
            date: new Date(),
            type: 'income',
            amount: invoice.amount,
            vatAmount: invoice.vatAmount,
            categoryName: 'Invoice Payment',
            description: `Payment for Invoice #${invoice.serialId}`,
            payee: invoice.customerName,
            invoiceId: id,
            isDeductible: false,
            hasVatEvidence: true,
            weCompliant: true,
        },
    });

    // Revalidate paths
    revalidatePath('/invoices');
    revalidatePath(`/invoices/${id}`);
    revalidatePath('/transactions');
    revalidatePath('/dashboard');

    // Redirect back to invoice
    return NextResponse.redirect(new URL(`/invoices/${id}`, request.url));
}
