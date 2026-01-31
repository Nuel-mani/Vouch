import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { Sidebar } from './_components/Sidebar';
import { TopBar } from './_components/TopBar';
import { db } from '@vouch/db';
import Link from 'next/link';
import { AlertTriangle, Settings } from 'lucide-react';
import { ComplianceGuard } from './_components/ComplianceGuard';
import { checkComplianceStatus } from '../(auth)/onboarding/check';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Auth check handled by middleware
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const rawUser = token ? await validateSession(token) : null;

    if (!rawUser) return null;

    // Check for compliance suspension and onboarding status
    // NOTE: We compute onboarding status dynamically via checkComplianceStatus
    // because the Prisma Client may be outdated (prisma generate failed).
    const dbUser = await db.user.findUnique({
        where: { id: rawUser.id },
        select: {
            complianceSuspended: true,
            accountType: true,
            // @ts-expect-error - Schema updated but client may be stale
            linkedUserId: true, // Needed for Sidebar switch button
            businessName: true,
            email: true,
            brandColor: true,
            subscriptionTier: true,
        }
    });

    // Dynamically check compliance status (bypasses stale Prisma types)
    const compliance = await checkComplianceStatus(rawUser.id);
    const onboardingCompleted = compliance.isComplete;

    const isSuspended = dbUser?.complianceSuspended;

    // If suspended, show restricted UI
    if (isSuspended) {
        // ... (Suspended UI remains the same)
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col">
                {/* Suspended Header */}
                <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} />
                        <div>
                            <div className="font-bold">Account Restricted</div>
                            <div className="text-sm opacity-90">Your account is suspended due to failed verification attempts</div>
                        </div>
                    </div>
                    <Link
                        href={rawUser.accountType === 'business' ? '/settings/branding' : '/settings'}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                    >
                        <Settings size={18} />
                        Verify Now
                    </Link>
                </div>

                {/* Main Content - Only Settings */}
                <main className="flex-1 p-6 lg:p-8 max-w-4xl mx-auto w-full">
                    {children}
                </main>
            </div>
        );
    }

    // Fetched client-side now to improve performance
    const riskyCount = 0;

    // Merge session user with freshly fetched DB fields to ensure Sidebar has latest data
    const user = {
        ...JSON.parse(JSON.stringify(rawUser)),
        ...dbUser
    };

    return (
        <div className="min-h-screen bg-[var(--muted)] dark:bg-slate-950 flex">
            {/* Enforcement Guard */}
            <ComplianceGuard user={{ accountType: dbUser?.accountType || 'personal', onboardingCompleted }} />

            {/* Sidebar */}
            <Sidebar user={user} riskyCount={riskyCount} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:ml-64">
                {/* Top Bar */}
                <TopBar user={user} />

                {/* Page Content */}
                <main className="flex-1 p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
