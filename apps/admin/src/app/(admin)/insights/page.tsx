import Link from 'next/link';
import { getInsights, seedInsights, deleteInsight } from '../../actions/insights';
import { Plus, Trash2, Edit, Save, Lightbulb } from 'lucide-react';
import { InsightFilters } from './components/InsightFilters';
import { Suspense } from 'react';

interface PageProps {
    searchParams: Promise<{ category?: string; type?: string }>;
}

export default async function InsightsPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const { data: allInsights } = await getInsights();

    // Apply filters
    let insights = allInsights || [];
    if (params.category) {
        insights = insights.filter((i: any) => i.category === params.category);
    }
    if (params.type) {
        insights = insights.filter((i: any) => i.type === params.type);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Strategic Insights</h1>
                    <p className="text-slate-400">Manage tax tips and insights shown to users.</p>
                </div>
                <div className="flex gap-3">
                    <form action={async () => {
                        'use server';
                        await seedInsights();
                    }}>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition">
                            <Save className="w-4 h-4" />
                            Seed Defaults
                        </button>
                    </form>
                    <Link
                        href="/insights/new"
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                        <Plus className="w-4 h-4" />
                        Add Insight
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                <Suspense fallback={<div className="text-slate-500 text-sm">Loading filters...</div>}>
                    <InsightFilters />
                </Suspense>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800 text-xs uppercase font-medium text-slate-300">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Impact</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {insights.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Lightbulb size={32} className="text-slate-600" />
                                        <p className="text-slate-500">
                                            {allInsights?.length === 0
                                                ? 'No insights found. Click "Seed Defaults" to load the NTA 2025 set.'
                                                : 'No insights match your filters.'}
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            insights.map((insight: any) => (
                                <tr key={insight.id} className="hover:bg-slate-800 transition">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{insight.title}</div>
                                        <div className="text-slate-500 truncate max-w-xs text-xs">{insight.insight}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{insight.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${insight.type === 'warning' ? 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' :
                                                insight.type === 'success' ? 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20' :
                                                    'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20'}`}>
                                            {insight.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">{insight.impact || '-'}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/insights/${insight.id}`} className="text-slate-400 hover:text-blue-400 transition">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <form action={async () => {
                                                'use server';
                                                await deleteInsight(insight.id);
                                            }}>
                                                <button className="text-slate-400 hover:text-red-400 transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Results count */}
            <div className="text-sm text-slate-500">
                Showing {insights.length} of {allInsights?.length || 0} insights
            </div>
        </div>
    );
}
