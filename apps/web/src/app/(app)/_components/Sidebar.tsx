'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Receipt,
    FileText,
    PieChart,
    Calculator,
    Sparkles,
    Settings,
    CreditCard,
    Palette,
    Menu,
    X,
    ChevronDown,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
    user: {
        id: string;
        email: string;
        businessName?: string | null;
        accountType: string;
        subscriptionTier: string;
        brandColor?: string;
    } | null;
    riskyCount?: number;
}

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['personal', 'business'] },
    { href: '/transactions', icon: Receipt, label: 'Transactions', roles: ['personal', 'business'] },
    { href: '/invoices', icon: FileText, label: 'Invoices', roles: ['business'] },
    { href: '/tax-forms', icon: FileText, label: 'Tax Forms', roles: ['personal'] }, // [NEW] Added for personal users
    { href: '/analytics', icon: PieChart, label: 'Analytics', roles: ['personal', 'business'] },
    { href: '/fiscal', icon: Calculator, label: 'Fiscal Engine', roles: ['business'] },
    { href: '/optimizer', icon: Sparkles, label: 'Tax Optimizer', roles: ['personal', 'business'], hasBadge: true },
];

const settingsItems = [
    { href: '/settings', icon: Settings, label: 'Vouch ID', roles: ['personal'] },
    { href: '/settings/branding', icon: Palette, label: 'Brand Studio', roles: ['business'] },
    { href: '/settings/subscription', icon: CreditCard, label: 'Subscription', roles: ['personal', 'business'] },
];

export function Sidebar({ user, riskyCount = 0 }: SidebarProps) {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-[var(--border)]"
            >
                <Menu size={20} className="text-[var(--foreground)]" />
            </button>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-64 
                    bg-white dark:bg-slate-900 
                    border-r border-[var(--border)] 
                    flex flex-col
                    transform transition-transform duration-200 ease-in-out
                    lg:translate-x-0
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border)]">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: user?.brandColor || 'var(--primary)' }}
                        >
                            V
                        </div>
                        <span className="font-bold text-lg text-[var(--foreground)] lowercase">vouch</span>
                    </Link>
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                    {navItems
                        .filter(item => user?.accountType ? item.roles.includes(user.accountType) : false)
                        .map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileOpen(false)}
                                className={`
                                flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                ${isActive(item.href)
                                        ? 'bg-[var(--primary-50)] dark:bg-[var(--primary)]/10 text-[var(--primary)]'
                                        : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                                    }
                            `}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} />
                                    {item.label}
                                </div>
                                {/* Receipt Hunter Badge */}
                                {item.hasBadge && riskyCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                        {riskyCount}
                                    </span>
                                )}
                            </Link>
                        ))}

                    {/* Settings Dropdown */}
                    <div className="pt-4 mt-4 border-t border-[var(--border)]">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                            <div className="flex items-center gap-3">
                                <Settings size={18} />
                                Settings
                            </div>
                            <ChevronDown
                                size={16}
                                className={`transform transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {isSettingsOpen && (
                            <div className="ml-6 mt-1 space-y-1">
                                {settingsItems
                                    .filter(item => user?.accountType ? item.roles.includes(user.accountType) : false)
                                    .map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMobileOpen(false)}
                                            className={`
                                            flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                                            ${isActive(item.href)
                                                    ? 'bg-[var(--primary-50)] dark:bg-[var(--primary)]/10 text-[var(--primary)]'
                                                    : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                                                }
                                        `}
                                        >
                                            <item.icon size={16} />
                                            {item.label}
                                        </Link>
                                    ))}
                            </div>
                        )}
                    </div>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--border)]">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: user?.brandColor || 'var(--primary)' }}
                        >
                            {(user?.businessName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--foreground)] truncate">
                                {user?.businessName || user?.email || 'Guest'}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] capitalize">{user?.subscriptionTier || 'free'} Plan</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
