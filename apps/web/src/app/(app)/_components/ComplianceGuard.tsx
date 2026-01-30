'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface ComplianceGuardProps {
    user: {
        accountType: string | null;
        onboardingCompleted: boolean | null;
    };
}

export function ComplianceGuard({ user }: ComplianceGuardProps) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // If onboarding is already complete, do nothing
        if (user.onboardingCompleted) return;

        // Allow access to settings pages where they can complete onboarding
        if (pathname.startsWith('/settings')) return;

        // Smart Redirect Logic
        if (user.accountType === 'business') {
            toast.error('Please complete your Business Branding & Tax Profile to continue.', {
                duration: 5000,
                id: 'onboarding-required' // Prevent duplicates
            });
            router.push('/settings/branding');
        } else {
            toast.error('Please update your Vouch ID (NIN/BVN) to continue.', {
                duration: 5000,
                id: 'onboarding-required'
            });
            router.push('/settings');
        }
    }, [user.onboardingCompleted, user.accountType, pathname, router]);

    return null; // This component renders nothing
}
