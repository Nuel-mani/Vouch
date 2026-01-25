'use server';

import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function createTransaction(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    const data = {
        userId: user.id,
        date: new Date(formData.get('date') as string),
        type: formData.get('type') as string,
        amount: parseFloat(formData.get('amount') as string),
        vatAmount: formData.get('vatAmount')
            ? parseFloat(formData.get('vatAmount') as string)
            : parseFloat(formData.get('amount') as string) * 0.075,
        categoryId: formData.get('categoryId') as string || null,
        categoryName: formData.get('categoryName') as string || null,
        description: formData.get('description') as string || null,
        payee: formData.get('payee') as string || null,
        authorizedBy: formData.get('authorizedBy') as string || null,
        paymentMethod: formData.get('paymentMethod') as string || null,
        isDeductible: formData.get('isDeductible') === 'true',
        hasVatEvidence: formData.get('hasVatEvidence') === 'true',
        weCompliant: formData.get('weCompliant') === 'true',
    };

    await db.transaction.create({ data });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
}

export async function updateTransaction(id: string, formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Verify ownership
    const existing = await db.transaction.findFirst({
        where: { id, userId: user.id },
    });

    if (!existing) {
        throw new Error('Transaction not found');
    }

    const file = formData.get('receiptFile') as File | null;
    let newReceiptUrls = (existing.receiptUrls as string[]) || [];

    // Handle file upload if present
    if (file && file.size > 0) {
        try {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const uploadDir = join(process.cwd(), 'public/uploads');
            await mkdir(uploadDir, { recursive: true });

            const filename = `receipt-${id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
            const filepath = join(uploadDir, filename);

            await writeFile(filepath, buffer);
            const fileUrl = `/uploads/${filename}`;

            // For now, let's keep it simple and just add to the array
            // If the user wants to *change* (replace all), we could clear it first
            // But usually appending is safer unless specified
            newReceiptUrls = [...newReceiptUrls, fileUrl];
        } catch (error) {
            console.error('File upload error during update:', error);
        }
    }

    // Check if any existing receipts should be removed
    const removedUrls = formData.getAll('removedReceipts') as string[];
    if (removedUrls.length > 0) {
        newReceiptUrls = newReceiptUrls.filter(url => !removedUrls.includes(url));
    }

    await db.transaction.update({
        where: { id },
        data: {
            date: new Date(formData.get('date') as string),
            type: formData.get('type') as string,
            amount: parseFloat(formData.get('amount') as string),
            vatAmount: formData.get('vatAmount')
                ? parseFloat(formData.get('vatAmount') as string)
                : parseFloat(formData.get('amount') as string) * 0.075,
            categoryId: formData.get('categoryId') as string || null,
            categoryName: formData.get('categoryName') as string || null,
            description: formData.get('description') as string || null,
            payee: formData.get('payee') as string || null,
            authorizedBy: formData.get('authorizedBy') as string || null,
            paymentMethod: formData.get('paymentMethod') as string || null,
            isDeductible: formData.get('isDeductible') === 'true',
            hasVatEvidence: (formData.get('hasVatEvidence') === 'true') || (file !== null && file.size > 0),
            weCompliant: formData.get('weCompliant') === 'true',
            receiptUrls: newReceiptUrls,
        },
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
}

export async function deleteTransaction(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Verify ownership
    const existing = await db.transaction.findFirst({
        where: { id, userId: user.id },
    });

    if (!existing) {
        throw new Error('Transaction not found');
    }

    // Soft delete
    await db.transaction.update({
        where: { id },
        data: { deletedAt: new Date() }
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
}

export async function bulkDeleteTransactions(ids: string[]) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Soft delete multiple
    await db.transaction.updateMany({
        where: {
            id: { in: ids },
            userId: user.id,
        },
        data: { deletedAt: new Date() }
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
}

export async function restoreTransaction(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    await db.transaction.update({
        where: { id, userId: user.id },
        data: { deletedAt: null }
    });

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/', 'layout');
}

export async function importBankStatement(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    const file = formData.get('file') as File;
    const accountType = formData.get('accountType') as string; // 'personal' | 'business'

    if (!file || file.size === 0) {
        throw new Error('No file uploaded');
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save for audit
    try {
        const uploadDir = join(process.cwd(), 'public/uploads/statements');
        await mkdir(uploadDir, { recursive: true });
        const filename = `stmt-${user.id}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        await writeFile(join(uploadDir, filename), buffer);
    } catch (e) {
        console.error('Failed to save statement for audit:', e);
    }

    // Dynamic import to avoid bundle issues on client if any
    const { parseBankStatementPDF } = await import('@vouch/services');

    try {
        const transactions = await parseBankStatementPDF(buffer, user.businessName || 'User');
        return { success: true, data: transactions };
    } catch (error: any) {
        console.error('Parsing error:', error);
        return { success: false, error: error.message };
    }
}

export async function bulkCreateTransactionsJSON(json: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    const { transactions, accountType } = JSON.parse(json);

    // [NTA 2025 Compliance] Expense Guardrails
    const CORPORATE_ONLY_KEYWORDS = ['director fee', 'incorporation', 'audit fee', 'head office rent', 'dividend'];

    // Filter out transactions that violate the guardrails or flag them?
    const validatedTransactions = transactions.filter((t: any) => {
        if (accountType === 'personal' && t.type === 'expense') {
            const combined = ((t.description || '') + ' ' + (t.narration || '')).toLowerCase();
            if (CORPORATE_ONLY_KEYWORDS.some(k => combined.includes(k))) {
                console.warn(`[Compliance Block] Skipped corporate expense for personal account: ${t.description}`);
                return false;
            }
        }
        return true;
    });

    // Create many
    const dataToCreate = validatedTransactions.map((t: any) => ({
        userId: user.id,
        date: new Date(t.date),
        type: t.type,
        amount: Number(t.amount),
        description: t.description || t.narration,
        // Using existing fields or the new complianceMeta
        categoryName: t.categoryName,
        isDeductible: t.isDeductible,
        complianceMeta: t.complianceMeta, // The new field
        // Defaults
        vatAmount: t.type === 'expense' && !t.vatAmount ? Number(t.amount) * 0.075 : (t.vatAmount || 0),
    }));

    if (dataToCreate.length > 0) {
        await db.transaction.createMany({
            data: dataToCreate
        });
    }

    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    return { success: true, count: dataToCreate.length, skipped: transactions.length - dataToCreate.length };
}
