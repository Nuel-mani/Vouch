import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { CheckCircle, Lightbulb, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { MetricDeck } from './_components/MetricDeck';
import { ReceiptHunter } from './_components/ReceiptHunter';
import { ComplianceTracker } from './_components/ComplianceTracker';

import { getStrategicInsights } from '../../actions/insights';
import { StrategicInsightsDeck } from './_components/StrategicInsightsDeck';

export default async function OptimizerPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) return null;

    // Fetch user and transactions
    const [fullUser, transactions, invoices] = await Promise.all([
        db.user.findUnique({
            where: { id: user.id },
            select: {
                accountType: true,
                sector: true,
                paysRent: true,
                rentAmount: true,
                annualIncome: true,
            },
        }),
        db.transaction.findMany({
            where: { userId: user.id, deletedAt: null },
            select: {
                id: true,
                type: true,
                amount: true,
                date: true,
                categoryName: true,
                isDeductible: true,
                hasVatEvidence: true,
                weCompliant: true,
                isRndExpense: true,
                description: true,
                receiptUrls: true,
            },
        }),
        db.invoice.findMany({
            where: {
                userId: user.id,
                status: { in: ['pending', 'overdue', 'Pending', 'Overdue'] }
            },
            select: {
                id: true,
                serialId: true,
                dateIssued: true,
                amount: true,
                status: true,
                customerName: true
            }
        })
    ]);

    if (!fullUser) return null;

    // Calculate stats
    let turnover = 0;
    let totalExpenses = 0;
    let deductibleExpenses = 0;
    let missingVatEvidence = 0;
    let missingWeCompliance = 0;
    let hasRndExpenses = false;
    let auditRiskCount = 0;

    // Receipt Hunter Logic
    const riskyTransactions: any[] = [];

    // 1. Scan Transactions (Expense > 50k & No Evidence)
    transactions.forEach(tx => {
        const amount = Number(tx.amount);
        const hasReceipts = tx.receiptUrls && Array.isArray(tx.receiptUrls) && tx.receiptUrls.length > 0;
        const hasEvidence = tx.hasVatEvidence || hasReceipts;

        // Count stats
        if (tx.type === 'income') {
            turnover += amount;
        } else {
            totalExpenses += amount;
            if (tx.isDeductible) deductibleExpenses += amount;
            if (!hasEvidence) missingVatEvidence++;
            if (!tx.weCompliant) missingWeCompliance++;
            if (tx.isRndExpense) hasRndExpenses = true;
        }

        // Risky filter (Hunter) - matches Audit Risk metric
        if (tx.type !== 'income' && amount > 50000 && !hasEvidence) {
            auditRiskCount++;
            riskyTransactions.push({
                ...tx,
                amount: Number(tx.amount),
                type: 'expense',
                hasVatEvidence: hasEvidence, // Treat as secured if physical receipt exists
            });
        }
    });

    // 2. Scan Invoices (Pending/Overdue are Risky)
    invoices.forEach(inv => {
        auditRiskCount++; // Counting invoices as audit risks too
        riskyTransactions.push({
            id: inv.id,
            date: inv.dateIssued,
            description: `Invoice #${inv.serialId} - ${inv.customerName}`,
            amount: Number(inv.amount),
            type: 'invoice',
            status: inv.status,
            actionUrl: `/invoices` // Redirect to invoices to validate
        });
    });

    // Compliance Score Calc
    const expenseTransactions = transactions.filter((t) => t.type !== 'income');
    const compliantCount = expenseTransactions.filter((t) => {
        const hasReceipts = t.receiptUrls && Array.isArray(t.receiptUrls) && t.receiptUrls.length > 0;
        return (t.hasVatEvidence || hasReceipts) && t.weCompliant;
    }).length;
    const complianceScore = expenseTransactions.length > 0
        ? Math.round((compliantCount / expenseTransactions.length) * 100)
        : 100;

    // Tax Savings Value (20% of Deductibles)
    const taxSavings = deductibleExpenses * 0.20;

    // Generate other optimization suggestions (Cliff, R&D, etc) kept as "Strategy Deck"
    const suggestions: {
        id: string;
        type: 'warning' | 'opportunity' | 'success';
        title: string;
        description: string;
        impact: string;
        action?: string;
        actionUrl?: string;
    }[] = [];

    if (!hasRndExpenses && turnover > 10000000) {
        suggestions.push({
            id: 'rnd-deduction',
            type: 'opportunity',
            title: 'R&D Deduction Opportunity',
            description: 'Businesses can claim additional deductions for Research & Development expenses under NTA 2025.',
            impact: 'Up to 5% of turnover',
            action: 'Learn More',
            actionUrl: '/tax-engine',
        });
    }

    if (turnover > 20000000 && turnover < 25000000) {
        suggestions.push({
            id: 'cliff-warning',
            type: 'warning',
            title: 'Tax Cliff Warning',
            description: `You are ₦${(25000000 - turnover).toLocaleString()} away from losing Small Company exemption. Crossing ₦25M triggers 20% CIT.`,
            impact: 'Could cost you 20% of profit',
        });
    }

    // Fetch Strategic Insights
    const { data: strategicInsights } = await getStrategicInsights();

    // Combine dynamic logic with DB insights if needed, or primarily use DB insights
    // For this update, we will prioritize the DB insights

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Tax Optimizer</h1>
                <p className="text-[var(--muted-foreground)] mt-1">AI-powered suggestions to minimize your tax liability</p>
            </div>

            {/* 1. Metric Deck */}
            <MetricDeck
                taxSavings={taxSavings}
                deductibleExpenses={deductibleExpenses}
                auditRiskCount={auditRiskCount}
                complianceScore={complianceScore}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 2. Receipt Hunter (2/3 width) */}
                <div className="lg:col-span-2 space-y-8">
                    <ReceiptHunter riskyTransactions={riskyTransactions} />

                    {/* Strategic Insights Deck */}
                    {strategicInsights && strategicInsights.length > 0 && (
                        <StrategicInsightsDeck insights={strategicInsights as any[]} />
                    )}
                </div>

                {/* 3. Compliance Tracker (1/3 width) */}
                <div className="lg:col-span-1">
                    <ComplianceTracker
                        accountType={fullUser.accountType}
                        paysRent={fullUser.paysRent || false}
                        missingVatEvidenceCount={missingVatEvidence}
                    />
                </div>
            </div>
        </div>
    );
}
