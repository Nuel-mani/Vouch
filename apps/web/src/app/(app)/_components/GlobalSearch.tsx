'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, FileText, ArrowRight, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchGlobal, type SearchResult } from '../search-actions';

// Simple debounce hook if not available
function useDebounceValue<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export function GlobalSearch() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounceValue(query, 300);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mobile toggle state
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    useEffect(() => {
        async function runSearch() {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await searchGlobal(debouncedQuery);
                setResults(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }

        if (debouncedQuery) runSearch();
    }, [debouncedQuery]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Don't close mobile search here, handle that with explicit X button
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (url: string) => {
        setIsOpen(false);
        setShowMobileSearch(false);
        setQuery('');
        router.push(url);
    };

    // Helper for formatting currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    return (
        <div ref={containerRef} className="flex-1 flex justify-center max-w-2xl mx-auto px-4 relative">

            {/* Desktop Input */}
            <div className={`relative hidden md:block transition-all duration-300 ease-in-out ${isOpen ? 'w-full' : 'w-full max-w-sm'}`}>
                <div className={`relative group`}>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search transactions, invoices..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:bg-white dark:focus:bg-slate-900 focus:border-gray-200 dark:focus:border-slate-700 shadow-sm transition-all"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                        onFocus={() => setIsOpen(true)}
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 size={16} className="animate-spin text-[var(--primary)]" />
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Search Button */}
            <button
                className="md:hidden p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full"
                onClick={() => setShowMobileSearch(true)}
            >
                <Search size={20} />
            </button>

            {/* Mobile Overlay */}
            {showMobileSearch && (
                <div className="absolute inset-0 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-4 z-50 flex items-center md:hidden h-16 w-full left-0 top-0 fixed animate-in slide-in-from-top-2">
                    <Search className="text-[var(--primary)] mr-3" size={20} />
                    <input
                        type="text"
                        autoFocus
                        placeholder="Search anything..."
                        className="flex-1 bg-transparent border-none text-base focus:ring-0 p-0 text-[var(--foreground)]"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setIsOpen(true);
                        }}
                    />
                    <button
                        onClick={() => {
                            setShowMobileSearch(false);
                            setIsOpen(false);
                        }}
                        className="p-2 -mr-2 text-gray-400"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* Results Dropdown */}
            {isOpen && (query.length > 0) && (
                <div className={`absolute top-full mt-2 left-0 right-0 md:w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 ${showMobileSearch ? 'fixed top-16 left-0 right-0 rounded-none border-x-0 h-[calc(100vh-4rem)]' : ''}`}>

                    {results.length > 0 ? (
                        <div className="py-2 overflow-y-auto max-h-[70vh]">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Results
                            </div>

                            {results.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result.url)}
                                    className="w-full flex items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-50 dark:border-slate-800/50 last:border-0 text-left group"
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${result.type === 'invoice'
                                        ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400'
                                        : result.status === 'income'
                                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                        }`}>
                                        {result.type === 'invoice' ? <FileText size={18} /> :
                                            result.status === 'income' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 truncate pr-2 group-hover:text-[var(--primary)] transition-colors">
                                                {result.title}
                                            </p>
                                            <span className={`text-xs font-mono font-medium whitespace-nowrap ${result.type === 'invoice' ? 'text-gray-600 dark:text-gray-400' :
                                                result.status === 'income' ? 'text-green-600' : 'text-gray-900 dark:text-white'
                                                }`}>
                                                {result.status === 'expense' && '-'}
                                                {formatCurrency(result.amount)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                                            <span className="capitalize">{result.type}</span>
                                            <span>•</span>
                                            <span>{result.subtitle}</span>
                                            <span>•</span>
                                            <span>{new Date(result.date).toLocaleDateString()}</span>
                                        </p>
                                    </div>

                                    <ArrowRight size={16} className="text-gray-300 -ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                                </button>
                            ))}
                        </div>
                    ) : (
                        debouncedQuery.length >= 2 && !loading && (
                            <div className="p-8 text-center text-gray-500">
                                <Search className="mx-auto mb-2 opacity-20" size={32} />
                                <p>No results found for "{query}"</p>
                            </div>
                        )
                    )}

                    {debouncedQuery.length < 2 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            Type to search...
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
