import { db } from '@vouch/db';

export async function checkComplianceStatus(userId: string) {
    const user = await db.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            accountType: true,
            // Personal Identifiers
            nin: true,
            bvn: true,
            // Business Identifiers
            cacNumber: true,
            taxIdentityNumber: true,
            businessName: true,
            // Branding (Visual Trust)
            logoUrl: true,
            stampUrl: true,
        }
    });

    if (!user) return { isComplete: false, missingFields: ['User not found'] };

    let isComplete = false;
    const missingFields: string[] = [];

    if (user.accountType === 'personal') {
        // NTA 2025: Individuals must have NIN and BVN
        if (!user.nin || user.nin.length < 6) missingFields.push('NIN (National ID)');
        if (!user.bvn || user.bvn.length < 6) missingFields.push('BVN (Bank Verification)');

        isComplete = missingFields.length === 0;
    }
    else if (user.accountType === 'business') {
        const busUser = user as any;
        // NTA 2025: Businesses must have CAC, TIN, and Branding (Logo/Stamp)
        if (!busUser.cacNumber || busUser.cacNumber.length < 3) missingFields.push('CAC Number');
        if (!busUser.taxIdentityNumber || busUser.taxIdentityNumber.length < 6) missingFields.push('Tax ID (TIN)');
        if (!busUser.logoUrl) missingFields.push('Company Logo');
        if (!busUser.stampUrl) missingFields.push('Digital Stamp/Seal');

        isComplete = missingFields.length === 0;
    }

    // Update the DB if status changed (or just ensure it's set)
    if (isComplete && !(user as any).onboardingCompleted) {
        await db.user.update({
            where: { id: userId },
            data: { onboardingCompleted: true }
        });
    }

    return { isComplete, missingFields };
}
