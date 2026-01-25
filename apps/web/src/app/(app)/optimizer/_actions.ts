'use server';

import { db } from '@vouch/db';
import { validateSession } from '@vouch/auth';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function uploadTransactionReceipt(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const file = formData.get('file') as File;
    const transactionId = formData.get('transactionId') as string;

    if (!file || !transactionId) {
        return { error: 'Missing file or transaction ID' };
    }

    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const filename = `receipt-${transactionId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const filepath = join(uploadDir, filename);

        // Save file locally
        await writeFile(filepath, buffer);
        const fileUrl = `/uploads/${filename}`;

        // Update transaction in DB
        // We'll treat receiptUrls as a JSON array of strings
        const tx = await db.transaction.findUnique({
            where: { id: transactionId },
            select: { receiptUrls: true }
        });

        const currentUrls = (tx?.receiptUrls as string[]) || [];
        const newUrls = [...currentUrls, fileUrl];

        const payee = formData.get('payee') as string | null;
        const authorizedBy = formData.get('authorizedBy') as string | null;

        await db.transaction.update({
            where: { id: transactionId },
            data: {
                receiptUrls: newUrls,
                hasVatEvidence: true,
                ...(payee && { payee }),
                ...(authorizedBy && { authorizedBy }),
            }
        });

        revalidatePath('/optimizer');
        revalidatePath('/transactions');
        revalidatePath('/', 'layout');
        return { success: true, url: fileUrl };

    } catch (error) {
        console.error('Upload error:', error);
        return { error: 'Failed to upload receipt' };
    }
}
