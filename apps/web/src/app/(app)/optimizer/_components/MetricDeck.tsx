import { TrendingUp, Shield, PiggyBank, FileWarning } from 'lucide-react';

interface MetricDeckProps {
    taxSavings: number;
    deductibleExpenses: number;
    auditRiskCount: number;
    complianceScore: number;
}

export function MetricDeck({ taxSavings, deductibleExpenses, auditRiskCount, complianceScore }: MetricDeckProps) {
    const riskLevel = auditRiskCount > 0 ? (auditRiskCount > 3 ? 'High' : 'Medium') : 'Low';
    const riskColor = riskLevel === 'Low' ? 'text-green-600' : riskLevel === 'Medium' ? 'text-yellow-600' : 'text-red-600';
    const riskBg = riskLevel === 'Low' ? 'bg-green-100 dark:bg-green-500/10' : riskLevel === 'Medium' ? 'bg-yellow-100 dark:bg-yellow-500/10' : 'bg-red-100 dark:bg-red-500/10';

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tax Savings Value */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--muted-foreground)]">Tax Savings Value</p>
                        <h3 className="text-2xl font-bold text-green-600 mt-1">
                            ₦{taxSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h3>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-500/10 rounded-xl text-green-600">
                        <PiggyBank size={20} />
                    </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-3">
                    Est. CIT Savings (20% of Deductibles)
                </p>
            </div>

            {/* Deductible Expenses */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--muted-foreground)]">Deductible Expenses</p>
                        <h3 className="text-2xl font-bold text-[var(--foreground)] mt-1">
                            ₦{deductibleExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </h3>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600">
                        <TrendingUp size={20} />
                    </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-3">
                    Vouched Business Expenses
                </p>
            </div>

            {/* Audit Risk */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--muted-foreground)]">Audit Risk</p>
                        <h3 className={`text-2xl font-bold mt-1 ${riskColor}`}>
                            {riskLevel}
                        </h3>
                    </div>
                    <div className={`p-2 rounded-xl ${riskBg} ${riskColor}`}>
                        <FileWarning size={20} />
                    </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-3">
                    {auditRiskCount} High-Value Risks Found
                </p>
            </div>

            {/* Compliance Score */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-[var(--muted-foreground)]">Compliance Score</p>
                        <h3 className="text-2xl font-bold text-[var(--primary)] mt-1">
                            {complianceScore}%
                        </h3>
                    </div>
                    <div className="p-2 bg-[var(--primary)]/10 rounded-xl text-[var(--primary)]">
                        <Shield size={20} />
                    </div>
                </div>
                <div className="mt-3 h-1.5 w-full bg-[var(--muted)] rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                        style={{ width: `${complianceScore}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
