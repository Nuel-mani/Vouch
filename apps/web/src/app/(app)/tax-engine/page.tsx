import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { calculateCorporateTax } from '@vouch/services';
import { Calculator, AlertTriangle, CheckCircle, TrendingUp, Shield, FileText } from 'lucide-react';

export default async function TaxEnginePage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) return null;

    // Fetch user details and transactions
    const [fullUser, transactions] = await Promise.all([
        db.user.findUnique({
            where: { id: user.id },
            select: {
                accountType: true,
                businessStructure: true,
                sector: true,
                turnoverBand: true,
                isCitExempt: true,
                paysRent: true,
                rentAmount: true,
                annualIncome: true,
            },
        }),
        db.transaction.findMany({
            where: { userId: user.id },
            select: {
                type: true,
                amount: true,
                isDeductible: true,
                hasVatEvidence: true,
                weCompliant: true,
                isRndExpense: true,
                categoryName: true,
                receiptUrls: true,
            },
        }),
    ]);

    if (!fullUser) return null;

    // Calculate financial summary
    let turnover = 0;
    let totalExpenses = 0;
    let deductibleExpenses = 0;
    let nonCompliantExpenses = 0;
    let rndExpenses = 0;

    transactions.forEach((tx) => {
        const amount = Number(tx.amount);
        if (tx.type === 'income') {
            turnover += amount;
        } else {
            totalExpenses += amount;

            const hasReceipts = tx.receiptUrls && Array.isArray(tx.receiptUrls) && tx.receiptUrls.length > 0;
            const hasEvidence = tx.hasVatEvidence || hasReceipts;

            if (tx.isDeductible && tx.weCompliant && hasEvidence) {
                deductibleExpenses += amount;
            }
            if (!hasEvidence || !tx.weCompliant) {
                nonCompliantExpenses += amount;
            }
            if (tx.isRndExpense) {
                rndExpenses += amount;
            }
        }
    });

    const assessableProfit = Math.max(0, turnover - deductibleExpenses);

    // Calculate tax using our service
    const taxCalc = calculateCorporateTax(
        turnover,
        assessableProfit,
        fullUser.isCitExempt ?? false,
        fullUser.sector || undefined
    );

    // Calculate personal tax relief (if personal account)
    const rentRelief = fullUser.paysRent
        ? Math.min(Number(fullUser.rentAmount), 500000)
        : 0;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Tax Engine</h1>
                <p className="text-gray-500 mt-1">NTA 2025 Corporate Tax Calculator & Compliance Dashboard</p>
            </div>

            {/* Tax Status Banner */}
            <div className={`rounded-2xl p-6 ${taxCalc.companyStatus === 'small'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : 'bg-gradient-to-r from-blue-600 to-purple-600'
                } text-white`}>
                <div className="flex items-center gap-4 mb-4">
                    {taxCalc.companyStatus === 'small' ? (
                        <CheckCircle size={32} />
                    ) : (
                        <Calculator size={32} />
                    )}
                    <div>
                        <h2 className="text-xl font-bold">
                            {taxCalc.companyStatus === 'small'
                                ? 'Small Company Status: Tax Exempt'
                                : `${taxCalc.companyStatus.toUpperCase()} Company`}
                        </h2>
                        <p className="text-white/80">
                            {taxCalc.companyStatus === 'small'
                                ? 'You qualify for 0% Corporate Income Tax under NTA 2025'
                                : `Subject to ${(taxCalc.taxRate * 100).toFixed(0)}% Corporate Income Tax`}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div>
                        <p className="text-sm text-white/70">Annual Turnover</p>
                        <p className="text-2xl font-bold">₦{turnover.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-white/70">Assessable Profit</p>
                        <p className="text-2xl font-bold">₦{assessableProfit.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-white/70">CIT Liability</p>
                        <p className="text-2xl font-bold">₦{taxCalc.estimatedCit.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="text-sm text-white/70">Education Tax</p>
                        <p className="text-2xl font-bold">₦{taxCalc.educationTax.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Compliance & Deductions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Deductible Expenses */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Deductible Expenses</h3>
                            <p className="text-sm text-gray-500">W&E Compliant with VAT Evidence</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600 mb-4">
                        ₦{deductibleExpenses.toLocaleString()}
                    </p>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${totalExpenses > 0 ? (deductibleExpenses / totalExpenses) * 100 : 0}%` }}
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        {totalExpenses > 0
                            ? `${((deductibleExpenses / totalExpenses) * 100).toFixed(1)}% of total expenses`
                            : 'No expenses recorded'}
                    </p>
                </div>

                {/* Non-Compliant Expenses */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Non-Deductible Expenses</h3>
                            <p className="text-sm text-gray-500">Missing evidence or W&E compliance</p>
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-red-600 mb-4">
                        ₦{nonCompliantExpenses.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                        {nonCompliantExpenses > 0
                            ? 'Review these expenses and add VAT evidence to claim deductions'
                            : 'All expenses are compliant'}
                    </p>
                    {nonCompliantExpenses > 0 && (
                        <a
                            href="/transactions?compliant=false"
                            className="inline-block mt-3 text-sm font-medium text-red-600 hover:underline"
                        >
                            View Non-Compliant Transactions →
                        </a>
                    )}
                </div>
            </div>

            {/* Tax Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Tax Liability Breakdown</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-900">Corporate Income Tax (CIT)</p>
                            <p className="text-sm text-gray-500">Rate: {(taxCalc.taxRate * 100).toFixed(0)}%</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">₦{taxCalc.estimatedCit.toLocaleString()}</p>
                    </div>
                    <div className="px-6 py-4 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-gray-900">Education Tax</p>
                            <p className="text-sm text-gray-500">2.5% of Assessable Profit</p>
                        </div>
                        <p className="text-xl font-bold text-gray-900">₦{taxCalc.educationTax.toLocaleString()}</p>
                    </div>
                    {rndExpenses > 0 && (
                        <div className="px-6 py-4 flex justify-between items-center bg-green-50">
                            <div>
                                <p className="font-medium text-green-800">R&D Deduction Claimed</p>
                                <p className="text-sm text-green-600">5% incentive on qualifying expenses</p>
                            </div>
                            <p className="text-xl font-bold text-green-600">-₦{(rndExpenses * 0.05).toLocaleString()}</p>
                        </div>
                    )}
                    {fullUser.paysRent && fullUser.accountType === 'personal' && (
                        <div className="px-6 py-4 flex justify-between items-center bg-blue-50">
                            <div>
                                <p className="font-medium text-blue-800">Rent Relief</p>
                                <p className="text-sm text-blue-600">Up to ₦500,000 capped</p>
                            </div>
                            <p className="text-xl font-bold text-blue-600">-₦{rentRelief.toLocaleString()}</p>
                        </div>
                    )}
                    <div className="px-6 py-4 flex justify-between items-center bg-gray-50">
                        <p className="font-bold text-gray-900">Total Tax Liability</p>
                        <p className="text-2xl font-black text-gray-900">
                            ₦{taxCalc.totalLiability.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* NTA 2025 Thresholds */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">NTA 2025 Classification Thresholds</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border-2 ${turnover <= 25000000 ? 'border-green-500 bg-green-50' : 'border-gray-200'
                        }`}>
                        <p className="font-medium text-gray-900">Small Company</p>
                        <p className="text-2xl font-bold text-gray-900">₦0 - ₦25M</p>
                        <p className="text-sm text-gray-500">0% CIT</p>
                        {turnover <= 25000000 && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                Your Status
                            </span>
                        )}
                    </div>
                    <div className={`p-4 rounded-xl border-2 ${turnover > 25000000 && turnover <= 100000000 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                        }`}>
                        <p className="font-medium text-gray-900">Medium Company</p>
                        <p className="text-2xl font-bold text-gray-900">₦25M - ₦100M</p>
                        <p className="text-sm text-gray-500">20% CIT</p>
                        {turnover > 25000000 && turnover <= 100000000 && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                Your Status
                            </span>
                        )}
                    </div>
                    <div className={`p-4 rounded-xl border-2 ${turnover > 100000000 ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}>
                        <p className="font-medium text-gray-900">Large Company</p>
                        <p className="text-2xl font-bold text-gray-900">₦100M+</p>
                        <p className="text-sm text-gray-500">30% CIT</p>
                        {turnover > 100000000 && (
                            <span className="inline-block mt-2 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                                Your Status
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
