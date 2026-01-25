'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createInsight, updateInsight } from '../../../actions/insights';

export function InsightForm({ initialData }: { initialData?: any }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        const data = {
            title: formData.get('title') as string,
            insight: formData.get('insight') as string,
            law: formData.get('law') as string,
            category: formData.get('category') as string,
            type: formData.get('type') as any,
            impact: formData.get('impact') as string,
            isActive: true,
        };

        let res;
        if (initialData?.id) {
            res = await updateInsight(initialData.id, data);
        } else {
            res = await createInsight(data);
        }

        setLoading(false);

        if (res.success) {
            router.push('/insights');
        } else {
            alert('Error saving insight');
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                        name="title"
                        required
                        defaultValue={initialData?.title}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Insight Text</label>
                    <textarea
                        name="insight"
                        required
                        rows={4}
                        defaultValue={initialData?.insight}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    <p className="mt-1 text-xs text-gray-500">Keep it conversational and "human-readable".</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Legal Backing (Law)</label>
                    <input
                        name="law"
                        defaultValue={initialData?.law}
                        placeholder="e.g. Section 56 of NTA 2025"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <input
                        name="category"
                        required
                        defaultValue={initialData?.category}
                        list="categories"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                    <datalist id="categories">
                        <option value="Small Business Shields" />
                        <option value="Expense & Deduction Hacks" />
                        <option value="Employment & Staff Incentives" />
                        <option value="Compliance & Penalty Prevention" />
                    </datalist>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <select
                        name="type"
                        defaultValue={initialData?.type || 'opportunity'}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    >
                        <option value="opportunity">Opportunity (Blue)</option>
                        <option value="warning">Warning (Yellow/Red)</option>
                        <option value="success">Success (Green)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Impact Estimate</label>
                    <input
                        name="impact"
                        defaultValue={initialData?.impact}
                        placeholder="e.g. 5% Savings"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 from-gray-50 to-gray-100"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save Insight'}
                </button>
            </div>
        </form>
    );
}
