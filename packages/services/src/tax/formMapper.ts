import { Decimal } from '@prisma/client/runtime/library';
import { calculateCorporateTax, calculateRentRelief } from './taxEngine';
import { calculateVAT } from './vatEngine';
import { calculateDigitalAssetTax, isDigitalAsset } from './digitalAssetTax';

interface UserData {
    id: string;
    accountType: string | null;
    businessName: string | null;
    email: string | null;
    phoneNumber: string | null;
    businessAddress: string | null;
    taxIdentityNumber: string | null;
    nin?: string | null;
    bvn?: string | null;
    businessStructure: string | null;
    sector: string | null;
    totalAssets: number | Decimal | null;
    isProfessionalService: boolean | null;
    paysRent: boolean | null;
    rentAmount: number | Decimal | null;
    annualIncome: number | Decimal | null;
    residenceState: string | null;
}

interface TransactionData {
    amount: number;
    type: 'income' | 'expense';
    category?: string;
    date: Date;
    isDigitalAsset?: boolean;
    vatAmount?: number;
}

export interface FormAData {
    // Section A: Identity
    taxpayerName: string;
    tin: string;
    nin: string;
    bvn: string;
    address: string;
    state: string;

    // Section B: Income
    employmentIncome: number;
    tradeIncome: number; // For IG Sellers
    digitalAssetIncome: number;
    foreignIncome: number;
    totalIncome: number;

    // Section C: Reliefs
    rentPaid: number;
    rentReliefClaimed: number;
    pensionContribution: number; // Placeholder 8%
    nhfContribution: number; // Placeholder 2.5%
    totalReliefs: number;

    // Section D: Tax
    chargeableIncome: number;
    taxPayable: number;
    digitalAssetTax: number; // 10% CGT on net capital gains
}

export interface CITReturnData {
    // Header
    companyName: string;
    tin: string;
    rcNumber: string; // Placeholder
    filingPeriod: string;
    companySize: 'Small' | 'Medium' | 'Large'; // Medium is now deprecated but kept for compatibility logic

    // Financials
    turnover: number;
    grossProfit: number;
    totalAssets: number;

    // Adjustments
    assessableProfit: number;

    // Tax Computation
    citRate: number; // 0% or 30%
    citPayable: number;
    developmentLevy: number; // 4%
    totalTaxPayable: number;

    // Declarations
    isNilReturn: boolean;
    isProfessionalService: boolean;
    etrCheck: number; // Effective Tax Rate
}

export interface VATReturnData {
    // Header
    companyName: string;
    tin: string;
    rcNumber: string;
    period: string;
    month: number;
    year: number;

    // Sales
    totalSales: number;
    exemptSales: number;
    taxableSales: number;
    outputVAT: number;

    // Purchases
    totalPurchases: number;
    exemptPurchases: number;
    taxablePurchases: number;
    inputVAT: number;

    // Payable
    netVATPayable: number;
    isVATRegistered: boolean;
}

export function mapToFormA(user: UserData, transactions: TransactionData[]): FormAData {
    const incomeTx = transactions.filter(t => t.type === 'income');
    const totalTurnover = incomeTx.reduce((sum, t) => sum + t.amount, 0);

    const digitalAssetIncome = incomeTx
        .filter(t => t.isDigitalAsset)
        .reduce((sum, t) => sum + t.amount, 0);

    // Calculate Digital Asset Tax (10% CGT)
    // Note: In real implementation, you'd track acquisition cost vs disposal value
    // For now, we assume the digital asset income represents net gains
    const digitalAssetTaxPayable = digitalAssetIncome * 0.10; // 10% CGT

    const rentAmount = user.rentAmount ? Number(user.rentAmount) : 0;
    const rentRelief = user.paysRent ? calculateRentRelief(rentAmount) : 0;

    // Basic assumptions for salary vs trade
    const isSalaryEarner = user.accountType === 'personal' && !user.businessName;
    const employmentIncome = isSalaryEarner ? (user.annualIncome ? Number(user.annualIncome) : totalTurnover) : 0;
    const tradeIncome = !isSalaryEarner ? totalTurnover : 0; // IG Seller

    const pension = isSalaryEarner ? employmentIncome * 0.08 : 0;
    const nhf = isSalaryEarner ? employmentIncome * 0.025 : 0;

    const totalReliefs = rentRelief + pension + nhf + 200000; // + Consolidated Relief Allowance fixed base (simplified)

    const totalIncome = employmentIncome + tradeIncome + digitalAssetIncome;
    const chargeableIncome = Math.max(0, totalIncome - totalReliefs);

    // Simplified progressive tax (example) - Not including digital asset tax here as it's separate
    const taxPayable = chargeableIncome * 0.07; // Average low band for estimation

    return {
        taxpayerName: user.businessName || user.email || 'N/A',
        tin: user.taxIdentityNumber || 'Not Registered',
        nin: user.nin || 'Missing',
        bvn: user.bvn || 'Missing',
        address: user.businessAddress || 'N/A',
        state: user.residenceState || 'Lagos',
        employmentIncome,
        tradeIncome,
        digitalAssetIncome,
        foreignIncome: 0, // Placeholder
        totalIncome,
        rentPaid: rentAmount,
        rentReliefClaimed: rentRelief,
        pensionContribution: pension,
        nhfContribution: nhf,
        totalReliefs,
        chargeableIncome,
        taxPayable,
        digitalAssetTax: digitalAssetTaxPayable
    };
}

export function mapToCITReturn(user: UserData, transactions: TransactionData[], year?: number): CITReturnData {
    const turnover = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const grossProfit = turnover - expenses; // Simplified
    const assessableProfit = Math.max(0, grossProfit);
    const totalAssets = user.totalAssets ? Number(user.totalAssets) : 0;
    const isProfessional = user.isProfessionalService || false;

    const taxCalc = calculateCorporateTax(
        turnover,
        assessableProfit,
        false,
        user.sector || undefined,
        totalAssets,
        isProfessional
    );

    const etr = turnover > 0 ? (taxCalc.totalLiability / turnover) * 100 : 0;
    const filingYear = year || (new Date().getFullYear() - 1);

    return {
        companyName: user.businessName || 'N/A',
        tin: user.taxIdentityNumber || 'N/A',
        rcNumber: 'RC-PENDING',
        filingPeriod: `${filingYear}`,
        companySize: taxCalc.companyStatus === 'small' ? 'Small' : 'Large',
        turnover,
        grossProfit,
        totalAssets,
        assessableProfit,
        citRate: taxCalc.taxRate,
        citPayable: taxCalc.estimatedCit,
        developmentLevy: taxCalc.totalLiability - taxCalc.estimatedCit, // Extracting Dev Levy (Total - CIT)
        totalTaxPayable: taxCalc.totalLiability,
        isNilReturn: taxCalc.companyStatus === 'small',
        isProfessionalService: isProfessional,
        etrCheck: etr
    };
}

export function mapToVATReturn(
    user: UserData,
    transactions: TransactionData[],
    month: number,
    year: number
): VATReturnData {
    const totalSales = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalPurchases = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    // Sum actual VAT amounts from transactions if they exist
    const actualOutputVAT = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + (t.vatAmount || 0), 0);

    const actualInputVAT = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + (t.vatAmount || 0), 0);

    // Simplified: assume all sales/purchases are taxable for now
    // In a real system, you'd filter by VAT-exempt categories
    const exemptSales = 0;
    const exemptPurchases = 0;

    // Use actual VAT if > 0, otherwise fallback to standard calculation
    // This allows hybrid approach where some older tx might need calc, 
    // but ideally we rely on DB values for "Output VAT" and "Input VAT"
    // However, vatEngine.ts expects us to pass totals and it does the multiplication.
    // We should override the result if actuals exist.

    // Let's modify usage: If actual output VAT exists, use it.
    // We'll proceed with standard calc to get base structure, then override.

    const vatCalc = calculateVAT({
        totalSales,
        totalPurchases,
        exemptSales,
        exemptPurchases,
        month,
        year
    });

    // Override if we have actual data
    if (actualOutputVAT > 0) vatCalc.outputVAT = actualOutputVAT;
    if (actualInputVAT > 0) vatCalc.inputVAT = actualInputVAT;

    // Recompute net payable
    vatCalc.netVATPayable = Math.max(0, vatCalc.outputVAT - vatCalc.inputVAT);

    const annualTurnover = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    return {
        companyName: user.businessName || 'N/A',
        tin: user.taxIdentityNumber || 'N/A',
        rcNumber: 'RC-PENDING',
        period: vatCalc.period,
        month,
        year,
        totalSales,
        exemptSales: vatCalc.exemptSales,
        taxableSales: vatCalc.taxableSales,
        outputVAT: vatCalc.outputVAT,
        totalPurchases,
        exemptPurchases: vatCalc.exemptPurchases,
        taxablePurchases: vatCalc.taxablePurchases,
        inputVAT: vatCalc.inputVAT,
        netVATPayable: vatCalc.netVATPayable,
        isVATRegistered: annualTurnover >= 25_000_000
    };
}
