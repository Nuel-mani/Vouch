'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

const CATEGORIES = [
    'The "Hidden" Reliefs',
    'Audit & Filing Mastery',
    'Asset & Investment Strategy',
    'Business Structure Optimization',
];

const TYPES = ['success', 'warning', 'opportunity'];

export function InsightFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentCategory = searchParams.get('category') || '';
    const currentType = searchParams.get('type') || '';

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/insights?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/insights');
    };

    const hasFilters = currentCategory || currentType;

    return (
        <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-slate-400">
                <Filter size={16} />
                <span className="text-sm">Filter:</span>
            </div>

            <select
                value={currentCategory}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:border-slate-600 transition"
            >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>

            <select
                value={currentType}
                onChange={(e) => updateFilter('type', e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:border-slate-600 transition"
            >
                <option value="">All Types</option>
                {TYPES.map((type) => (
                    <option key={type} value={type} className="capitalize">{type}</option>
                ))}
            </select>

            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-400 hover:text-red-300 transition"
                >
                    <X size={14} />
                    Clear
                </button>
            )}
        </div>
    );
}
