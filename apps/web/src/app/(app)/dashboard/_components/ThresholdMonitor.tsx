'use client';

import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ThresholdMonitorProps {
    accountType: string;
    totalIncome: number;
}

export function ThresholdMonitor({ accountType, totalIncome }: ThresholdMonitorProps) {
    const isPersonal = accountType === 'personal';

    // Thresholds
    const THRESHOLD_PERSONAL = 800000;
    const THRESHOLD_BUSINESS = 25000000;

    const threshold = isPersonal ? THRESHOLD_PERSONAL : THRESHOLD_BUSINESS;
    const remaining = Math.max(0, threshold - totalIncome);
    const progress = Math.min(100, (totalIncome / threshold) * 100);
    const isExceeded = totalIncome >= threshold;

    // Messages
    const title = isPersonal ? 'Tax Exempt Status' : 'VAT / CIT Compliance';

    const message = isPersonal
        ? isExceeded
            ? `You have exceeded the ₦800,000 tax-free limit. You may now be liable for Personal Income Tax.`
            : `You are ₦${remaining.toLocaleString()} away from the tax-free limit of ₦800,000.`
        : isExceeded
            ? `You have exceeded the ₦25M turnover threshold. Mandatory VAT & CIT filing is now required.`
            : `You are ₦${remaining.toLocaleString()} away from mandatory VAT/CIT filing threshold (₦25M).`;

    const colorScheme = isExceeded
        ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
        : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200';

    return (
        <div className={`rounded-xl border p-4 mb-6 ${colorScheme}`}>
            <div className="flex items-start gap-3">
                <div className="mt-0.5">
                    {isExceeded ? <AlertTriangle size={20} /> : <Info size={20} />}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-sm uppercase tracking-wide opacity-80 mb-1">{title}</h3>
                    <p className="font-medium text-lg leading-snug mb-3">
                        {message}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-full bg-black/5 dark:bg-white/5 rounded-full h-2.5 mb-1">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-1000 ${isExceeded ? 'bg-amber-500' : 'bg-blue-500'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs opacity-70">
                        <span>₦{totalIncome.toLocaleString()} Earned</span>
                        <span>Limit: ₦{threshold.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
