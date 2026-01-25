import { Shield, TrendingUp, Info } from 'lucide-react';

interface StandbyStateProps {
    turnover: number;
    threshold: number;
}

export function StandbyState({ turnover, threshold }: StandbyStateProps) {
    const percentage = Math.min((turnover / threshold) * 100, 100);
    const isWarning = percentage >= 80;

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-5">
            {/* Minimalist Header */}
            <div className="text-center space-y-2 py-4 md:py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-green-100 dark:bg-green-500/10 text-green-600 mb-2 md:mb-4">
                    <Shield size={28} className="md:w-8 md:h-8" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-[var(--foreground)] px-4">You are Tax Exempt</h2>
                <p className="text-sm md:text-base text-[var(--muted-foreground)] max-w-lg mx-auto px-6">
                    Your business turnover is currently under the ₦25M threshold.
                    You are classified as a <span className="font-medium text-[var(--foreground)]">Small Company</span>.
                </p>
            </div>

            {/* Turnover Watch */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] p-4 md:p-8 max-w-2xl mx-auto shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isWarning ? 'bg-orange-100 text-orange-600' : 'bg-[var(--primary-50)] text-[var(--primary)]'}`}>
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-[var(--foreground)]">Turnover Watch</h3>
                            <p className="text-xs text-[var(--muted-foreground)]">Fiscal Year 2026</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-[var(--muted-foreground)]">Threshold</p>
                        <p className="font-mono font-medium">₦{threshold.toLocaleString()}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="relative h-4 bg-[var(--muted)] rounded-full overflow-hidden mb-2">
                    <div
                        className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full ${isWarning ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="flex justify-between text-sm">
                    <span className={`font-bold ${isWarning ? 'text-orange-600' : 'text-green-600'}`}>
                        Current: ₦{turnover.toLocaleString()}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                        {percentage.toFixed(1)}% to limit
                    </span>
                </div>

                {/* Warning Message */}
                {isWarning && (
                    <div className="mt-6 flex gap-3 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 rounded-xl">
                        <Info className="text-orange-600 shrink-0" size={20} />
                        <div>
                            <p className="font-bold text-orange-700 dark:text-orange-400 text-sm">Approaching Tax Cliff</p>
                            <p className="text-sm text-orange-600/90 dark:text-orange-400/90 mt-1">
                                You are close to the ₦25M threshold. Once crossed, you will be required to file CIT (20%) and VAT returns.
                                The Fiscal Engine will automatically switch to "Active Mode" to help you prepare.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto pt-4">
                <div className="p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
                    <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">CIT Status</p>
                    <p className="font-bold text-green-600">Exempt (0%)</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
                    <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">VAT Status</p>
                    <p className="font-bold text-green-600">Not Required</p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-center">
                    <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Filing Duty</p>
                    <p className="font-bold text-[var(--foreground)]">Annual Returns Only</p>
                </div>
            </div>
        </div>
    );
}
