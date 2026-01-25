import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { notFound, redirect } from 'next/navigation';
import { mapToFormA, mapToCITReturn, mapToVATReturn } from '@vouch/services';
import { FormAPrint } from '../form-a/FormAPrint';
import { CITReturnPrint } from '../cit-return/CITReturnPrint';
import { VATReturnPrint } from '../vat-return/VATReturnPrint';

interface PageProps {
    params: Promise<{
        type: string;
    }>;
    searchParams: Promise<{
        month?: string;
        year?: string;
    }>;
}

export default async function TaxFormPrintPage({ params, searchParams }: PageProps) {
    const { type } = await params;
    const { month, year } = await searchParams;

    // Default to previous month for VAT, previous year for others
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed (0 = Jan)

    // Determine date range based on form type
    let startDate: Date;
    let endDate: Date;

    if (type === 'vat-return') {
        // Use query params or default to previous month
        const targetMonth = month ? parseInt(month) - 1 : (currentMonth === 0 ? 11 : currentMonth - 1);
        const targetYear = year ? parseInt(year) : (currentMonth === 0 ? currentYear - 1 : currentYear);

        startDate = new Date(targetYear, targetMonth, 1);
        endDate = new Date(targetYear, targetMonth + 1, 0); // Last day of target month
    } else {
        // Form A and CIT Return use previous calendar year
        const targetYear = year ? parseInt(year) : currentYear - 1;
        startDate = new Date(targetYear, 0, 1); // Jan 1st
        endDate = new Date(targetYear, 11, 31); // Dec 31st
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) redirect('/login');

    // Fetch full data needed for forms
    const fullUser = await db.user.findUnique({
        where: { id: user.id },
        include: {
            transactions: {
                where: {
                    date: {
                        gte: startDate,
                        lte: endDate,
                    }
                }
            }
        }
    });

    if (!fullUser) return notFound();

    // Map transactions to match expected type (Decimal -> number)
    const mappedTransactions = fullUser.transactions.map(t => ({
        ...t,
        amount: Number(t.amount),
        type: t.type as 'income' | 'expense',
        isDigitalAsset: t.isDigitalAsset || false,
        vatAmount: t.vatAmount ? Number(t.vatAmount) : 0
    }));

    // Map data based on request type
    if (type === 'form-a') {
        const formData = mapToFormA(fullUser, mappedTransactions);
        return <FormAPrint data={formData} />;
    }

    if (type === 'cit-return') {
        const filingYear = startDate.getFullYear();
        const formData = mapToCITReturn(fullUser, mappedTransactions, filingYear);
        return <CITReturnPrint data={formData} />;
    }

    if (type === 'vat-return') {
        // Pass the actual month/year of the data being displayed
        const displayMonth = startDate.getMonth() + 1;
        const displayYear = startDate.getFullYear();

        const formData = mapToVATReturn(fullUser, mappedTransactions, displayMonth, displayYear);
        return <VATReturnPrint data={formData} />;
    }

    return notFound();
}
