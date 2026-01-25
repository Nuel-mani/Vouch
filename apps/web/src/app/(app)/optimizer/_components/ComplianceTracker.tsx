import { Shield, Check, X, Building, FileText } from 'lucide-react';
import Link from 'next/link';

interface ComplianceTrackerProps {
    accountType: string | null;
    paysRent: boolean;
    missingVatEvidenceCount: number;
}

export function ComplianceTracker({ accountType, paysRent, missingVatEvidenceCount }: ComplianceTrackerProps) {
    const isRentReliefActive = accountType === 'personal' && paysRent;
    const isRentReliefMissed = accountType === 'personal' && !paysRent;
    const isVatVaultSecure = missingVatEvidenceCount === 0;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-sm p-6 h-full">
            <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2 mb-6">
                <Shield size={20} className="text-[var(--primary)]" />
                NaijaBooks Compliance Tracker
            </h2>

            <div className="space-y-6">
                {/* 1. Rent Relief Shield */}
                <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-full ${isRentReliefActive ? 'bg-green-100 text-green-600' : isRentReliefMissed ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Building size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[var(--foreground)]">Rent Relief Shield</h3>
                            {isRentReliefActive ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    <Check size={10} /> Active
                                </span>
                            ) : isRentReliefMissed ? (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    <X size={10} /> Inactive
                                </span>
                            ) : null}
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                            {isRentReliefActive
                                ? "You are claiming tax relief on your rent."
                                : isRentReliefMissed
                                    ? "You are missing up to ₦500k in relief."
                                    : "Not applicable for this account type."}
                        </p>
                        {isRentReliefMissed && (
                            <Link href="/settings" className="text-xs text-[var(--primary)] font-medium mt-2 inline-block hover:underline">
                                Activate in Settings →
                            </Link>
                        )}
                    </div>
                </div>

                {/* 2. VAT Proof Vault */}
                <div className="flex gap-4">
                    <div className={`mt-1 p-2 rounded-full ${isVatVaultSecure ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <FileText size={18} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-[var(--foreground)]">VAT Proof Vault</h3>
                            {isVatVaultSecure ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    <Check size={10} /> Secure
                                </span>
                            ) : (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    <X size={10} /> Exposed
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">
                            {isVatVaultSecure
                                ? "All deductible expenses have evidence."
                                : `${missingVatEvidenceCount} claimed expenses are missing VAT evidence.`}
                        </p>
                        {!isVatVaultSecure && (
                            <Link href="/transactions?vatEvidence=false" className="text-xs text-red-600 font-medium mt-2 inline-block hover:underline">
                                Review Transactions →
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
