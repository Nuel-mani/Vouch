import { db } from '@vouch/db';
import { CheckCircle, Clock, Shield, Key, AlertTriangle } from 'lucide-react';
import { RequestActions, ApprovedRequestActions } from './components/RequestActions';

export default async function AccessRequestsPage() {
    // Fetch pending requests
    const pendingRequests = await db.passwordResetRequest.findMany({
        where: { status: 'pending' },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    businessName: true,
                    businessStructure: true,
                    subscriptionTier: true,
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Fetch approved requests awaiting user action (no login since approval)
    const approvedRequests = await db.passwordResetRequest.findMany({
        where: { status: 'approved' },
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    businessName: true,
                    lastLogin: true,
                }
            }
        },
        orderBy: { resolvedAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Access Requests</h1>
                    <p className="text-slate-400">Security / Identity Verification Queue</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-slate-800 border border-amber-500/30 rounded-lg px-4 py-2 text-slate-300">
                        <span className="font-bold text-amber-500 mr-2">{pendingRequests.length}</span>
                        Pending
                    </div>
                    <div className="bg-slate-800 border border-blue-500/30 rounded-lg px-4 py-2 text-slate-300">
                        <span className="font-bold text-blue-400 mr-2">{approvedRequests.length}</span>
                        Approved
                    </div>
                </div>
            </div>

            {/* Pending Requests Section */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-amber-500" />
                    Pending Verification
                </h2>
                {pendingRequests.length === 0 ? (
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
                        <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                        <p className="text-slate-400">No pending requests.</p>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-800 text-xs uppercase font-medium text-slate-300">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4">Requested</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {pendingRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-800 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{req.user.businessName || 'Individual'}</div>
                                            <div className="text-slate-400">{req.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-mono text-xs">
                                                <Shield size={12} className="text-slate-500" />
                                                {req.ipAddress || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">
                                                {Math.floor((Date.now() - new Date(req.createdAt).getTime()) / 60000)} mins ago
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <RequestActions request={req} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Approved Requests Section */}
            <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Key size={18} className="text-blue-400" />
                    Approved - Awaiting User Action
                </h2>
                {approvedRequests.length === 0 ? (
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-8 text-center">
                        <CheckCircle size={24} className="text-green-500 mx-auto mb-2" />
                        <p className="text-slate-400">No approved requests pending user action.</p>
                    </div>
                ) : (
                    <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="bg-slate-800 text-xs uppercase font-medium text-slate-300">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Approved</th>
                                    <th className="px-6 py-4">Last Login</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {approvedRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-800 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{req.user.businessName || 'Individual'}</div>
                                            <div className="text-slate-400">{req.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-white">
                                                {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {req.user.lastLogin ? (
                                                <span className="text-slate-300">
                                                    {new Date(req.user.lastLogin).toLocaleDateString()}
                                                </span>
                                            ) : (
                                                <span className="text-amber-500 flex items-center gap-1">
                                                    <AlertTriangle size={12} />
                                                    Never
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ApprovedRequestActions request={req} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
