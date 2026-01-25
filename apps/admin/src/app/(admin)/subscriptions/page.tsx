import { db } from '@vouch/db';
import { CreditCard, Users, TrendingUp, AlertCircle, Check, X, Clock } from 'lucide-react';
import { ManageSubscriptionButton } from './components/SubscriptionManageModal';

export default async function SubscriptionsPage() {
    // Fetch subscription data
    const subscriptions = await db.subscription.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    businessName: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const stats = {
        total: subscriptions.length,
        active: subscriptions.filter((s) => s.status === 'active').length,
        trial: subscriptions.filter((s) => s.trialEndsAt && new Date(s.trialEndsAt) > new Date()).length,
        cancelled: subscriptions.filter((s) => s.cancelledAt).length,
        byPlan: {} as Record<string, number>,
    };

    subscriptions.forEach((s) => {
        stats.byPlan[s.planType] = (stats.byPlan[s.planType] || 0) + 1;
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
                <p className="text-slate-400 mt-1">Manage platform subscriptions and billing</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                            <Users size={20} />
                        </div>
                        <span className="text-sm text-slate-400">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/10 text-green-400 rounded-lg">
                            <Check size={20} />
                        </div>
                        <span className="text-sm text-slate-400">Active</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.active}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
                            <Clock size={20} />
                        </div>
                        <span className="text-sm text-slate-400">On Trial</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.trial}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                            <X size={20} />
                        </div>
                        <span className="text-sm text-slate-400">Cancelled</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.cancelled}</p>
                </div>
            </div>

            {/* Plan Breakdown */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Plan Distribution</h2>
                <div className="grid grid-cols-3 gap-4">
                    {['free', 'pro', 'enterprise'].map((plan) => (
                        <div key={plan} className="text-center p-4 bg-slate-900 rounded-lg">
                            <p className="text-2xl font-bold text-white">{stats.byPlan[plan] || 0}</p>
                            <p className="text-sm text-slate-400 capitalize">{plan}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                    <h2 className="font-semibold text-white">Recent Subscriptions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-900 text-xs text-slate-400 uppercase">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Plan</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Billing</th>
                                <th className="px-6 py-4">Period End</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {subscriptions.slice(0, 20).map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-800 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-white">{sub.user.businessName || 'N/A'}</p>
                                        <p className="text-xs text-slate-500">{sub.user.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${sub.planType === 'enterprise' ? 'bg-purple-500/10 text-purple-400' :
                                            sub.planType === 'pro' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {sub.planType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${sub.status === 'active' ? 'bg-green-500/10 text-green-400' :
                                            sub.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                                                'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 capitalize">
                                        {sub.billingCycle}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400">
                                        {sub.currentPeriodEnd
                                            ? new Date(sub.currentPeriodEnd).toLocaleDateString()
                                            : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <ManageSubscriptionButton
                                            subscription={{
                                                id: sub.id,
                                                planType: sub.planType,
                                                status: sub.status,
                                                currentPeriodEnd: sub.currentPeriodEnd || new Date(),
                                                user: {
                                                    email: sub.user.email,
                                                    businessName: sub.user.businessName,
                                                },
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
