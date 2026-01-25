/**
 * VAT Calculation Engine
 * Nigeria Tax Act 2025 - 7.5% Standard Rate
 */

export interface VATCalculationInput {
    totalSales: number;
    totalPurchases: number;
    exemptSales?: number;
    exemptPurchases?: number;
    month: number;
    year: number;
}

export interface VATCalculationResult {
    outputVAT: number;
    inputVAT: number;
    netVATPayable: number;
    taxableSales: number;
    taxablePurchases: number;
    exemptSales: number;
    exemptPurchases: number;
    period: string;
}

const VAT_RATE = 0.075; // 7.5%

export function calculateVAT(input: VATCalculationInput): VATCalculationResult {
    const exemptSales = input.exemptSales || 0;
    const exemptPurchases = input.exemptPurchases || 0;

    const taxableSales = Math.max(0, input.totalSales - exemptSales);
    const taxablePurchases = Math.max(0, input.totalPurchases - exemptPurchases);

    const outputVAT = taxableSales * VAT_RATE;
    const inputVAT = taxablePurchases * VAT_RATE;
    const netVATPayable = Math.max(0, outputVAT - inputVAT);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const period = `${monthNames[input.month - 1]} ${input.year}`;

    return {
        outputVAT,
        inputVAT,
        netVATPayable,
        taxableSales,
        taxablePurchases,
        exemptSales,
        exemptPurchases,
        period
    };
}

export function isVATRegistrationRequired(annualTurnover: number): boolean {
    return annualTurnover >= 25_000_000;
}
