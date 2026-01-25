'use client';

import { useState } from 'react';
import { FileText, Download, Filter, Search, Calendar, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

interface TaxFiling {
    id: string;
    formType: string;
    taxYear: number;
    status: string;
    filingDate: Date;
    totalTaxPaid: number;
    grossIncome: number;
}

interface TaxFormListProps {
    filings: TaxFiling[];
    userName: string;
}

export function TaxFormList({ filings, userName }: TaxFormListProps) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Unique years for filter
    const years = Array.from(new Set(filings.map(f => f.taxYear))).sort((a, b) => b - a);
    const currentYear = new Date().getFullYear();

    const filteredFilings = filings.filter(filing => {
        const matchStatus = statusFilter === 'all' || filing.status === statusFilter;
        const matchYear = yearFilter === 'all' || filing.taxYear.toString() === yearFilter;
        const matchSearch = filing.formType.toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchYear && matchSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'filed': return 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400';
            case 'draft': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search forms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-[var(--muted)] border-transparent focus:bg-white dark:focus:bg-slate-900 border focus:border-[var(--primary)] rounded-lg text-sm transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="px-3 py-2 bg-[var(--muted)] rounded-lg text-sm border-r-[8px] border-transparent outline-none cursor-pointer"
                    >
                        <option value="all">All Years</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>

                    <div className="flex bg-[var(--muted)] p-1 rounded-lg">
                        {['all', 'draft', 'filed'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${statusFilter === tab
                                    ? 'bg-white dark:bg-slate-700 text-[var(--foreground)] shadow-sm'
                                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
                {filteredFilings.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-[var(--muted)] rounded-full flex items-center justify-center mb-4 text-[var(--muted-foreground)]">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--foreground)]">No forms found</h3>
                        <p className="text-sm text-[var(--muted-foreground)] max-w-xs mt-1 mb-6">
                            We couldn't find any tax filings matching your filters.
                        </p>
                        <Link
                            href={`/print/tax-forms/form-a`}
                            className="btn-primary"
                        >
                            Generate New Return
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Form / Year</th>
                                    <th className="px-6 py-4 font-medium">Filing Date</th>
                                    <th className="px-6 py-4 font-medium">Gross Income</th>
                                    <th className="px-6 py-4 font-medium">Tax Liability</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {filteredFilings.map((filing) => (
                                    <tr key={filing.id} className="group hover:bg-[var(--muted)]/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-lg">
                                                    <FileText size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[var(--foreground)]">Form A</p>
                                                    <p className="text-xs text-[var(--muted-foreground)]">{filing.taxYear}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[var(--muted-foreground)]">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} />
                                                {new Date(filing.filingDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono font-medium">
                                            ₦{filing.grossIncome.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 font-mono font-bold text-[var(--primary)]">
                                            ₦{filing.totalTaxPaid.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusColor(filing.status)}`}>
                                                {filing.status === 'filed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                                                {filing.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/print/tax-forms/form-a`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 border border-[var(--border)] rounded-lg text-xs font-bold hover:bg-[var(--muted)] transition-colors shadow-sm"
                                            >
                                                <Download size={14} />
                                                View / Print
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
