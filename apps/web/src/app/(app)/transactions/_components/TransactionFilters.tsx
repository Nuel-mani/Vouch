'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import { useState } from 'react';

export function TransactionFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const currentType = searchParams.get('type') || 'all';

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (key === 'type') {
            params.delete('status'); // Clear archived status when switching types
        }

        if (key === 'status' && value === 'archived') {
            params.delete('type'); // Clear type when viewing archive
        }

        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/transactions?${params.toString()}`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        updateFilter('search', search);
    };

    const clearFilters = () => {
        router.push('/transactions');
        setSearch('');
    };

    const hasFilters = searchParams.toString().length > 0;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-[var(--border)] p-4 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <form onSubmit={handleSearch} className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={18} />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search transactions..."
                            className="w-full pl-10 pr-4 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>
                </form>

                {/* Type Filter */}
                <div className="flex gap-2">
                    {['all', 'income', 'expense'].map((type) => (
                        <button
                            key={type}
                            onClick={() => updateFilter('type', type)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${currentType === type && searchParams.get('status') !== 'archived'
                                    ? 'bg-[var(--primary)] text-white'
                                    : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
                                }`}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Archive Toggle */}
                <button
                    onClick={() => updateFilter('status', searchParams.get('status') === 'archived' ? 'all' : 'archived')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${searchParams.get('status') === 'archived'
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
                        }`}
                >
                    Archived
                </button>

                {/* More Filters Toggle */}
                <button
                    onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${isFiltersOpen
                        ? 'bg-[var(--primary-50)] dark:bg-[var(--primary)]/10 text-[var(--primary)]'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
                        }`}
                >
                    <Filter size={16} />
                    Filters
                </button>

                {hasFilters && (
                    <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition"
                    >
                        <X size={16} />
                        Clear
                    </button>
                )}
            </div>

            {/* Expanded Filters */}
            {isFiltersOpen && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--border)]">
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Start Date</label>
                        <input
                            type="date"
                            value={searchParams.get('startDate') || ''}
                            onChange={(e) => updateFilter('startDate', e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">End Date</label>
                        <input
                            type="date"
                            value={searchParams.get('endDate') || ''}
                            onChange={(e) => updateFilter('endDate', e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Category</label>
                        <select
                            value={searchParams.get('category') || ''}
                            onChange={(e) => updateFilter('category', e.target.value)}
                            className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                            <option value="">All Categories</option>
                            <option value="sales">Sales</option>
                            <option value="services">Services</option>
                            <option value="rent">Rent</option>
                            <option value="utilities">Utilities</option>
                            <option value="supplies">Supplies</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}
