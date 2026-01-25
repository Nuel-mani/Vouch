// User & Auth Types
export interface User {
    id: string;
    email: string;
    businessName: string | null;
    accountType: 'personal' | 'business';
    subscriptionTier: 'free' | 'pro' | 'enterprise';
    role: 'user' | 'staff' | 'admin';
    turnoverBand: 'micro' | 'small' | 'medium' | 'large' | null;
    sector: string | null;
    brandColor: string | null;
    logoUrl: string | null;
    tinNumber: string | null;
    isCitExempt: boolean;
    isVatExempt: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Session {
    userId: string;
    role: 'user' | 'staff' | 'admin';
    expiresAt: Date;
}

export interface TokenPayload {
    userId: string;
    role: 'user' | 'staff' | 'admin';
    iat: number;
    exp: number;
}

// Transaction Types
export interface Transaction {
    id: string;
    userId: string;
    date: Date;
    type: 'income' | 'expense';
    amount: number;
    vatAmount?: number | null;
    categoryId: string | null;
    categoryName: string;
    description: string | null;
    payee: string | null;
    authorizedBy?: string | null;
    paymentMethod: string | null;
    refId: string | null;
    receiptUrls: any;
    isDeductible: boolean;
    hasVatEvidence: boolean;
    weCompliant: boolean;
    isRndExpense: boolean;
    isCapitalAsset: boolean;
    assetClass: string | null;
    wallet: 'operations' | 'savings' | 'tax' | string;
    syncStatus: 'pending' | 'synced' | 'error' | string;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt?: Date | null;
}

// Invoice Types
export interface InvoiceItem {
    description: string;
    qty: number;
    amount: number;
}

export interface Invoice {
    id: string;
    userId: string;
    serialId: number;
    customerName: string;
    amount: number;
    vatAmount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    items: InvoiceItem[];
    dateIssued: Date;
    dateDue: Date | null;
    pdfUrl: string | null;
    syncStatus: 'pending' | 'synced' | 'error';
    createdAt: Date;
}

// Subscription Types
export interface Subscription {
    id: string;
    userId: string;
    planType: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    paystackCustomerId: string | null;
    paystackSubscriptionCode: string | null;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    trialEndsAt: Date | null;
    createdAt: Date;
}

// Tax Types
export interface TaxCalculation {
    fiscalTurnover: number;
    fiscalExpense: number;
    fiscalProfit: number;
    totalAssets: number;
    taxRate: number;
    companyStatus: 'micro' | 'small' | 'medium' | 'large';
    estimatedCit: number;
    educationTax: number;
    devLevy: number;
    totalLiability: number;
    isExempt: boolean;
}

export interface TaxCliffWarning {
    status: 'safe' | 'warning' | 'crossed';
    message: string;
    distanceToCliff: number;
    color: 'green' | 'yellow' | 'red';
}

// Audit Types
export interface AuditLog {
    id: string;
    userId: string | null;
    action: string;
    details: Record<string, unknown>;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
