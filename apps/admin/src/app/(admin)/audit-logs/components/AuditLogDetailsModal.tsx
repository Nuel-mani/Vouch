'use client';

import { X, ArrowRight, Activity, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface AuditLogDetailsModalProps {
    log: any;
    onClose: () => void;
}

export function AuditLogDetailsModal({ log, onClose }: AuditLogDetailsModalProps) {
    const [copied, setCopied] = useState(false);
    const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(JSON.stringify(details, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Check if this is a diff-able log (has original vs new)
    const isDiff = details && details.original && details.new;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg text-blue-400">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white capitalize">{log.action.replace(/_/g, ' ')}</h3>
                            <p className="text-sm text-slate-400 font-mono">{log.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                        <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Actor</span>
                            <div className="mt-1 text-sm text-slate-300 font-medium">
                                {log.user?.businessName || log.user?.email || 'System'}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Timestamp</span>
                            <div className="mt-1 text-sm text-slate-300">
                                {new Date(log.timestamp).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">IP Address</span>
                            <div className="mt-1 text-sm text-slate-300 font-mono">
                                {log.ipAddress || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Resource</span>
                            <div className="mt-1 text-sm text-slate-300">
                                {log.resource || 'N/A'} <span className="text-slate-500 text-xs">#{log.resourceId?.slice(0, 4)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Diff View or Raw JSON */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                                {isDiff ? 'Change Log' : 'Event Details'}
                            </h4>
                            <button
                                onClick={copyToClipboard}
                                className="text-xs flex items-center gap-1.5 text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded transition"
                            >
                                {copied ? <Check size={12} /> : <Copy size={12} />}
                                {copied ? 'Copied' : 'Copy JSON'}
                            </button>
                        </div>

                        {isDiff ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="text-xs text-red-400 font-medium bg-red-500/10 px-2 py-1 rounded w-fit">Original Value</div>
                                    <div className="bg-slate-950 border border-red-900/30 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                                        <pre>{JSON.stringify(details.original, null, 2)}</pre>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded w-fit flex items-center gap-2">
                                        New Value <ArrowRight size={10} />
                                    </div>
                                    <div className="bg-slate-950 border border-green-900/30 rounded-lg p-3 font-mono text-xs text-slate-300 overflow-x-auto">
                                        <pre>{JSON.stringify(details.new, null, 2)}</pre>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto relative group">
                                <pre>{JSON.stringify(details, null, 2)}</pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
