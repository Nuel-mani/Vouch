'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, CheckCircle, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { getMyUnreadNotifications, markAsRead, markAllAsRead } from '../notification-actions';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const data = await getMyUnreadNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await markAsRead(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        router.refresh();
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications([]);
        setIsOpen(false);
        router.refresh();
    };

    const handleNotificationClick = async (n: any) => {
        await markAsRead(n.id);
        setNotifications((prev) => prev.filter((item) => item.id !== n.id));
        setIsOpen(false);
        if (n.actionUrl) {
            router.push(n.actionUrl);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-green-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
            case 'error': return <XCircle size={16} className="text-red-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition"
            >
                <Bell size={20} />
                {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-semibold text-slate-800">Notifications</h3>
                        {notifications.length > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500">No new notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        className="p-4 hover:bg-slate-50 transition cursor-pointer group"
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-0.5">{getIcon(n.type)}</div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className="text-sm font-medium text-slate-900 leading-tight">{n.title}</p>
                                                    <button
                                                        onClick={(e) => handleMarkRead(n.id, e)}
                                                        className="text-slate-300 hover:text-slate-500 opacity-0 group-hover:opacity-100 transition"
                                                        title="Mark as read"
                                                    >
                                                        <Check size={14} />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {n.actionUrl && (
                                                        <span className="text-[10px] text-blue-500 flex items-center gap-1">
                                                            Action Required <ExternalLink size={10} />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
