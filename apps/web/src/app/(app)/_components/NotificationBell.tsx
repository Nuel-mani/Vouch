'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getNotifications, type NotificationItem } from '../notification-actions';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // Fetch on mount
    useEffect(() => {
        async function fetchNotes() {
            try {
                const data = await getNotifications();
                setNotifications(data);
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            } finally {
                setLoading(false);
            }
        }
        fetchNotes();

        // Poll every 5 minutes? Maybe overkill for now.
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const hasCritical = notifications.some(n => n.level === 'critical');
    const hasWarning = notifications.some(n => n.level === 'warning');

    const getIcon = (level: string) => {
        switch (level) {
            case 'critical': return <AlertCircle size={18} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    const getBgColor = (level: string) => {
        switch (level) {
            case 'critical': return 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30';
            case 'warning': return 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30';
            default: return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30';
        }
    };

    return (
        <div ref={containerRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition relative group"
            >
                <Bell size={20} className={`transition-transform ${isOpen ? 'rotate-12' : ''} ${hasCritical ? 'animate-pulse text-red-500' : ''}`} />
                {(hasCritical || hasWarning || notifications.length > 0) && (
                    <span className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${hasCritical ? 'bg-red-500' : hasWarning ? 'bg-amber-500' : 'bg-blue-500'}`} />
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</h3>
                        <span className="text-xs text-gray-500">{notifications.length} alerts</span>
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center text-gray-400 text-xs">Loading checks...</div>
                        ) : notifications.length > 0 ? (
                            <div className="p-2 space-y-2">
                                {notifications.map((note) => (
                                    <div key={note.id} className={`p-3 rounded-lg border ${getBgColor(note.level)} transition-all hover:scale-[1.01]`}>
                                        <div className="flex gap-3">
                                            <div className="shrink-0 mt-0.5">
                                                {getIcon(note.level)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">
                                                    {note.title}
                                                </h4>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                                                    {note.message}
                                                </p>
                                                <Link
                                                    href={note.actionUrl}
                                                    onClick={() => setIsOpen(false)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--primary)] hover:underline"
                                                >
                                                    {note.actionLabel}
                                                    <ArrowRight size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 flex flex-col items-center justify-center text-center">
                                <CheckCircle2 size={32} className="text-green-500 mb-2 opacity-50" />
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-200">All Clear!</p>
                                <p className="text-xs text-gray-500 mt-1">You're fully compliant and up to date.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
