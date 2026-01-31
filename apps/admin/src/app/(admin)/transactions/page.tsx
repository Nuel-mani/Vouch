import { Suspense } from 'react';
import { getTransactions } from './actions';
import { TransactionTable } from './components/TransactionTable';
import { Search, Filter, Calendar } from 'lucide-react';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Transactions | Admin Dashboard',
};

export default async function TransactionsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams.page) || 1;
    const search = resolvedParams.search as string;
    const status = resolvedParams.status as string;
    const startDate = resolvedParams.startDate as string;
    const endDate = resolvedParams.endDate as string;

    const result = await getTransactions({
        page,
        search,
        status,
        startDate,
        endDate
    });

    if (!result.success) {
        return (
            <div className="p-8 text-red-400">
                Error loading transactions: {result.error}
            </div>
        );
    }

    const { transactions, pagination } = result;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Transactions Management</h1>
                    <p className="text-slate-400 text-sm">View, override, and audit user transactions.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap gap-4 items-center">
                <form className="flex-1 flex gap-4 w-full">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            name="search"
                            defaultValue={search}
                            placeholder="Search description, payee, ref ID..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <select
                            name="status"
                            defaultValue={status}
                            className="bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-8 py-2 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none min-w-[140px]"
                        >
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="date"
                                name="startDate"
                                defaultValue={startDate}
                                className="bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-2 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <span className="text-slate-500">-</span>
                        <div className="relative">
                            <input
                                type="date"
                                name="endDate"
                                defaultValue={endDate}
                                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition">
                        Filter
                    </button>
                    {(search || status || startDate || endDate) && (
                        <a href="/transactions" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition">
                            Clear
                        </a>
                    )}
                </form>
            </div>

            {/* Table */}
            <Suspense fallback={<div className="text-slate-400">Loading transactions...</div>}>
                <TransactionTable transactions={transactions || []} />
            </Suspense>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                        <a
                            key={p}
                            href={`?page=${p}&search=${search || ''}&status=${status || ''}&startDate=${startDate || ''}&endDate=${endDate || ''}`}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${p === pagination.current
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {p}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}
