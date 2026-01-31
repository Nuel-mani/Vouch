'use client';

import { useState } from 'react';
import { Activity, User, Plus, Edit, Trash2, Eye, Settings, ShieldAlert, ArrowRight } from 'lucide-react';
import { AuditLogDetailsModal } from './AuditLogDetailsModal';

const actionIcons: Record<string, React.ElementType> = {
    login: User,
    logout: User,
    create: Plus,
    update: Edit,
    delete: Trash2,
    view: Eye,
    settings: Settings,
    OVERRIDE: ArrowRight,
    DELETE: Trash2,
    ARCHIVE: Trash2,
    UNLINK: ShieldAlert,
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

// Fuzzy match mostly
const getColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('ARCHIVE') || action.includes('UNLINK')) return 'text-red-400 bg-red-500/10';
    if (action.includes('OVERRIDE') || action.includes('UPDATE')) return 'text-yellow-400 bg-yellow-500/10';
    if (action.includes('CREATE')) return 'text-green-400 bg-green-500/10';
    return 'text-blue-400 bg-blue-500/10';
}

export function AuditLogList({ logs }: { logs: any[] }) {
    const [selectedLog, setSelectedLog] = useState<any | null>(null);

    return (
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
                        // Normalize action key for icon lookup
                        const iconKey = Object.keys(actionIcons).find(k => log.action.toLowerCase().includes(k)) || 'view';
                        const Icon = actionIcons[log.action] || actionIcons[iconKey] || Activity;

                        // Determine color
                        const colorClass = actionColors[log.action.toLowerCase()] || getColor(log.action.toUpperCase());

                        return (
                            <div key={log.id} className="px-6 py-4 hover:bg-slate-800 transition flex items-center gap-4 group cursor-pointer" onClick={() => setSelectedLog(log)}>
                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-white capitalize">{log.action.replace(/_/g, ' ').toLowerCase()}</span>
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
                                            <span className="flex items-center gap-1.5">
                                                <User size={12} />
                                                {log.user.businessName || log.user.email}
                                            </span>
                                        ) : (
                                            <span>System</span>
                                        )}
                                        <span>•</span>
                                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                                    className="text-slate-500 hover:text-white p-2 hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition"
                                >
                                    <Eye size={16} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedLog && (
                <AuditLogDetailsModal
                    log={selectedLog}
                    onClose={() => setSelectedLog(null)}
                />
            )}
        </div>
    );
}
