/**
 * Digital Asset Tax Calculation (NTA 2025)
 * Capital Gains Tax on Crypto, NFTs, and Digital Assets = 10%
 */

export interface DigitalAssetTransaction {
    acquisitionCost: number; // What you paid to acquire the asset
    disposalValue: number;   // What you sold it for
    transactionDate: Date;
}

export interface DigitalAssetTaxResult {
    totalGain: number;
    totalLoss: number;
    netCapitalGain: number;
    taxPayable: number; // 10% of net capital gain
}

const DIGITAL_ASSET_CGT_RATE = 0.10; // 10%

export function calculateDigitalAssetTax(
    transactions: DigitalAssetTransaction[]
): DigitalAssetTaxResult {
    let totalGain = 0;
    let totalLoss = 0;

    transactions.forEach(tx => {
        const gain = tx.disposalValue - tx.acquisitionCost;

        if (gain > 0) {
            totalGain += gain;
        } else {
            totalLoss += Math.abs(gain);
        }
    });

    // Net capital gain (gains - losses)
    const netCapitalGain = Math.max(0, totalGain - totalLoss);

    // 10% CGT on net capital gain
    const taxPayable = netCapitalGain * DIGITAL_ASSET_CGT_RATE;

    return {
        totalGain,
        totalLoss,
        netCapitalGain,
        taxPayable
    };
}

/**
 * Helper to determine if a transaction is a digital asset
 */
export function isDigitalAsset(category?: string): boolean {
    if (!category) return false;

    const digitalAssetCategories = [
        'crypto',
        'cryptocurrency',
        'bitcoin',
        'ethereum',
        'nft',
        'digital asset',
        'token'
    ];

    return digitalAssetCategories.some(keyword =>
        category.toLowerCase().includes(keyword)
    );
}
