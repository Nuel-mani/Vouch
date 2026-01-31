import { db } from '@vouch/db';
import { Decimal } from '@prisma/client/runtime/library';

export interface DateRange {
    startDate: Date;
    endDate: Date;
}

export interface FinancialBreakdown {
    total: number;
    categories: Record<string, number>;
}

export interface ProfitAndLossStatement {
    income: FinancialBreakdown;
    expense: FinancialBreakdown;
    netProfit: number;
    period: {
        from: Date;
        to: Date;
    };
    currency: string;
}

/**
 * Generates a Profit and Loss statement for a given user and date range.
 */
export async function generateProfitAndLoss(
    userId: string,
    range: DateRange
): Promise<ProfitAndLossStatement> {
    const { startDate, endDate } = range;

    const transactions = await db.transaction.findMany({
        where: {
            userId,
            deletedAt: null,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            type: true,
            amount: true,
            categoryName: true,
            // currencySymbol removed as it does not exist on Transaction
        },
    });

    const income: FinancialBreakdown = { total: 0, categories: {} };
    const expense: FinancialBreakdown = { total: 0, categories: {} };

    for (const tx of transactions) {
        const amount = tx.amount.toNumber();
        const category = tx.categoryName || 'Uncategorized';

        // Normalize type
        const type = tx.type?.toLowerCase() || 'expense';

        if (type === 'income') {
            income.total += amount;
            income.categories[category] = (income.categories[category] || 0) + amount;
        } else if (type === 'expense') {
            expense.total += amount;
            expense.categories[category] = (expense.categories[category] || 0) + amount;
        }
    }

    // Retrieve user currency symbol
    const user = await db.user.findUnique({
        where: { id: userId },
        select: { currencySymbol: true }
    });

    return {
        income,
        expense,
        netProfit: income.total - expense.total,
        period: {
            from: startDate,
            to: endDate,
        },
        currency: user?.currencySymbol || '₦',
    };
}

/**
 * Generates a summary of monthly cash flow for charts
 */
export async function generateCashFlowTrend(
    userId: string,
    year: number
) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const transactions = await db.transaction.findMany({
        where: {
            userId,
            deletedAt: null,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            type: true,
            amount: true,
            date: true
        }
    });

    const months = Array.from({ length: 12 }, (_, i) => ({
        month: i,
        name: new Date(year, i, 1).toLocaleString('default', { month: 'short' }),
        income: 0,
        expense: 0
    }));

    for (const tx of transactions) {
        const monthIndex = tx.date.getMonth();
        const amount = tx.amount.toNumber();
        const type = tx.type?.toLowerCase() || 'expense';

        if (type === 'income') {
            months[monthIndex].income += amount;
        } else {
            months[monthIndex].expense += amount;
        }
    }

    return months;
}
