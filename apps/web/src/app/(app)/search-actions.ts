'use server';

import { db } from '@vouch/db';
import { validateSession } from '@vouch/auth';
import { cookies } from 'next/headers';

export type SearchResultType = 'transaction' | 'invoice';

export interface SearchResult {
    id: string;
    type: SearchResultType;
    title: string;
    subtitle: string;
    status: string; // "paid", "pending", "expense", "income"
    amount: number;
    date: Date;
    url: string;
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    // We could use validateSession here, but for speed in a search bar, 
    // maybe we assume middleware protected it? 
    // No, server actions are public endpoints technically. Must validate.
    const user = token ? await validateSession(token) : null;
    if (!user) return [];

    const searchTerm = query.trim();
    const isNumeric = !isNaN(Number(searchTerm));

    // Prepare queries
    const txQuery = db.transaction.findMany({
        where: {
            userId: user.id,
            deletedAt: null,
            OR: [
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { payee: { contains: searchTerm, mode: 'insensitive' } },
                { categoryName: { contains: searchTerm, mode: 'insensitive' } },
                // Only search refId if it looks like one, or just general string match
                { refId: { contains: searchTerm, mode: 'insensitive' } }
            ]
        },
        take: 5,
        orderBy: { date: 'desc' },
        select: {
            id: true,
            description: true,
            payee: true,
            amount: true,
            date: true,
            type: true,
            categoryName: true,
        }
    });

    const invFilters: any[] = [
        { customerName: { contains: searchTerm, mode: 'insensitive' } },
        { customerEmail: { contains: searchTerm, mode: 'insensitive' } }
    ];

    if (isNumeric) {
        invFilters.push({ serialId: Number(searchTerm) });
    }

    const invQuery = db.invoice.findMany({
        where: {
            userId: user.id,
            OR: invFilters
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            serialId: true,
            customerName: true,
            amount: true,
            status: true,
            dateIssued: true,
            createdAt: true
        }
    });

    // Execute parallel
    const [transactions, invoices] = await Promise.all([txQuery, invQuery]);

    // Map results
    const results: SearchResult[] = [];

    transactions.forEach(tx => {
        results.push({
            id: tx.id,
            type: 'transaction',
            title: tx.payee || tx.description || 'Unknown Transaction',
            subtitle: tx.categoryName || (tx.type === 'income' ? 'Income' : 'Expense'),
            status: tx.type || 'expense',
            amount: Number(tx.amount),
            date: tx.date,
            url: `/transactions?search=${encodeURIComponent(tx.id)}` // Or better, open modal? For now deep link.
        });
    });

    invoices.forEach(inv => {
        results.push({
            id: inv.id,
            type: 'invoice',
            title: `Invoice #${inv.serialId} - ${inv.customerName || 'Guest'}`,
            subtitle: inv.status || 'Draft',
            status: inv.status || 'draft',
            amount: Number(inv.amount),
            date: inv.dateIssued || inv.createdAt || new Date(),
            url: `/invoices/${inv.id}`
        });
    });

    // Sort combined details by date (newest first)
    return results.sort((a, b) => b.date.getTime() - a.date.getTime());
}
