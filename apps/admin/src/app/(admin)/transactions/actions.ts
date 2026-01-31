'use server';

import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';
import { sendAdminAlert } from '../../../lib/notifications';
import { getAdminUser } from '../../../lib/permissions';

/**
 * Fetch transactions with filters
 */
export async function getTransactions(filters: {
    page?: number;
    search?: string;
    status?: string | null;
    startDate?: string;
    endDate?: string;
}) {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    const page = filters.page || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (filters.search) {
        const search = filters.search.trim();
        // Check if UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(search);

        if (isUUID) {
            where.OR = [
                { id: search },
                { userId: search },
                { refId: search }
            ];
        } else {
            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { payee: { contains: search, mode: 'insensitive' } },
                { refId: { contains: search, mode: 'insensitive' } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
                { user: { businessName: { contains: search, mode: 'insensitive' } } }
            ];
        }
    }

    // Status filter
    if (filters.status === 'archived') {
        where.deletedAt = { not: null };
    } else {
        where.deletedAt = null;
    }

    // Date Range
    if (filters.startDate) {
        where.date = { ...where.date, gte: new Date(filters.startDate) };
    }
    if (filters.endDate) {
        where.date = { ...where.date, lte: new Date(filters.endDate) };
    }

    try {
        const [transactions, total] = await Promise.all([
            db.transaction.findMany({
                where,
                include: {
                    user: {
                        select: { id: true, email: true, businessName: true }
                    }
                },
                orderBy: { date: 'desc' },
                take: limit,
                skip
            }),
            db.transaction.count({ where })
        ]);

        const serializedTransactions = transactions.map(t => ({
            ...t,
            amount: t.amount.toNumber(),
            vatAmount: t.vatAmount ? t.vatAmount.toNumber() : 0,
        }));

        return {
            success: true,
            transactions: serializedTransactions,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                current: page
            }
        };
    } catch (error) {
        console.error('Error fetching admin transactions:', error);
        return { success: false, error: 'Failed to fetch transactions' };
    }
}

/**
 * Override/Edit a transaction
 */
export async function overrideTransaction(id: string, data: any) {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    try {
        const existing = await db.transaction.findUnique({
            where: { id },
            include: { user: true } // Need user for audit details context if needed
        });

        if (!existing) return { success: false, error: 'Transaction not found' };

        await db.transaction.update({
            where: { id },
            data: {
                date: new Date(data.date),
                amount: parseFloat(data.amount),
                type: data.type,
                payee: data.payee,
                description: data.description,
                categoryId: data.categoryId,
                categoryName: data.categoryName,
                isDeductible: data.isDeductible,
                weCompliant: data.weCompliant,
                syncStatus: data.syncStatus,
                vatAmount: data.vatAmount ? parseFloat(data.vatAmount) : 0,
            }
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'TRANSACTION_OVERRIDE',
                resource: 'transaction',
                resourceId: id,
                details: {
                    original: {
                        amount: existing.amount,
                        description: existing.description,
                        isDeductible: existing.isDeductible
                    },
                    new: {
                        amount: data.amount,
                        description: data.description,
                        isDeductible: data.isDeductible
                    }
                }
            }
        });

        await sendAdminAlert(`Transaction Override: ${id}`, {
            level: 'warning',
            details: {
                adminId: admin.userId,
                transactionId: id,
                changes: data
            }
        });

        revalidatePath('/transactions');
        return { success: true };
    } catch (error) {
        console.error('Error overriding transaction:', error);
        return { success: false, error: 'Failed to update transaction' };
    }
}

/**
 * Soft delete (archive) a transaction
 */
export async function softDeleteTransaction(id: string) {
    const admin = await getAdminUser();
    if (!admin) return { success: false, error: 'Unauthorized' };

    try {
        await db.transaction.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        await db.auditLog.create({
            data: {
                userId: admin.userId,
                action: 'TRANSACTION_ARCHIVED',
                resource: 'transaction',
                resourceId: id
            }
        });



        await sendAdminAlert(`Transaction Archived: ${id}`, {
            level: 'warning',
            details: {
                adminId: admin.userId,
                transactionId: id
            }
        });

        revalidatePath('/transactions');
        return { success: true };
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return { success: false, error: 'Failed to delete transaction' };
    }
}
