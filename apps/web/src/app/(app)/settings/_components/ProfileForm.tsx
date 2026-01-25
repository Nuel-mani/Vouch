'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle } from 'lucide-react';
import { updateProfile } from '../_actions';

interface ProfileFormProps {
    user: {
        id: string;
        email: string | null;
        businessName: string | null;
        accountType: string | null;
        businessStructure: string | null;
        sector: string | null;
        taxIdentityNumber: string | null;
        businessAddress: string | null;
        phoneNumber: string | null;
        residenceState: string | null;
        paysRent: boolean | null;
        rentAmount: any;
        annualIncome: any;
        countryCode: string | null;
        currencySymbol: string | null;
    };
}

const sectors = [
    'Agriculture',
    'Manufacturing',
    'Services',
    'ICT',
    'Professional Services',
    'Retail',
    'Construction',
    'Healthcare',
    'Education',
    'Other',
];

const states = [
    'Lagos', 'FCT Abuja', 'Rivers', 'Ogun', 'Kano', 'Kaduna', 'Oyo', 'Edo', 'Delta', 'Anambra',
    'Imo', 'Enugu', 'Abia', 'Akwa Ibom', 'Cross River', 'Bayelsa', 'Ekiti', 'Ondo', 'Osun', 'Kwara',
];

export function ProfileForm({ user }: ProfileFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            await updateProfile(formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-8">
            {success && (
                <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl p-4 flex items-center gap-3 text-green-700 dark:text-green-400">
                    <CheckCircle size={20} />
                    <span>Profile updated successfully!</span>
                </div>
            )}

            {/* Basic Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                    <h3 className="font-semibold text-[var(--foreground)]">Basic Information</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                {user.accountType === 'business' ? 'Business Name' : 'Full Name'}
                            </label>
                            <input
                                name="businessName"
                                type="text"
                                defaultValue={user.businessName || ''}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Email</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full px-4 py-3 border border-[var(--border)] rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Phone Number</label>
                            <input
                                name="phoneNumber"
                                type="tel"
                                defaultValue={user.phoneNumber || ''}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                placeholder="+234..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">State of Residence</label>
                            <select
                                name="residenceState"
                                defaultValue={user.residenceState || ''}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            >
                                <option value="">Select state...</option>
                                {states.map((state) => (
                                    <option key={state} value={state}>{state}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                            {user.accountType === 'business' ? 'Business Address' : 'Home Address'}
                        </label>
                        <textarea
                            name="businessAddress"
                            rows={2}
                            defaultValue={user.businessAddress || ''}
                            className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            placeholder="Street address, city..."
                        />
                    </div>
                </div>
            </div>

            {/* Business Details (for business accounts) */}
            {user.accountType === 'business' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--border)]">
                        <h3 className="font-semibold text-[var(--foreground)]">Business Details</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Business Structure</label>
                                <select
                                    name="businessStructure"
                                    defaultValue={user.businessStructure || ''}
                                    className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                >
                                    <option value="">Select...</option>
                                    <option value="sole_prop">Sole Proprietorship</option>
                                    <option value="limited">Limited Company (Ltd)</option>
                                    <option value="llc">LLC (Limited Liability Company)</option>
                                    <option value="freelancer">Freelancer</option>
                                    <option value="partnership">Partnership</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Sector</label>
                                <select
                                    name="sector"
                                    defaultValue={user.sector || ''}
                                    className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                >
                                    <option value="">Select sector...</option>
                                    {sectors.map((sector) => (
                                        <option key={sector} value={sector.toLowerCase().replace(' ', '_')}>{sector}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tax Information */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-[var(--border)]">
                    <h3 className="font-semibold text-[var(--foreground)]">Tax Information</h3>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">Required for NTA 2025 compliance</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                NIN <span className="text-red-500">*</span> <span className="text-xs text-[var(--muted-foreground)]">(National Identity Number)</span>
                            </label>
                            <input
                                name="nin"
                                type="text"
                                defaultValue={(user as any).nin || ''}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                placeholder="11-digit NIN..."
                                maxLength={11}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                BVN <span className="text-red-500">*</span> <span className="text-xs text-[var(--muted-foreground)]">(Bank Verification Number)</span>
                            </label>
                            <input
                                name="bvn"
                                type="text"
                                defaultValue={(user as any).bvn || ''}
                                className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                placeholder="11-digit BVN..."
                                maxLength={11}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                            TIN <span className="text-xs text-[var(--muted-foreground)]">(Optional - for IG sellers with business income)</span>
                        </label>
                        <input
                            name="taxIdentityNumber"
                            type="text"
                            defaultValue={user.taxIdentityNumber || ''}
                            className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                            placeholder="Tax Identification Number (if applicable)..."
                        />
                    </div>

                    {user.accountType === 'personal' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Annual Income (₦)</label>
                                <input
                                    name="annualIncome"
                                    type="number"
                                    defaultValue={user.annualIncome ? Number(user.annualIncome) : ''}
                                    className="w-full px-4 py-3 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                    placeholder="0"
                                />
                            </div>

                            <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30 rounded-xl">
                                <label className="flex items-center gap-3">
                                    <input
                                        name="paysRent"
                                        type="checkbox"
                                        defaultChecked={user.paysRent}
                                        value="true"
                                        className="rounded border-[var(--border)] text-[var(--primary)]"
                                    />
                                    <span className="text-sm text-[var(--foreground)]">I pay rent (eligible for Rent Relief)</span>
                                </label>
                                <div className="mt-3 ml-6">
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Annual Rent Amount (₦)</label>
                                    <input
                                        name="rentAmount"
                                        type="number"
                                        defaultValue={user.rentAmount ? Number(user.rentAmount) : ''}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-[var(--primary)] text-white font-medium rounded-xl hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
                >
                    {loading && <Loader2 size={18} className="animate-spin" />}
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}
