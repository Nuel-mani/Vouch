import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { ProfileForm } from './_components/ProfileForm';
import { ComplianceUpload } from './_components/ComplianceUpload';
import { PersonalWelcomeModal } from './_components/PersonalWelcomeModal';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) return null;

    // Redirect business users to Brand Studio
    if (user.accountType === 'business') {
        redirect('/settings/branding');
    }

    // Fetch full user data including compliance state
    const fullUser = await db.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            email: true,
            businessName: true,
            accountType: true,
            businessStructure: true,
            sector: true,
            taxIdentityNumber: true,
            nin: true,
            bvn: true,
            businessAddress: true,
            phoneNumber: true,
            residenceState: true,
            paysRent: true,
            rentAmount: true,
            annualIncome: true,
            countryCode: true,
            currencySymbol: true,
            complianceSuspended: true,
            // For modal logic
            updatedAt: true,
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

    // Determine if welcome modal should show
    // Show if: New account (no residence/income set) OR we want to force a periodic check
    // Simple heuristic: If residenceState is missing, they haven't onboarded fully.
    const showWelcomeModal = !fullUser.residenceState || !fullUser.annualIncome;

    return (
        <div className="max-w-3xl space-y-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[var(--foreground)]">Vouch ID</h1>
                <p className="text-[var(--muted-foreground)] mt-1">Your identity and tax profile</p>
            </div>

            <ProfileForm user={{
                ...fullUser,
                rentAmount: fullUser.rentAmount ? Number(fullUser.rentAmount) : null,
                annualIncome: fullUser.annualIncome ? Number(fullUser.annualIncome) : null,
            }} />

            {/* Compliance Documents Section */}
            <div className="pt-8 border-t border-[var(--border)]">
                <ComplianceUpload
                    existingRequests={complianceRequests}
                    accountType="personal"
                    isSuspended={fullUser.complianceSuspended || false}
                    rejectionCount={rejectionCount}
                />
            </div>

            {/* Client-side Modal Wrapper needed? 
                Actually, to make the modal interactive (useState for close), we need a client wrapper or logic.
                Since this is a Server Component, we can pass a prop to ProfileForm or render a Client logic component.
                Let's make PersonalWelcomeModal client-side and render it directly.
            */}
            <PersonalWelcomeModal
                initiallyOpen={showWelcomeModal}
                user={{
                    ...fullUser,
                    rentAmount: fullUser.rentAmount ? Number(fullUser.rentAmount) : null,
                    annualIncome: fullUser.annualIncome ? Number(fullUser.annualIncome) : null,
                }}
            // onClose is optional and cannot be passed from Server Component (it's a function)
            />
        </div>
    );
}
