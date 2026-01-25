'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Search, Filter } from 'lucide-react';

interface AuditLogFiltersProps {
    actions: string[];
}

export function AuditLogFilters({ actions }: AuditLogFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const [action, setAction] = useState(searchParams.get('action') || '');
    const [startDate, setStartDate] = useState(searchParams.get('startDate') || '');
    const [endDate, setEndDate] = useState(searchParams.get('endDate') || '');
    const [search, setSearch] = useState(searchParams.get('search') || '');

    const applyFilters = () => {
        startTransition(() => {
            const params = new URLSearchParams();

            if (action) params.set('action', action);
            if (startDate) params.set('startDate', startDate);
            if (endDate) params.set('endDate', endDate);
            if (search) params.set('search', search);

            router.push(`/audit-logs?${params.toString()}`);
        });
    };

    const clearFilters = () => {
        setAction('');
        setStartDate('');
        setEndDate('');
        setSearch('');

        startTransition(() => {
            router.push('/audit-logs');
        });
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
            <div className="flex flex-wrap gap-4 items-end">
                {/* Search */}
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs text-slate-500 mb-1">Search</label>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by user, resource..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Action Filter */}
                <div className="min-w-[180px]">
                    <label className="block text-xs text-slate-500 mb-1">Action</label>
                    <select
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                    >
                        <option value="">All Actions</option>
                        {actions.map((a) => (
                            <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>
                        ))}
                    </select>
                </div>

                {/* Start Date */}
                <div>
                    <label className="block text-xs text-slate-500 mb-1">From</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                    />
                </div>

                {/* End Date */}
                <div>
                    <label className="block text-xs text-slate-500 mb-1">To</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={applyFilters}
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Filter size={16} />
                        {isPending ? 'Loading...' : 'Apply'}
                    </button>
                    <button
                        onClick={clearFilters}
                        disabled={isPending}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-600 disabled:opacity-50"
                    >
                        Clear
                    </button>
                </div>
            </div>
        </div>
    );
}
