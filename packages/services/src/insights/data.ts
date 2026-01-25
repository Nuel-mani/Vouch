import { CreateInsightInput } from './insightService';

export const INITIAL_INSIGHTS: CreateInsightInput[] = [
    {
        category: 'Small Business Shields',
        title: 'The ₦100M Safe Harbor',
        insight: 'If your annual turnover is under ₦100 million and fixed assets are below ₦250 million, you pay 0% Companies Income Tax. You are officially a "Small Company."',
        law: 'Section 56, NTA 2025',
        type: 'success',
        impact: '0% CIT Rate'
    },
    {
        category: 'Small Business Shields',
        title: 'Development Levy Waiver',
        insight: 'Small companies are exempt from the new 4% Development Levy. This replaces the old multiple taxes (TET, NITDA, etc.) just for you.',
        law: 'Section 59, NTA 2025',
        type: 'success',
        impact: 'Save 4% Levy'
    },
    {
        category: 'Small Business Shields',
        title: 'VAT-Free Status',
        insight: 'Small businesses under the ₦100M threshold don’t need to charge VAT on their sales. This makes your prices 7.5% cheaper than big competitors!',
        law: 'Section 185, NTA 2025',
        type: 'opportunity',
        impact: '7.5% Price Advantage'
    },
    {
        category: 'Small Business Shields',
        title: 'WHT Immunity for Manufacturers',
        insight: 'Locally manufactured goods are now exempt from Withholding Tax (WHT) at the point of sale. Keep your cash in your pocket!',
        law: 'Nigeria Tax Reform Guidelines (NTA 2025)',
        type: 'success',
        impact: 'Improved Cashflow'
    },
    {
        category: 'Small Business Shields',
        title: 'Professional Service Warning',
        insight: 'Even if you earn only ₦1, you aren\'t a "Small Company" if you provide professional services (Lawyers, Accountants). You must pay the standard tax rate.',
        law: 'Section 56(2), NTA 2025',
        type: 'warning',
        impact: 'Standard Tax Applies'
    },
    {
        category: 'Expense & Deduction Hacks',
        title: 'The 20% Rent Relief',
        insight: 'Pay yourself first! You can deduct 20% of your annual rent (up to ₦500,000) from your taxable income.',
        law: 'Section 30(vi), NTA 2025',
        type: 'opportunity',
        impact: 'Deduct 20% Rent'
    },
    {
        category: 'Expense & Deduction Hacks',
        title: 'The "Wholly & Exclusively" Win',
        insight: 'The law removed the word "Reasonably." If you can prove an expense was for business, the tax man can\'t reject it just because he thinks it\'s "too high."',
        law: 'Section 20, NTA 2025',
        type: 'success',
        impact: 'More Deductions'
    },
    {
        category: 'Expense & Deduction Hacks',
        title: 'VAT Receipt = Tax Deduction',
        insight: 'Rule 21(p): You cannot deduct an expense from your profit if you didn\'t pay VAT/Import duty on it. No receipt, no deduction!',
        law: 'Section 21(p), NTA 2025',
        type: 'warning',
        impact: 'Risk of Disallowance'
    },
    {
        category: 'Expense & Deduction Hacks',
        title: 'Straight-Line Depreciation (Vehicles)',
        insight: 'Bought a business car? You can deduct 25% of the cost every year for 4 years. No more complex math.',
        law: 'Section 27(2), NTA 2025',
        type: 'opportunity',
        impact: '25% Annual Deduction'
    },
    {
        category: 'Expense & Deduction Hacks',
        title: 'Software as an Asset',
        insight: 'Buying this app? Software is now a "Class 3" asset. You get a 25% tax break on the cost every year.',
        law: 'Fourth Schedule, NTA 2025',
        type: 'opportunity',
        impact: '25% Tax Break'
    },
    {
        category: 'Expense & Deduction Hacks',
        title: 'Research & Development (R&D) Cap',
        insight: 'Investing in new tech? You can deduct R&D costs up to 5% of your total turnover.',
        law: 'Section 165, NTA 2025',
        type: 'opportunity',
        impact: 'Up to 5% of Turnover'
    },
    {
        category: 'Expense & Deduction Hacks',
        title: 'The 6-Year Startup Shield',
        insight: 'Just starting? You can deduct business expenses incurred up to 6 years before you actually opened your doors.',
        law: 'Section 20(1), NTA 2025',
        type: 'success',
        impact: 'Retroactive Deduction'
    },
    {
        category: 'Expense & Deduction Hacks',
        title: 'Currency Conversion Tip',
        insight: 'Spent Dollars on business? You can only deduct the equivalent in Naira at the Official Exchange Rate on the day of the transaction.',
        law: 'Section 20(4), NTA 2025',
        type: 'warning',
        impact: 'Use Official Rate'
    },
    {
        category: 'Expense & Deduction Hacks',
        title: 'Donation Deductions',
        insight: 'Giving back? You can deduct donations up to 10% of your profit if you have the right documents.',
        law: 'Section 164, NTA 2025',
        type: 'opportunity',
        impact: 'Deduct 10% Profit'
    },
    {
        category: 'Employment & Staff Incentives',
        title: 'Low-Income Wage Relief',
        insight: 'If you give a transport subsidy to a worker earning under ₦100k, that subsidy is tax-exempt for them and deductible for you.',
        law: 'Section 13, NTA 2025',
        type: 'opportunity',
        impact: 'Tax-Free Subsidy'
    },
    {
        category: 'Employment & Staff Incentives',
        title: 'The "Minimum Wage" Ghost',
        insight: 'Staff earning the national minimum wage pay ₦0 in tax. Stop deducting PAYE from their small salaries!',
        law: 'Section 58, NTA 2025',
        type: 'warning',
        impact: 'Stop PAYE Deduction'
    },
    {
        category: 'Employment & Staff Incentives',
        title: 'Pension is a Shield',
        insight: 'Remitting staff pensions? Those contributions are 100% tax-free for the employee and deductible for the business.',
        law: 'NTA 2025 / Pension Reform Act',
        type: 'success',
        impact: '100% Deductible'
    },
    {
        category: 'Employment & Staff Incentives',
        title: 'Homeownership Incentive',
        insight: 'If your staff are paying mortgage interest on their primary home, they get a tax relief. Use this to boost staff morale!',
        law: 'Section 1.2, PWC Summary of NTA 2025',
        type: 'opportunity',
        impact: 'Staff Tax Relief'
    },
    {
        category: 'VAT & Input Credit Optimization',
        title: 'Input VAT Recovery (Services)',
        insight: 'You can now get a refund/offset on the VAT you pay for services (like security or internet), not just physical stock!',
        law: 'Section 189, NTA 2025',
        type: 'success',
        impact: 'Recover Service VAT'
    },
    {
        category: 'VAT & Input Credit Optimization',
        title: 'Zero-Rated Exports',
        insight: 'Selling products outside Nigeria? You charge 0% VAT. This makes your goods more attractive to foreign buyers.',
        law: 'Section 185, NTA 2025',
        type: 'opportunity',
        impact: '0% VAT on Exports'
    },
    {
        category: 'VAT & Input Credit Optimization',
        title: 'The ₦150M Share Shield',
        insight: 'Selling shares in your Nigerian company? If the proceeds are under ₦150 million, you pay ₦0 in Capital Gains Tax.',
        law: 'Section 34, NTA 2025',
        type: 'success',
        impact: '0% CGT'
    },
    {
        category: 'VAT & Input Credit Optimization',
        title: 'The "Food is Free" Rule',
        insight: 'Basic food items and medical services are 0% VAT rated. Ensure your canteen or clinic expenses aren\'t being taxed twice.',
        law: 'Section 185, NTA 2025',
        type: 'warning',
        impact: 'Avoid Double Tax'
    },
    {
        category: 'Compliance & Penalty Prevention',
        title: 'The Electronic Fiscal System (EFS)',
        insight: 'The government is watching! Using this app helps you meet the mandatory EFS requirement for accurate digital record keeping.',
        law: 'NTAA 2025, Section 3',
        type: 'warning',
        impact: 'Mandatory Compliance'
    },
    {
        category: 'Compliance & Penalty Prevention',
        title: 'The TIN Requirement',
        insight: 'You cannot open a business bank account or get a government contract without a TIN. Check your TIN status on our profile page!',
        law: 'Section 1, NTAA 2025',
        type: 'warning',
        impact: 'Bank Ban Risk'
    },
    {
        category: 'Compliance & Penalty Prevention',
        title: 'Quarterly Bank Reports',
        insight: 'Banks must report corporate transactions above ₦100 million monthly. Keep your records straight to match what the bank sends to FIRS.',
        law: 'Section 5, NTAA 2025',
        type: 'warning',
        impact: 'Audit Risk'
    },
    {
        category: 'Compliance & Penalty Prevention',
        title: 'The ₦5M Unregistered Vendor Trap',
        insight: 'Doing business with a company that has no TIN? You could face a ₦5 million penalty. Always verify your vendors in the app!',
        law: 'NTAA 2025 / General Enforcement',
        type: 'warning',
        impact: '₦5M Penalty Risk'
    },
    {
        category: 'Strategic Industry Insights',
        title: 'Green Energy Credit',
        insight: 'Installing solar panels? You may qualify for a residential or business clean energy credit.',
        law: 'Section 5.1, IRS/NRS Clean Energy Guide',
        type: 'opportunity',
        impact: 'Energy Credit'
    },
    {
        category: 'Strategic Industry Insights',
        title: 'Pioneer Status Replacement',
        insight: 'Tax holidays are out; 5% Tax Credits are in! You get credits based on how much you actually invest in machinery.',
        law: 'Section 4.1, EDTI (Economic Development Tax Incentive)',
        type: 'opportunity',
        impact: '5% Investment Credit'
    },
    {
        category: 'Strategic Industry Insights',
        title: 'Export Expansion Grant (EEG)',
        insight: 'Fully manufactured exports get a 15% grant rate. That\'s extra cash for every unit shipped abroad!',
        law: 'EEG Scheme / NTA 2025',
        type: 'success',
        impact: '15% Cash Grant'
    },
    {
        category: 'Strategic Industry Insights',
        title: 'Gas Utilization Incentive',
        insight: 'Using gas for your factory? You are entitled to a tax-free period for up to 5 years.',
        law: 'Section 4.3, Gas Utilization Incentives',
        type: 'opportunity',
        impact: '5-Year Tax Free'
    },
    {
        category: 'General Wealth Preservation',
        title: 'Stamp Duty Exemption (Small Transfers)',
        insight: 'Transfers under ₦10,000 are exempt from Electronic Money Transfer Levies.',
        law: 'Section 4.2, NTA 2025',
        type: 'success',
        impact: 'No EMTL'
    },
    {
        category: 'General Wealth Preservation',
        title: 'Loss of Employment Compensation',
        insight: 'If a business pays a staff for "loss of office," up to ₦50 million of that payment is tax-free.',
        law: 'Section 50(1), NTA 2025',
        type: 'success',
        impact: '₦50M Tax Free'
    },
    {
        category: 'General Wealth Preservation',
        title: 'Government Bond Interest',
        insight: 'Interest earned from Federal and State Government bonds is 100% tax-exempt.',
        law: 'Section 1.2, NTA 2025',
        type: 'success',
        impact: 'Tax-Free Interest'
    },
    {
        category: 'General Wealth Preservation',
        title: 'Digital Asset Taxation',
        insight: 'Trading Crypto or NFTs? Chargeable gains on digital assets are now officially taxed at your income rate. Report them to avoid audits!',
        law: 'Section 34, NTA 2025',
        type: 'warning',
        impact: 'Taxed at Income Rate'
    },
    {
        category: 'General Wealth Preservation',
        title: 'The "183-Day" Global Rule',
        insight: 'If you live in Nigeria for 183 days a year, you must pay tax on your worldwide income.',
        law: 'Section 13, NTA 2025',
        type: 'warning',
        impact: 'Worldwide Tax'
    },
    {
        category: 'Asset & Investment Strategy',
        title: 'No Proration for Capital Allowance',
        insight: 'Buy a generator on December 30th? You still get the full year’s tax deduction for it. You don\'t have to divide it by months!',
        law: 'Section 27, NTA 2025',
        type: 'opportunity',
        impact: 'Full Year Deduction'
    },
    {
        category: 'Asset & Investment Strategy',
        title: 'Merge to Save Tax',
        insight: 'Merging with another company? You can transfer unused tax credits and losses to the new company.',
        law: 'Section 189, NTA 2025',
        type: 'opportunity',
        impact: 'Transfer Credits'
    },
    {
        category: 'Asset & Investment Strategy',
        title: 'Agricultural Equipment',
        insight: 'Agricultural equipment gets a 20% yearly deduction. This is separate from the 5-year tax holiday!',
        law: 'Section 1.4, NTA 2025',
        type: 'opportunity',
        impact: '20% Yearly Deduction'
    },
    {
        category: 'Asset & Investment Strategy',
        title: 'Intangible Assets (Patents)',
        insight: 'Patented a new process? You can deduct 10% of the cost every year as an intangible asset.',
        law: 'Section 1.4, NTA 2025',
        type: 'opportunity',
        impact: '10% Annual Deduction'
    },
    {
        category: 'Asset & Investment Strategy',
        title: 'Heavy Transportation Equipment',
        insight: 'Buying trucks? You get a 10% annual allowance. Keep those logbooks ready for the FIRS.',
        law: 'Section 1.4, NTA 2025',
        type: 'opportunity',
        impact: '10% Annual Allowance'
    },
    {
        category: 'Audit & Filing Mastery',
        title: '30-Day Accounting Change',
        insight: 'Changing your financial year? You must notify the tax authority 30 days before you file.',
        law: 'Section 23, NTA 2025',
        type: 'warning',
        impact: 'Mandatory Notice'
    },
    {
        category: 'Audit & Filing Mastery',
        title: 'Force of Attraction',
        insight: 'If a foreign partner does work in Nigeria, they are taxed even if the contract was signed abroad. Watch your partnerships!',
        law: 'Section 2.1, NTA 2025',
        type: 'warning',
        impact: 'Foreign Partner Tax'
    },
    {
        category: 'Audit & Filing Mastery',
        title: 'Connected Party Interest',
        insight: 'Borrowing from a sister company? Interest deductions are now capped to prevent "tax shifting."',
        law: 'Section 165, NTA 2025',
        type: 'warning',
        impact: 'Interest Cap'
    },
    {
        category: 'Audit & Filing Mastery',
        title: 'WHT as a Pre-payment',
        insight: 'Don\'t see WHT as a cost! It is an advance payment. Use your WHT credit notes to reduce your final tax bill at the end of the year.',
        law: 'NTAA 2025 Guidelines',
        type: 'opportunity',
        impact: 'Reduce Final Tax'
    },
    {
        category: 'Audit & Filing Mastery',
        title: 'Administrative Penalties',
        insight: 'Failing to file on time costs ₦10,000,000 for the first month. The app\'s "Auto-Remind" feature is your ₦10M insurance!',
        law: 'Section 4, NTAA 2025',
        type: 'warning',
        impact: 'Avoid ₦10M Fine'
    },
    {
        category: 'The "Hidden" Reliefs',
        title: 'Angel Investor Relief',
        insight: 'Investing in a startup? If you hold your shares for over 24 months, any profit you make from selling them is tax-free.',
        law: 'Section 1.1, NTA 2025',
        type: 'opportunity',
        impact: 'Tax-Free Profit'
    },
    {
        category: 'The "Hidden" Reliefs',
        title: 'Public Education Exemption',
        insight: 'Running a registered school of "public character"? Your profits are exempt from income tax.',
        law: 'Section 1.4, NTA 2025',
        type: 'success',
        impact: 'Tax Exempt'
    },
    {
        category: 'The "Hidden" Reliefs',
        title: 'Foreign Dividend Exemption',
        insight: 'Dividends brought into Nigeria from abroad are tax-free if repatriated through official bank channels.',
        law: 'Section 1.2, NTA 2025',
        type: 'success',
        impact: 'Tax-Free Dividends'
    },
    {
        category: 'The "Hidden" Reliefs',
        title: 'Sporting Activity Relief',
        insight: 'Profits from companies engaged in sporting activities are exempt from tax.',
        law: 'Section 1.2, NTA 2025',
        type: 'success',
        impact: 'Tax Exempt'
    },
    {
        category: 'The "Hidden" Reliefs',
        title: 'Libel & Slander Compensation',
        insight: 'Compensation for injury to reputation (libel) is 100% tax-free income.',
        law: 'Section 1.2, NTA 2025',
        type: 'success',
        impact: 'Tax-Free Compensation'
    }
];
