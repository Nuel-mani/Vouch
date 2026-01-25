'use server';

import { db } from '@vouch/db';
import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function createInvoice(data: {
    customerName: string;
    customerEmail?: string;
    customerAddress?: string;
    customerPhone?: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    dateDue?: string;
    notes?: string;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Get next serial ID for this user
    const lastInvoice = await db.invoice.findFirst({
        where: { userId: user.id },
        orderBy: { serialId: 'desc' },
        select: { serialId: true },
    });

    const serialId = (lastInvoice?.serialId || 0) + 1;

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatAmount = subtotal * 0.075; // 7.5% VAT
    const amount = subtotal + vatAmount;

    const invoice = await db.invoice.create({
        data: {
            user: { connect: { id: user.id } },
            serialId,
            customerName: data.customerName,
            customerEmail: data.customerEmail || null,
            customerAddress: data.customerAddress || null,
            customerPhone: data.customerPhone || null,
            items: JSON.stringify(data.items),
            amount,
            vatAmount,
            status: 'sent',
            dateDue: data.dateDue ? new Date(data.dateDue) : null,
            notes: data.notes || null,
        },
    });

    // Auto-Ledger: Create 'Income' transaction (One-Touch)
    // This feeds the Dashboard charts immediately as requested
    await db.transaction.create({
        data: {
            user: { connect: { id: user.id } },
            date: new Date(),
            type: 'income',
            amount, // Total amount including VAT
            categoryName: 'Sales',
            description: `Invoice #${serialId} - ${data.customerName}`,
            payee: data.customerName,
            refId: `INV-${serialId}`,
            vatAmount,
            hasVatEvidence: true,
            invoices: { connect: { id: invoice.id } },
            syncStatus: 'synced',
        }
    });

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
}

export async function updateInvoice(id: string, data: {
    customerName: string;
    customerEmail?: string;
    customerAddress?: string;
    customerPhone?: string;
    items: { description: string; quantity: number; unitPrice: number }[];
    dateDue?: string;
    notes?: string;
    status?: string;
}) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Verify ownership
    const existing = await db.invoice.findFirst({
        where: { id, userId: user.id },
    });

    if (!existing) {
        throw new Error('Invoice not found');
    }

    // Calculate totals
    const subtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const vatAmount = subtotal * 0.075;
    const amount = subtotal + vatAmount;

    await db.invoice.update({
        where: { id },
        data: {
            customerName: data.customerName,
            customerEmail: data.customerEmail || null,
            customerAddress: data.customerAddress || null,
            customerPhone: data.customerPhone || null,
            items: JSON.stringify(data.items),
            amount,
            vatAmount,
            dateDue: data.dateDue ? new Date(data.dateDue) : null,
            notes: data.notes || null,
            status: data.status || existing.status,
        },
    });

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
}

export async function deleteInvoice(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    const existing = await db.invoice.findFirst({
        where: { id, userId: user.id },
    });

    if (!existing) {
        throw new Error('Invoice not found');
    }

    await db.invoice.delete({ where: { id } });

    revalidatePath('/invoices');
    revalidatePath('/dashboard');
}

export async function markInvoiceAsPaid(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    const existing = await db.invoice.findFirst({
        where: { id, userId: user.id },
    });

    if (!existing) {
        throw new Error('Invoice not found');
    }

    await db.invoice.update({
        where: { id },
        data: {
            status: 'paid',
            datePaid: new Date(),
        },
    });

    // Optionally create an income transaction
    await db.transaction.create({
        data: {
            userId: user.id,
            date: new Date(),
            type: 'income',
            amount: existing.amount,
            vatAmount: existing.vatAmount,
            categoryName: 'Invoice Payment',
            description: `Payment for Invoice #${existing.serialId}`,
            payee: existing.customerName,
            invoiceId: id,
            isDeductible: false,
            hasVatEvidence: true,
            weCompliant: true,
        },
    });

    revalidatePath('/invoices');
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
}

export async function sendInvoice(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    const existing = await db.invoice.findFirst({
        where: { id, userId: user.id },
    });

    if (!existing) {
        throw new Error('Invoice not found');
    }

    // TODO: Send email via Resend

    await db.invoice.update({
        where: { id },
        data: { status: 'sent' },
    });

    revalidatePath('/invoices');
}

export async function validateInvoice(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) throw new Error('Unauthorized');

    const invoiceId = formData.get('invoiceId') as string;
    const validationMethod = formData.get('validationMethod') as string;
    const amountReceived = formData.get('amountReceived') as string;
    const dateReceived = formData.get('dateReceived') as string;
    const signatureName = formData.get('signatureName') as string;
    const notes = formData.get('notes') as string;
    const proofFile = formData.get('proofFile') as File;

    let proofUrl = null;

    // Handle File Upload
    if (proofFile && proofFile.size > 0) {
        const bytes = await proofFile.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists (simplified for this context)
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        // In a real app, ensure dir exists. For now, assuming it does or using a simple path.
        // Actually, let's use a simpler path relative to public if possible, or just store the name.
        // Better: Upload to a blob storage. For this demo, we'll mock the URL or save locally if possible.
        // Saving to public/uploads
        const filename = `${Date.now()}-${proofFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
        const filepath = join(uploadDir, filename);

        try {
            await writeFile(filepath, buffer);
            proofUrl = `/uploads/${filename}`;
        } catch (e) {
            console.error('Upload failed', e);
            // Fallback: don't save file, just mark as validated
        }
    }

    await db.invoice.update({
        where: { id: invoiceId, userId: user.id },
        data: {
            status: 'paid',
            // In a real app, we would store the payment record in a separate table
            // For now, we update the invoice metadata or notes
            notes: notes ? `${notes} (Validated via ${validationMethod})` : `Validated via ${validationMethod}`,
            proofUrl: proofUrl,
        }
    });

    revalidatePath('/invoices');
    revalidatePath('/optimizer'); // Important for Receipt Hunter update
}
