import { pgTable, uuid, varchar, decimal, boolean, timestamp, jsonb, text, integer } from 'drizzle-orm/pg-core';

// ============================================
// USERS (formerly tenants)
// ============================================
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),

    // Profile
    businessName: varchar('business_name', { length: 255 }),
    accountType: varchar('account_type', { length: 50 }).default('personal').notNull(),
    businessStructure: varchar('business_structure', { length: 50 }),
    sector: varchar('sector', { length: 100 }),

    // Access
    role: varchar('role', { length: 20 }).default('user').notNull(), // user | staff | admin
    subscriptionTier: varchar('subscription_tier', { length: 50 }).default('free').notNull(),

    // Tax Classification (NTA 2025)
    turnoverBand: varchar('turnover_band', { length: 20 }).default('micro'),
    isCitExempt: boolean('is_cit_exempt').default(true),
    isVatExempt: boolean('is_vat_exempt').default(true),
    isProfessionalService: boolean('is_professional_service').default(false),

    // Tax IDs
    tinNumber: varchar('tin_number', { length: 50 }),
    taxIdentityNumber: varchar('tax_identity_number', { length: 50 }),

    // Personal Tax (NTA 2025)
    residenceState: varchar('residence_state', { length: 50 }),
    paysRent: boolean('pays_rent').default(false),
    rentAmount: decimal('rent_amount', { precision: 19, scale: 2 }).default('0'),
    annualIncome: decimal('annual_income', { precision: 19, scale: 2 }).default('0'),

    // Branding
    brandColor: varchar('brand_color', { length: 7 }).default('#2252c9'),
    logoUrl: varchar('logo_url', { length: 500 }),
    stampUrl: varchar('stamp_url', { length: 500 }),
    invoiceTemplate: varchar('invoice_template', { length: 50 }).default('modern'),
    invoiceFont: varchar('invoice_font', { length: 50 }).default('inter'),

    // Contact
    businessAddress: text('business_address'),
    phoneNumber: varchar('phone_number', { length: 20 }),
    countryCode: varchar('country_code', { length: 5 }).default('NG'),
    currencySymbol: varchar('currency_symbol', { length: 5 }).default('₦'),

    // Timestamps
    lastLoginAt: timestamp('last_login_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// TRANSACTIONS
// ============================================
export const transactions = pgTable('transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    date: timestamp('date').notNull(),
    type: varchar('type', { length: 20 }).notNull(), // income | expense
    amount: decimal('amount', { precision: 19, scale: 2 }).notNull(),
    vatAmount: decimal('vat_amount', { precision: 19, scale: 2 }).default('0'),

    categoryId: varchar('category_id', { length: 50 }),
    categoryName: varchar('category_name', { length: 100 }),
    description: text('description'),
    payee: varchar('payee', { length: 255 }),
    paymentMethod: varchar('payment_method', { length: 50 }),

    // Linking
    refId: varchar('ref_id', { length: 100 }),
    invoiceId: uuid('invoice_id'),

    // Tax Compliance (NTA 2025 Section 21)
    isDeductible: boolean('is_deductible').default(false),
    hasVatEvidence: boolean('has_vat_evidence').default(false),
    weCompliant: boolean('we_compliant').default(false), // Wholly & Exclusively
    vendorTin: varchar('vendor_tin', { length: 50 }),

    // Special Categories
    isRndExpense: boolean('is_rnd_expense').default(false),
    isCapitalAsset: boolean('is_capital_asset').default(false),
    assetClass: varchar('asset_class', { length: 50 }),

    // Wallet
    wallet: varchar('wallet', { length: 20 }).default('operations'),

    // Evidence
    receiptUrls: jsonb('receipt_urls').default([]),
    deductionTip: text('deduction_tip'),

    // Sync
    syncStatus: varchar('sync_status', { length: 20 }).default('synced'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// INVOICES
// ============================================
export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    serialId: integer('serial_id').notNull(),
    customerName: varchar('customer_name', { length: 255 }).notNull(),
    customerEmail: varchar('customer_email', { length: 255 }),
    customerAddress: text('customer_address'),

    amount: decimal('amount', { precision: 19, scale: 2 }).notNull(),
    vatAmount: decimal('vat_amount', { precision: 19, scale: 2 }).default('0'),

    status: varchar('status', { length: 20 }).default('draft').notNull(),
    items: jsonb('items').default([]).notNull(),

    dateIssued: timestamp('date_issued').defaultNow().notNull(),
    dateDue: timestamp('date_due'),
    datePaid: timestamp('date_paid'),

    pdfUrl: varchar('pdf_url', { length: 500 }),
    pdfGeneratedAt: timestamp('pdf_generated_at'),
    reprintCount: integer('reprint_count').default(0),

    notes: text('notes'),

    // Sync
    syncStatus: varchar('sync_status', { length: 20 }).default('synced'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// SUBSCRIPTIONS
// ============================================
export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),

    planType: varchar('plan_type', { length: 20 }).default('free').notNull(),
    billingCycle: varchar('billing_cycle', { length: 20 }).default('monthly'),
    status: varchar('status', { length: 20 }).default('active').notNull(),

    // Paystack
    paystackCustomerId: varchar('paystack_customer_id', { length: 100 }),
    paystackSubscriptionCode: varchar('paystack_subscription_code', { length: 100 }),
    paystackPlanCode: varchar('paystack_plan_code', { length: 100 }),

    // Billing Period
    currentPeriodStart: timestamp('current_period_start'),
    currentPeriodEnd: timestamp('current_period_end'),
    trialEndsAt: timestamp('trial_ends_at'),
    cancelledAt: timestamp('cancelled_at'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// STARTING BALANCES (for accurate reporting)
// ============================================
export const startingBalances = pgTable('starting_balances', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    year: integer('year').notNull(),
    amount: decimal('amount', { precision: 19, scale: 2 }).default('0').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// BALANCE HISTORY (monthly snapshots)
// ============================================
export const balanceHistory = pgTable('balance_history', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    monthYear: varchar('month_year', { length: 7 }).notNull(), // 2026-01
    openingBalance: decimal('opening_balance', { precision: 19, scale: 2 }).default('0'),
    totalIncome: decimal('total_income', { precision: 19, scale: 2 }).default('0'),
    totalExpense: decimal('total_expense', { precision: 19, scale: 2 }).default('0'),
    closingBalance: decimal('closing_balance', { precision: 19, scale: 2 }).default('0'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// SYSTEM SETTINGS (Admin configurable)
// ============================================
export const systemSettings = pgTable('system_settings', {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).unique().notNull(),
    value: text('value').notNull(),
    description: text('description'),
    updatedBy: uuid('updated_by').references(() => users.id),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ============================================
// AUDIT LOGS
// ============================================
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 100 }).notNull(),
    resource: varchar('resource', { length: 100 }),
    resourceId: varchar('resource_id', { length: 100 }),
    details: jsonb('details'),
    ipAddress: varchar('ip_address', { length: 50 }),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// REFRESH TOKENS (for auth)
// ============================================
export const refreshTokens = pgTable('refresh_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    token: varchar('token', { length: 500 }).unique().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================
// COMPLIANCE REQUESTS
// ============================================
export const complianceRequests = pgTable('compliance_requests', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    requestType: varchar('request_type', { length: 50 }).notNull(), // rent_relief | sme_status
    documentUrl: varchar('document_url', { length: 500 }),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    reviewedBy: uuid('reviewed_by').references(() => users.id),
    reviewNotes: text('review_notes'),
    reviewedAt: timestamp('reviewed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
