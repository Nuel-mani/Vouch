import { db } from '@vouch/db';
import { Users, TrendingUp, CreditCard, FileCheck, Activity, AlertTriangle, Shield, Key } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboardPage() {
    // Fetch platform statistics
    const [
        userCount,
        transactionCount,
        invoiceCount,
        pendingAccessRequests,
        subscriptionStats,
        recentUsers,
    ] = await Promise.all([
        db.user.count(),
        db.transaction.count(),
        db.invoice.count(),
        db.passwordResetRequest.count({ where: { status: 'pending' } }),
        // Group users by their subscriptionTier (not the Subscription table)
        db.user.groupBy({
            by: ['subscriptionTier'],
            _count: true,
        }),
        db.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                email: true,
                businessName: true,
                subscriptionTier: true,
                createdAt: true,
            },
        }),
    ]);

    // Calculate subscription stats from user.subscriptionTier
    const subStats: Record<string, number> = {
        free: 0,
        pro: 0,
        enterprise: 0,
    };
    subscriptionStats.forEach((s) => {
        const tier = (s.subscriptionTier || 'free').toLowerCase();
        if (tier in subStats) {
            subStats[tier] = s._count;
        }
    });

    const stats = [
        {
            label: 'Total Users',
            value: userCount,
            icon: Users,
            color: 'bg-blue-500/10 text-blue-400',
        },
        {
            label: 'Transactions',
            value: transactionCount,
            icon: TrendingUp,
            color: 'bg-green-500/10 text-green-400',
        },
        {
            label: 'Invoices',
            value: invoiceCount,
            icon: CreditCard,
            color: 'bg-purple-500/10 text-purple-400',
        },
        {
            label: 'Pending Reviews',
            value: pendingAccessRequests,
            icon: FileCheck,
            color: pendingAccessRequests > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-gray-500/10 text-gray-400',
            href: '/access-requests',
        },
    ];

    // Fetch alerts data
    const approvedAwaitingAction = await db.passwordResetRequest.count({ where: { status: 'approved' } });

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-slate-400 mt-1">Platform overview and key metrics</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <Link
                        key={stat.label}
                        href={stat.href || '#'}
                        className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-sm text-slate-400">{stat.label}</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</p>
                    </Link>
                ))}
            </div>

            {/* Plan Distribution & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">Subscription Distribution</h2>
                    <div className="space-y-4">
                        {Object.entries(subStats).map(([plan, count]) => {
                            const percentage = userCount > 0 ? (count / userCount) * 100 : 0;
                            return (
                                <div key={plan}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-300 capitalize">{plan}</span>
                                        <span className="text-slate-400">{count} users ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${plan === 'enterprise' ? 'bg-purple-500' :
                                                plan === 'pro' ? 'bg-blue-500' : 'bg-gray-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Alerts */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-white mb-4">System Alerts</h2>
                    <div className="space-y-3">
                        {pendingAccessRequests > 0 && (
                            <Link href="/access-requests" className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition">
                                <Shield className="text-amber-400" size={20} />
                                <div>
                                    <p className="font-medium text-amber-400">{pendingAccessRequests} Pending Access Request{pendingAccessRequests > 1 ? 's' : ''}</p>
                                    <p className="text-sm text-slate-400">Users awaiting identity verification</p>
                                </div>
                            </Link>
                        )}
                        {approvedAwaitingAction > 0 && (
                            <Link href="/access-requests" className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition">
                                <Key className="text-blue-400" size={20} />
                                <div>
                                    <p className="font-medium text-blue-400">{approvedAwaitingAction} Approved Request{approvedAwaitingAction > 1 ? 's' : ''}</p>
                                    <p className="text-sm text-slate-400">Users awaiting password setup</p>
                                </div>
                            </Link>
                        )}
                        {pendingAccessRequests === 0 && approvedAwaitingAction === 0 && (
                            <div className="flex items-center justify-center h-32 text-slate-500">
                                <div className="text-center">
                                    <Activity size={32} className="mx-auto mb-2 text-slate-600" />
                                    <p>No alerts at this time</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Users */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="font-semibold text-white">Recent Signups</h2>
                    <Link href="/users" className="text-sm text-blue-400 hover:text-blue-300">View All →</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-xs text-slate-400 uppercase">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {recentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                                        No users yet
                                    </td>
                                </tr>
                            ) : (
                                recentUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-800 transition">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-white">{user.businessName || 'N/A'}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${user.subscriptionTier === 'enterprise' ? 'bg-purple-500/10 text-purple-400' :
                                                user.subscriptionTier === 'pro' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-gray-500/10 text-gray-400'
                                                }`}>
                                                {user.subscriptionTier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
