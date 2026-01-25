// Polyfill for DOMMatrix in Node.js environment (required by pdf-parse/pdfjs-dist)
if (typeof global.DOMMatrix === 'undefined') {
    (global as any).DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor() { }
        setMatrixValue() { return this; }
        translate() { return this; }
        scale() { return this; }
        rotate() { return this; }
        multiply() { return this; }
        inverse() { return this; }
        transformPoint(p: any) { return p; }
    };
}

// Handle pdf-parse import 
// Bypass index.js (which has a broken debug check) and import the core lib directly
const pdf = require('pdf-parse/lib/pdf-parse.js');
import { randomUUID } from 'crypto';
import { categorizeTransaction } from '../tax/categoryMapper';

export interface ExtractedTransaction {
    id: string;
    date: Date;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    narration: string; // The raw bank narration
    payee?: string;
    categoryId?: string;
    categoryName?: string;
    isDeductible?: boolean;
    compliance: {
        isInternalTransfer: boolean;
        isTaxCredit: boolean;
        isBankCharge: boolean;
        isDigitalAsset: boolean;
        flaggedForReview: boolean;
        notes: string[];
    };
    meta: {
        bankName: string;
        originalLine: string;
    };
}

export interface BankParserAdapter {
    name: string;
    canParse(text: string): boolean;
    parse(text: string, userBusinessName: string): Promise<ExtractedTransaction[]>;
}

// --- Compliance Logic Helpers ---

const TAX_CREDIT_KEYWORDS = ['wht on interest', 'withholding tax'];
const CRYPTO_KEYWORDS = ['binance', 'quidax', 'bybit', 'luno', 'bundle', 'yellow card', 'patricia', 'roqqu'];
const INTERNAL_TRANSFER_KEYWORDS = ['self trf', 'internal trf', 'transfer to self'];
const BANK_CHARGE_KEYWORDS = ['stamp duty', 'sms charge', 'card maintenance', 'transfer fee', 'electronic transfer levy', 'emtl'];

function detectCompliance(tx: Partial<ExtractedTransaction>, userBusinessName: string): ExtractedTransaction['compliance'] {
    const narration = (tx.narration || '').toLowerCase();
    const description = (tx.description || '').toLowerCase();
    const combined = `${description} ${narration}`;

    const compliance = {
        isInternalTransfer: false,
        isTaxCredit: false,
        isBankCharge: false,
        isDigitalAsset: false,
        flaggedForReview: false,
        notes: [] as string[],
    };

    if (INTERNAL_TRANSFER_KEYWORDS.some(k => combined.includes(k))) {
        compliance.isInternalTransfer = true;
        compliance.notes.push('Flagged as Internal Transfer (Non-Taxable)');
    }

    if (TAX_CREDIT_KEYWORDS.some(k => combined.includes(k))) {
        compliance.isTaxCredit = true;
        compliance.notes.push('Potential Tax Credit detected (WHT)');
    }

    if (BANK_CHARGE_KEYWORDS.some(k => combined.includes(k)) || (tx.amount === 50 && tx.type === 'expense')) {
        compliance.isBankCharge = true;
        compliance.notes.push('Deductible Bank Charge');
    }

    if (CRYPTO_KEYWORDS.some(k => combined.includes(k))) {
        compliance.isDigitalAsset = true;
        compliance.flaggedForReview = true;
        compliance.notes.push('Digital Asset activity detected. Verify if Capital Gain or Income.');
    }

    return compliance;
}

function inferTypeFromKeywords(text: string, currentBal: number, prevBal: number): 'income' | 'expense' {
    const t = text.toLowerCase();
    if (t.includes('interest paid') || t.includes('transfer from') || t.includes('deposit') || t.includes('credit') || t.includes('inward')) return 'income';
    if (t.includes('sms charges') || t.includes('wht') || t.includes('transfer to') || t.includes('debit') || t.includes('withdrawal') || t.includes('outward')) return 'expense';

    if (currentBal !== 0 && prevBal !== 0) {
        return currentBal > prevBal ? 'income' : 'expense';
    }
    return 'expense';
}


// --- Adapters ---

const UbaAdapter: BankParserAdapter = {
    name: 'UBA',
    canParse: (text) => (text.includes('United Bank for Africa') || text.includes('UBA')) && (text.includes('Account Number') || text.includes('Account Type')),
    async parse(text, userBusinessName) {
        const transactions: ExtractedTransaction[] = [];
        const lines = text.split('\n');

        const IGNORE_PATTERNS = [
            'bank statement', 'account number', 'total debit', 'total credit',
            'opening balance', 'closing balance', 'united bank for africa',
            'trans date', 'value date', 'narration', 'balance', 'page',
            'scan this qr', 'chat with leo'
        ];

        const ubaDateRegex = /(\d{2}-[A-Za-z]{3}-\d{4})/;

        interface ParsedLine {
            date: Date;
            txnAmount: number;
            lineBalance: number;
            narration: string;
            originalLine: string;
            context: string;
        }
        const parsedLines: ParsedLine[] = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (IGNORE_PATTERNS.some(p => line.toLowerCase().includes(p))) continue;

            const dateMatch = line.match(ubaDateRegex);
            if (dateMatch) {
                try {
                    const dateStr = dateMatch[1];
                    const date = new Date(dateStr);

                    const contextRows = lines.slice(i, i + 6);
                    const context = contextRows.join(' ');

                    const amountMatches = context.match(/([\d,]+\.\d{2})/g);

                    if (!amountMatches || amountMatches.length < 2) continue;

                    const lineBalance = parseFloat(amountMatches[amountMatches.length - 1].replace(/,/g, ''));
                    const txnAmount = parseFloat(amountMatches[amountMatches.length - 2].replace(/,/g, ''));

                    if (txnAmount === 2025 || txnAmount === 2024 || txnAmount === 2026) continue;

                    let narration = context;
                    narration = narration.replace(/(\d{2}-[A-Za-z]{3}-\d{4})/g, '').trim();
                    narration = narration.replace(amountMatches[amountMatches.length - 1], '');
                    narration = narration.replace(amountMatches[amountMatches.length - 2], '');
                    narration = narration.replace(/[₦N]/g, '');
                    narration = narration.replace(/\s+/g, ' ').trim();

                    parsedLines.push({
                        date,
                        txnAmount,
                        lineBalance,
                        narration: narration.substring(0, 150),
                        originalLine: line,
                        context
                    });
                } catch (e) { }
            }
        }

        for (let i = 0; i < parsedLines.length; i++) {
            const current = parsedLines[i];
            let type: 'income' | 'expense' = 'expense';

            if (i < parsedLines.length - 1) {
                const prevTxnState = parsedLines[i + 1];
                const delta = current.lineBalance - prevTxnState.lineBalance;

                if (Math.abs(delta - current.txnAmount) < 1.0) {
                    type = 'income';
                } else if (Math.abs(delta + current.txnAmount) < 1.0) {
                    type = 'expense';
                } else {
                    type = inferTypeFromKeywords(current.narration, current.lineBalance, prevTxnState.lineBalance);
                }
            } else {
                type = inferTypeFromKeywords(current.narration, 0, 0);
            }

            const category = categorizeTransaction(current.narration, current.context, type);

            transactions.push({
                id: randomUUID(),
                date: current.date,
                amount: current.txnAmount,
                type,
                description: current.narration,
                narration: current.context,
                categoryId: category?.categoryId,
                categoryName: category?.categoryName,
                isDeductible: category?.isDeductible,
                compliance: detectCompliance({ description: current.narration, narration: current.context, type, amount: current.txnAmount }, userBusinessName),
                meta: { bankName: 'UBA', originalLine: current.originalLine }
            });
        }

        return transactions;
    }
};

const KudaAdapter: BankParserAdapter = {
    name: 'Kuda',
    canParse: (text) => text.includes('Kuda MF Bank') || text.includes('Kuda'),
    async parse(text, userBusinessName) {
        const transactions: ExtractedTransaction[] = [];
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        console.log('[Kuda Parser] Total lines:', lines.length);

        // Extract Opening Balance for differential logic
        let runningBalance = 0;
        const openingBalanceMatch = text.match(/Opening\s+Balance[:\s]*[₦N]?\s*([\d,]+\.\d{2})/i);
        if (openingBalanceMatch) {
            runningBalance = parseFloat(openingBalanceMatch[1].replace(/,/g, ''));
            console.log('[Kuda Parser] Opening Balance:', runningBalance);
        }

        // PDF extracts each cell on its own line. Pattern observed:
        // Line N: "02/12/25" (date only)
        // Line N+1: "19:40:45" (time only)  
        // Line N+2: "N200.00" or amount mixed with text
        // ... more data ...
        // Balance appears later

        // Match lines that are JUST a date (dd/mm/yy format)
        const dateOnlyRegex = /^(\d{2})\/(\d{2})\/(\d{2})$/;

        // Skip patterns - these lines are headers/summaries
        const SKIP_PATTERNS = [
            'opening balance', 'closing balance', 'money in', 'money out',
            'statement period', 'account number', 'total debit', 'total credit',
            'summary', 'date/time', 'category', 'to / from', 'description',
            'kuda mf bank', 'account name', 'customer statement', 'nigeria',
            'page', 'technologies', 'ltd', 'pavement', 'london'
        ];

        let i = 0;
        while (i < lines.length) {
            const line = lines[i];

            // Skip header/summary lines
            if (SKIP_PATTERNS.some(p => line.toLowerCase().includes(p))) {
                i++;
                continue;
            }

            const dateMatch = line.match(dateOnlyRegex);

            if (dateMatch) {
                const [, d, m, y] = dateMatch;
                const date = new Date(`20${y}-${m}-${d}T12:00:00Z`);

                // Find the NEXT date line to know where this transaction ends
                let nextDateIndex = i + 1;
                while (nextDateIndex < lines.length && !lines[nextDateIndex].match(dateOnlyRegex)) {
                    nextDateIndex++;
                }

                // Collect lines from current date to just before the next date (or max 10 lines)
                const endIndex = Math.min(nextDateIndex, i + 10);
                const contextLines = lines.slice(i, endIndex);
                const context = contextLines.join(' ');

                console.log(`[Kuda Parser] Date at line ${i}: ${line}, context lines: ${i} to ${endIndex - 1}`);

                // Find all monetary amounts in this transaction's context ONLY
                const amountRegex = /[₦N]?\s*([\d,]+\.\d{2})/g;
                const amounts: number[] = [];
                let match;
                while ((match = amountRegex.exec(context)) !== null) {
                    const amt = parseFloat(match[1].replace(/,/g, ''));
                    if (amt > 0 && !amounts.includes(amt)) {
                        amounts.push(amt);
                    }
                }

                console.log(`[Kuda Parser] Amounts:`, amounts);

                if (amounts.length < 2) {
                    console.log(`[Kuda Parser] Skipping - not enough amounts`);
                    i++;
                    continue;
                }

                // Last amount is the balance
                const lineBalance = amounts[amounts.length - 1];

                // Find the transaction amount using differential check
                let txnAmount = 0;
                let type: 'income' | 'expense' = 'expense';
                let foundMatch = false;

                for (const candidate of amounts) {
                    if (candidate === lineBalance) continue;

                    // Check if income (balance increased)
                    if (Math.abs((runningBalance + candidate) - lineBalance) < 1.0) {
                        txnAmount = candidate;
                        type = 'income';
                        foundMatch = true;
                        break;
                    }

                    // Check if expense (balance decreased)
                    if (Math.abs((runningBalance - candidate) - lineBalance) < 1.0) {
                        txnAmount = candidate;
                        type = 'expense';
                        foundMatch = true;
                        break;
                    }
                }

                if (!foundMatch && amounts.length >= 2) {
                    // Fallback: first amount that isn't the balance
                    txnAmount = amounts.find(a => a !== lineBalance) || amounts[0];
                    const delta = lineBalance - runningBalance;
                    type = delta > 0 ? 'income' : 'expense';
                }

                // KEYWORD OVERRIDE: Only when differential check failed, use keywords
                // But ALWAYS override for strong expense patterns like stamp duty/fees
                const contextLower = context.toLowerCase();

                // Strong expense keywords that ALWAYS mean expense regardless of other factors
                const STRONG_EXPENSE_KEYWORDS = [
                    'stamp duty', 'fee', 'charge', 'levy', 'vat', 'tax'
                ];

                // If strong expense keyword found, override to expense
                if (STRONG_EXPENSE_KEYWORDS.some(kw => contextLower.includes(kw))) {
                    type = 'expense';
                } else if (!foundMatch) {
                    // Only use general keywords when differential check failed
                    const EXPENSE_KEYWORDS = ['debit', 'purchase', 'payment', 'withdrawal', 'pos', 'atm', 'outward'];
                    const INCOME_KEYWORDS = ['inward', 'credit', 'deposit', 'received', 'refund'];

                    if (EXPENSE_KEYWORDS.some(kw => contextLower.includes(kw))) {
                        type = 'expense';
                    } else if (INCOME_KEYWORDS.some(kw => contextLower.includes(kw))) {
                        type = 'income';
                    }
                }

                if (txnAmount === 0 || txnAmount === lineBalance) {
                    console.log(`[Kuda Parser] Skipping - invalid txnAmount`);
                    i++;
                    continue;
                }

                console.log(`[Kuda Parser] Transaction: ${type} ${txnAmount}, balance: ${runningBalance} -> ${lineBalance}`);
                runningBalance = lineBalance;

                // Build description from context (remove dates, times, amounts)
                let description = context
                    .replace(/\d{2}\/\d{2}\/\d{2}/g, '')
                    .replace(/\d{2}:\d{2}:\d{2}/g, '')
                    .replace(/[₦N]?\s*[\d,]+\.\d{2}/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();

                // Clean common words
                ['inward', 'outward', 'transfer', 'pos', 'web', 'atm', 'airtime', 'bills'].forEach(kw => {
                    description = description.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '');
                });
                description = description.replace(/\s+/g, ' ').trim();
                if (!description) description = 'Transaction';

                const category = categorizeTransaction(description, context, type);

                transactions.push({
                    id: randomUUID(),
                    date,
                    amount: txnAmount,
                    type,
                    description: description.substring(0, 100),
                    narration: context.substring(0, 200),
                    categoryId: category?.categoryId,
                    categoryName: category?.categoryName,
                    isDeductible: category?.isDeductible,
                    compliance: detectCompliance({ description, narration: context, type, amount: txnAmount }, userBusinessName),
                    meta: { bankName: 'Kuda', originalLine: line }
                });

                // Move to after the context we just processed (but don't skip past the next date)
                i = endIndex;
            } else {
                i++;
            }
        }

        console.log(`[Kuda Parser] Extracted ${transactions.length} transactions`);
        return transactions;
    }
};

export async function parseBankStatementPDF(buffer: Buffer, userBusinessName: string): Promise<ExtractedTransaction[]> {
    let text = '';

    try {
        const data = await pdf(buffer);
        text = data.text;
    } catch (e: any) {
        console.error('PDF Parse Error Details:', e);
        throw new Error(`Failed to parse PDF document: ${e.message}`);
    }

    if (!text || text.length === 0) {
        throw new Error('PDF parsing resulted in empty text. The file might be image-only or scanning failed.');
    }

    const adapters = [UbaAdapter, KudaAdapter];
    const adapter = adapters.find(a => a.canParse(text));

    if (!adapter) {
        console.log('Unmatched PDF Text Sample:', text.substring(0, 500));
        throw new Error('Unsupported bank statement format. Currently supporting: UBA, Kuda.');
    }

    return adapter.parse(text, userBusinessName);
}
