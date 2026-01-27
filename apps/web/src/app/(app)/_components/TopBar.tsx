'use client';

import { LogOut, Moon, Sun, User } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@vouch/ui';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';

interface TopBarProps {
    user: {
        id: string;
        email: string;
        businessName?: string | null;
        brandColor?: string;
    } | null;
}

export function TopBar({ user }: TopBarProps) {
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { theme, setTheme, resolvedTheme } = useTheme();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
    };

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 lg:px-8">
            {/* Center: Global Search */}
            <GlobalSearch />

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Notifications */}
                <NotificationBell />

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: user?.brandColor || '#2252c9' }}
                        >
                            {(user?.businessName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                        </div>
                    </button>

                    {isProfileOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setIsProfileOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 z-20">
                                <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {user?.businessName || 'My Account'}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Guest'}</p>
                                </div>
                                <a
                                    href="/settings"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                                >
                                    <User size={16} />
                                    Vouch ID Settings
                                </a>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <LogOut size={16} />
                                    Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
