
export interface CategoryResult {
    categoryId: string;
    categoryName: string;
    isDeductible: boolean;
}

// Basic Keyword Map for NTA 2025 Compliance
// In a real app, this might come from a database or a more complex规则 engine
const CATEGORY_RULES = [
    {
        keywords: ['airtime', 'mtn', 'glo', 'airtel', '9mobile', 'data'],
        name: 'Communication',
        id: 'communication',
        isDeductible: true
    },
    {
        keywords: ['fuel', 'diesel', 'petrol', 'gas station', 'total', 'oando', 'shell'],
        name: 'Fuel & Transport',
        id: 'fuel',
        isDeductible: true
    },
    {
        keywords: ['uber', 'bolt', 'indriver', 'taxi', 'transport'],
        name: 'Transport',
        id: 'transport',
        isDeductible: true
    },
    {
        keywords: ['nephetamine', 'nepa', 'phcn', 'ekedc', 'ikedc', 'aedc', 'power', 'electricity'],
        name: 'Utilities',
        id: 'utilities',
        isDeductible: true
    },
    {
        keywords: ['food', 'restaurant', 'eatery', 'chicken', 'dominos', 'pizza'],
        name: 'Meals (Non-Deductible)',
        id: 'meals',
        isDeductible: false // Usually personal unless client entertainment
    },
    {
        keywords: ['web handling', 'hosting', 'domain', 'google', 'aws', 'heroku', 'digitalocean', 'namecheap'],
        name: 'Web & Software',
        id: 'software',
        isDeductible: true
    },
    {
        keywords: ['salary', 'wages', 'staff'],
        name: 'Salaries',
        id: 'salaries',
        isDeductible: true
    },
    {
        keywords: ['rent', 'lease'],
        name: 'Rent',
        id: 'rent',
        isDeductible: true
    },
    {
        keywords: ['bank charge', 'sms charge', 'maintenance fee', 'stamp duty', 'emtl'],
        name: 'Bank Charges',
        id: 'bank_charges',
        isDeductible: true
    },
    {
        keywords: ['transfer fee'],
        name: 'Bank Charges',
        id: 'bank_charges',
        isDeductible: true
    }
];

export function categorizeTransaction(description: string, narration: string, type: 'income' | 'expense'): CategoryResult | null {
    if (type === 'income') {
        // Simple default for income
        return null;
    }

    const text = (description + ' ' + narration).toLowerCase();

    for (const rule of CATEGORY_RULES) {
        if (rule.keywords.some(k => text.includes(k))) {
            return {
                categoryId: rule.id,
                categoryName: rule.name,
                isDeductible: rule.isDeductible
            };
        }
    }

    return null;
}
