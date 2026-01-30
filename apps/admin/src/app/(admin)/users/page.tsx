import { db } from '@vouch/db';
import { Mail, Calendar } from 'lucide-react';
import { ManageUserButton } from './components/UserManageModal';

export default async function UsersPage() {
    const users = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            subscriptions: true,
            _count: {
                select: { transactions: true, invoices: true },
            },
        },
        // We need fields that might not be in the default selection if we used select, 
        // but since we rely on default selection + include, we just need to ensure 
        // linkedUserId is accessible. Prisma 'findMany' returns all scalar fields by default.
        // So no change needed here actually, unless we were selecting specific fields.
        // Let's verify if 'linkedUserId' is being passed to the client component.

    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Users Management</h1>
                    <p className="text-slate-400">View and manage platform users.</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-300">
                    <span className="font-bold text-white mr-2">{users.length}</span>
                    Total Users
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-800 text-xs uppercase font-medium text-slate-300">
                            <tr>
                                <th className="px-6 py-4">User / Business</th>
                                <th className="px-6 py-4">Status & Tier</th>
                                <th className="px-6 py-4">Activity</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white">
                                                {user.businessName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                {user.businessName && (
                                                    <div className="font-medium text-white flex items-center gap-1">
                                                        {user.businessName}
                                                        {user.businessStructure && (
                                                            <span className="text-[10px] bg-slate-700 px-1 rounded text-slate-300">
                                                                {user.businessStructure}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <Mail size={12} />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium ${user.subscriptionTier === 'free'
                                                ? 'bg-slate-700 text-slate-300'
                                                : 'bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20'
                                                }`}>
                                                {(user.subscriptionTier || 'free').toUpperCase()}
                                            </span>
                                            <span className="text-xs capitalize flex items-center gap-1 text-slate-500">
                                                {user.accountType}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1 text-xs">
                                            <div className="flex items-center justify-between gap-4">
                                                <span>Transactions:</span>
                                                <span className="font-medium text-white">{user._count.transactions}</span>
                                            </div>
                                            <div className="flex items-center justify-between gap-4">
                                                <span>Invoices:</span>
                                                <span className="font-medium text-white">{user._count.invoices}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5" title={user.createdAt?.toISOString() || ''}>
                                            <Calendar size={14} />
                                            {/* Note: date-fns might not be installed, using simple date for safety */}
                                            {user.createdAt ? user.createdAt.toLocaleDateString() : 'N/A'}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            Last login: {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'Never'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ManageUserButton
                                            user={{
                                                id: user.id,
                                                email: user.email || '',
                                                businessName: user.businessName,
                                                role: (user as any).role || 'user',
                                                subscriptionTier: user.subscriptionTier || 'free',
                                                linkedUserId: user.linkedUserId,
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
