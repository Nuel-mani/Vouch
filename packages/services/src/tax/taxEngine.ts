import type { TaxCalculation } from '@vouch/types';

const SMALL_CO_TURNOVER_THRESHOLD = 50_000_000;
const SMALL_CO_ASSET_THRESHOLD = 250_000_000;

const CIT_RATE_SMALL = 0;       // 0%
// Medium Band (20%) is ABOLISHED in NTA 2025
const CIT_RATE_STANDARD = 0.30;    // 30%
const DEV_LEVY_RATE = 0.04;        // 4% (Replaces TET, NITDA, NASENI)

/**
 * Calculate Corporate Income Tax based on NTA 2025 rules
 */
export function calculateCorporateTax(
    turnover: number,
    assessableProfit: number,
    isExempt = false,
    sector?: string,
    totalAssets: number = 0,
    isProfessionalService: boolean = false
): TaxCalculation {
    let companyStatus: 'micro' | 'small' | 'large' = 'micro'; // 'medium' is no longer a tax status
    let taxRate = CIT_RATE_STANDARD;
    let estimatedCit = 0;

    // Determine Company Status (NTA 2025)
    // Small Company Check: Turnover <= 50M AND Assets < 250M AND NOT Professional Service
    const isSmallParams =
        turnover <= SMALL_CO_TURNOVER_THRESHOLD &&
        totalAssets < SMALL_CO_ASSET_THRESHOLD &&
        !isProfessionalService;

    if (isSmallParams) {
        companyStatus = 'small';
        taxRate = CIT_RATE_SMALL;
    } else {
        companyStatus = 'large';
        taxRate = CIT_RATE_STANDARD;
    }

    // Exemptions (Manufacturing, Export processing, etc)
    if (isExempt) {
        taxRate = 0;
    }

    // Calculate CIT
    if (assessableProfit > 0) {
        estimatedCit = assessableProfit * taxRate;
    }

    // Calculate Development Levy (4% of Assessable Profit)
    // Applicable to all companies liable to CIT (Large Companies)
    // Small companies are exempt from CIT, effectively exempt from Levy (unless specific sector rules apply, usually exempt)
    let devLevy = 0;
    if (companyStatus === 'large' && assessableProfit > 0) {
        devLevy = assessableProfit * DEV_LEVY_RATE;
    }

    // Education Tax is subsumed into Development Levy
    const educationTax = 0;

    return {
        fiscalTurnover: turnover,
        fiscalExpense: 0, // Placeholder
        fiscalProfit: assessableProfit,
        totalAssets: totalAssets,
        taxRate,
        companyStatus: companyStatus as any, // Cast to any to maintain compat if type definition hasn't updated immediately
        estimatedCit,
        educationTax, // Retained for type compatibility, but 0
        devLevy,
        totalLiability: estimatedCit + devLevy,
        isExempt,
    };
}

/**
 * Calculate Individual Rent Relief (NTA 2025)
 * Formula: Min(20% of Rent Paid, ₦500,000)
 */
export function calculateRentRelief(rentAmount: number): number {
    const cap = 500_000;
    const calculatedRelief = rentAmount * 0.20;
    return Math.min(calculatedRelief, cap);
}

/**
 * Check for Wholly & Exclusively (W&E) Compliance
 */
export function validateExpense(
    amount: number,
    description: string,
    hasEvidence: boolean
): { compliant: boolean; reason?: string } {
    if (!hasEvidence) {
        return { compliant: false, reason: 'Missing third-party evidence (receipt/invoice)' };
    }

    // Logical checks
    if (!description || description.length < 3) {
        return { compliant: false, reason: 'Insufficient description' };
    }

    return { compliant: true };
}
