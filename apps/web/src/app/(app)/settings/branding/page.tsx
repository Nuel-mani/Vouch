import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { BrandingForm } from './_components/BrandingForm';
import { ComplianceUpload } from '../_components/ComplianceUpload';

export default async function BrandingPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) return null;

    // Fetch user branding data
    const fullUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            brandColor: true,
            logoUrl: true,
            stampUrl: true,
            invoiceTemplate: true,
            invoiceFont: true,
            businessName: true,
            businessAddress: true,
            phoneNumber: true,
            businessStructure: true,
            sector: true,
            taxIdentityNumber: true,
            nin: true,
            bvn: true,
            totalAssets: true,
            isProfessionalService: true,
            showWatermark: true,
            complianceSuspended: true,
        },
    });

    if (!fullUser) return null;

    // Fetch compliance requests
    const allComplianceRequests = await db.complianceRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            requestType: true,
            status: true,
            documentName: true,
            createdAt: true,
            adminNotes: true,
        },
    });

    // Filter: hide rejected requests if there's an approved one of the same type
    const approvedTypes = allComplianceRequests
        .filter(r => r.status === 'approved')
        .map(r => r.requestType);

    const complianceRequests = allComplianceRequests.filter(r =>
        r.status !== 'rejected' || !approvedTypes.includes(r.requestType)
    );

    const rejectionCount = allComplianceRequests.filter(r => r.status === 'rejected').length;

    return (
        <div className="h-full w-full flex flex-col">
            <BrandingForm user={{
                ...fullUser,
                totalAssets: fullUser.totalAssets ? Number(fullUser.totalAssets) : 0,
            }} />

            {/* Compliance Documents Section - shown below the branding form */}
            <div className="max-w-3xl mx-auto w-full p-8 border-t border-[var(--border)]">
                <ComplianceUpload
                    existingRequests={complianceRequests}
                    accountType="business"
                    isSuspended={fullUser.complianceSuspended || false}
                    rejectionCount={rejectionCount}
                />
            </div>
        </div>
    );
}
