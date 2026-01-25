import { db } from '@vouch/db';
import { Activity, User, Plus, Edit, Trash2, Eye, Settings } from 'lucide-react';
import { AuditLogFilters } from './components/AuditLogFilters';

const actionIcons: Record<string, React.ElementType> = {
    login: User,
    logout: User,
    create: Plus,
    update: Edit,
    delete: Trash2,
    view: Eye,
    settings: Settings,
};

const actionColors: Record<string, string> = {
    login: 'text-green-400 bg-green-500/10',
    logout: 'text-gray-400 bg-gray-500/10',
    create: 'text-blue-400 bg-blue-500/10',
    update: 'text-yellow-400 bg-yellow-500/10',
    delete: 'text-red-400 bg-red-500/10',
    view: 'text-purple-400 bg-purple-500/10',
    settings: 'text-cyan-400 bg-cyan-500/10',
};

interface PageProps {
    searchParams: Promise<{
        action?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
    const params = await searchParams;

    // Build where clause based on filters
    const whereClause: Record<string, unknown> = {};

    if (params.action) {
        whereClause.action = params.action;
    }

    if (params.startDate || params.endDate) {
        whereClause.timestamp = {};
        if (params.startDate) {
            (whereClause.timestamp as Record<string, Date>).gte = new Date(params.startDate);
        }
        if (params.endDate) {
            const endDate = new Date(params.endDate);
            endDate.setHours(23, 59, 59, 999);
            (whereClause.timestamp as Record<string, Date>).lte = endDate;
        }
    }

    if (params.search) {
        whereClause.OR = [
            { action: { contains: params.search, mode: 'insensitive' } },
            { resource: { contains: params.search, mode: 'insensitive' } },
            { user: { email: { contains: params.search, mode: 'insensitive' } } },
        ];
    }

    // Fetch audit logs with filters
    const logs = await db.auditLog.findMany({
        where: whereClause,
        include: {
            user: {
                select: {
                    email: true,
                    businessName: true,
                },
            },
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
    });

    // Get unique actions for filter dropdown
    const allActions = await db.auditLog.findMany({
        select: { action: true },
        distinct: ['action'],
    });
    const uniqueActions = allActions.map((a) => a.action);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
                <p className="text-slate-400 mt-1">Track all system activity and changes</p>
            </div>

            {/* Filters */}
            <AuditLogFilters actions={uniqueActions} />

            {/* Logs Timeline */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                {logs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity size={48} className="mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-400">No audit logs found</p>
                        <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or wait for activity</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700">
                        {logs.map((log) => {
                            const Icon = actionIcons[log.action] || Activity;
                            const colorClass = actionColors[log.action] || 'text-slate-400 bg-slate-500/10';

                            return (
                                <div key={log.id} className="px-6 py-4 hover:bg-slate-800 transition flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${colorClass}`}>
                                        <Icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white capitalize">{log.action}</span>
                                            {log.resource && (
                                                <>
                                                    <span className="text-slate-500">on</span>
                                                    <span className="text-slate-300">{log.resource}</span>
                                                </>
                                            )}
                                            {log.resourceId && (
                                                <span className="text-xs font-mono text-slate-500">
                                                    ({log.resourceId.slice(0, 8)}...)
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                            {log.user ? (
                                                <span>{log.user.businessName || log.user.email}</span>
                                            ) : (
                                                <span>System</span>
                                            )}
                                            <span>•</span>
                                            <span>{log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</span>
                                            {log.ipAddress && (
                                                <>
                                                    <span>•</span>
                                                    <span className="font-mono text-xs">{log.ipAddress}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <button className="text-slate-500 hover:text-slate-300 p-2">
                                        <Eye size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {logs.length > 0 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {logs.length} of {logs.length} entries
                    </p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-sm hover:bg-slate-700 transition disabled:opacity-50" disabled>
                            Previous
                        </button>
                        <button className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-sm hover:bg-slate-700 transition disabled:opacity-50" disabled>
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
