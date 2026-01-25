'use server';

import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    await db.user.update({
        where: { id: user.id },
        data: {
            businessName: formData.get('businessName') as string || null,
            phoneNumber: formData.get('phoneNumber') as string || null,
            businessAddress: formData.get('businessAddress') as string || null,
            residenceState: formData.get('residenceState') as string || null,
            businessStructure: formData.get('businessStructure') as string || null,
            sector: formData.get('sector') as string || null,
            taxIdentityNumber: formData.get('taxIdentityNumber') as string || null,
            nin: formData.get('nin') as string || null,
            bvn: formData.get('bvn') as string || null,
            paysRent: formData.get('paysRent') === 'true',
            rentAmount: formData.get('rentAmount') ? parseFloat(formData.get('rentAmount') as string) : 0,
            annualIncome: formData.get('annualIncome') ? parseFloat(formData.get('annualIncome') as string) : 0,
        },
    });

    revalidatePath('/settings');
    revalidatePath('/dashboard');
}

export async function updateBranding(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    await db.user.update({
        where: { id: user.id },
        data: {
            brandColor: formData.get('brandColor') as string,
            invoiceTemplate: formData.get('invoiceTemplate') as string || 'modern',
            invoiceFont: formData.get('invoiceFont') as string || 'inter',
        },
    });

    revalidatePath('/settings/branding');
}

export async function updateBrandStudio(formData: FormData) {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) {
        throw new Error('Unauthorized');
    }

    await db.user.update({
        where: { id: user.id },
        data: {
            // Branding
            // Branding
            brandColor: formData.get('brandColor') as string,
            invoiceTemplate: formData.get('invoiceTemplate') as string || 'modern',
            invoiceFont: formData.get('invoiceFont') as string || 'inter',
            logoUrl: formData.get('logoUrl') as string || null,
            stampUrl: formData.get('stampUrl') as string || null,
            showWatermark: formData.get('showWatermark') === 'true',

            // Business Profile
            businessName: formData.get('businessName') as string || null,
            businessAddress: formData.get('businessAddress') as string || null,
            phoneNumber: formData.get('phoneNumber') as string || null,
            businessStructure: formData.get('businessStructure') as string || null,
            sector: formData.get('sector') as string || null,
            taxIdentityNumber: formData.get('taxIdentityNumber') as string || null,

            // NTA 2025 Compliance
            nin: formData.get('nin') as string || null,
            bvn: formData.get('bvn') as string || null,
            totalAssets: formData.get('totalAssets') ? parseFloat(formData.get('totalAssets') as string) : 0,
            isProfessionalService: formData.get('isProfessionalService') === 'true',
        },
    });

    revalidatePath('/settings/branding');
    revalidatePath('/dashboard');
}
