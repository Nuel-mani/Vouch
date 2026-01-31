import { db } from '@vouch/db';
import { AuditLogFilters } from './components/AuditLogFilters';
import { AuditLogList } from './components/AuditLogList';

interface PageProps {
    searchParams: Promise<{
        action?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
        page?: string;
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

    const page = Number(params.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    // Fetch audit logs with filters
    const [logs, total] = await Promise.all([
        db.auditLog.findMany({
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
            take: limit,
            skip,
        }),
        db.auditLog.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(total / limit);

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
            <AuditLogList logs={logs} />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing {skip + 1} to {Math.min(skip + limit, total)} of {total} entries
                    </p>
                    <div className="flex gap-2">
                        <a
                            href={page > 1 ? `?page=${page - 1}` : '#'}
                            className={`px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-sm hover:bg-slate-700 transition ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            Previous
                        </a>
                        <a
                            href={page < totalPages ? `?page=${page + 1}` : '#'}
                            className={`px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-sm hover:bg-slate-700 transition ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                        >
                            Next
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
