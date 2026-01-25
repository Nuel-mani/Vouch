import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { calculateCorporateTax, calculateRentRelief } from '@vouch/services';
import { StandbyState } from './_components/StandbyState';
import { ActiveState } from './_components/ActiveState';

export default async function FiscalEnginePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = token ? await validateSession(token) : null;

    if (!user) return null;

    // Fetch transactions for current fiscal year
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // Fetch user details and transactions
    const [fullUser, transactions, filings] = await Promise.all([
        db.user.findUnique({
            where: { id: user.id },
            select: {
                businessName: true,
                isCitExempt: true,
                sector: true,
                taxIdentityNumber: true,
                totalAssets: true,
                isProfessionalService: true,
                accountType: true,
                paysRent: true,
                rentAmount: true,
            }
        }),
        db.transaction.findMany({
            where: {
                userId: user.id,
                date: {
                    gte: startOfYear,
                    lte: endOfYear
                },
                deletedAt: null
            } as any
        }),
        db.taxFiling.findMany({
            where: { userId: user.id },
            orderBy: { filingDate: 'desc' }
        })
    ]);

    if (!fullUser) return null;

    // Calculate Fiscal Metrics
    let turnover = 0;
    let deductibleExpenses = 0;
    let totalExpenses = 0;
    let rndExpenses = 0;

    transactions.forEach(tx => {
        const amount = Number(tx.amount);
        if (tx.type === 'income') {
            turnover += amount;
        } else {
            totalExpenses += amount;

            const hasReceipts = tx.receiptUrls && Array.isArray(tx.receiptUrls) && tx.receiptUrls.length > 0;
            const hasEvidence = tx.hasVatEvidence || hasReceipts;

            if (tx.isDeductible && hasEvidence) {
                deductibleExpenses += amount;
            }
            if (tx.isRndExpense) {
                rndExpenses += amount;
            }
        }
    });

    const assessableProfit = Math.max(0, turnover - deductibleExpenses);

    // Call updated Tax Engine (NTA 2025)
    // Now requires totalAssets and isProfessionalService
    const taxCalc = calculateCorporateTax(
        turnover,
        assessableProfit,
        fullUser.isCitExempt ?? false,
        fullUser.sector ?? undefined,
        Number(fullUser.totalAssets ?? 0),
        fullUser.isProfessionalService ?? false
    );

    const rndIncentive = rndExpenses * 0.05;

    // Active Mode threshold is technically any activity, but staying consistent with previous logic
    // Usually, you'd want to see the dashboard even if small.
    // Let's set it to always active if there's turnover, but the "Small Co" status is handled by taxCalc
    const isActiveMode = turnover > 0;

    // NTA 2025 Rent Relief (20% Cap formula)
    // Only applies to Personal accounts
    let rentRelief = 0;
    if (fullUser.accountType === 'personal' && fullUser.paysRent && fullUser.rentAmount) {
        const { calculateRentRelief } = require('@vouch/services'); // Dynamic import or ensured import at top
        rentRelief = calculateRentRelief(Number(fullUser.rentAmount));
    }

    return (
        <div className="space-y-6 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">Fiscal Engine</h1>
                    <p className="text-xs md:text-sm text-[var(--muted-foreground)] mt-1">
                        Automated Tax Consultant • Finance Act 2024
                    </p>
                </div>
                <div className="self-start md:self-auto px-3 py-1 bg-[var(--muted)] rounded-lg text-[10px] md:text-xs font-mono text-[var(--muted-foreground)] border border-[var(--border)]">
                    Fiscal Year: {currentYear}
                </div>
            </div>

            {isActiveMode ? (
                <ActiveState
                    turnover={turnover}
                    assessableProfit={assessableProfit}
                    deductibleExpenses={deductibleExpenses}
                    nonDeductibleExpenses={totalExpenses - deductibleExpenses}
                    taxRate={taxCalc.taxRate}
                    devLevy={taxCalc.devLevy}
                    rndIncentive={rndIncentive}
                    user={{
                        ...fullUser,
                        totalAssets: fullUser.totalAssets ? Number(fullUser.totalAssets) : 0,
                        rentAmount: fullUser.rentAmount ? Number(fullUser.rentAmount) : 0,
                        tin: fullUser.taxIdentityNumber
                    }}
                    filings={filings.map(f => ({
                        ...f,
                        turnover: Number(f.turnover),
                        assessableProfit: Number(f.assessableProfit),
                        totalTaxPaid: Number(f.totalTaxPaid)
                    }))}
                />
            ) : (
                <StandbyState
                    turnover={turnover}
                    threshold={25_000_000}
                />
            )}
        </div>
    );
}
