import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import {
    Shield,
    Users,
    FileCheck,
    Settings,
    Activity,
    LayoutDashboard,
    CreditCard,
    Bell,
    Plug,
    Lightbulb
} from 'lucide-react';
import { LogoutButton } from './components/LogoutButton';

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface UserPayload {
    userId: string;
    email: string;
    role: string;
}

const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/access-requests', icon: Shield, label: 'Access Requests' },
    { href: '/users', icon: Users, label: 'Users' },
    { href: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    { href: '/compliance', icon: FileCheck, label: 'Compliance' },
    { href: '/insights', icon: Lightbulb, label: 'Strategic Insights' },
    { href: '/integrations', icon: Plug, label: 'Integrations' },
    { href: '/audit-logs', icon: Activity, label: 'Audit Logs' },
    { href: '/settings', icon: Settings, label: 'Settings' },
];

async function getUser(): Promise<UserPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) return null;

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) return null;

        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(secret),
            { issuer: 'vouch', audience: 'vouch' }
        );

        return {
            userId: payload.userId as string,
            email: payload.email as string,
            role: payload.role as string,
        };
    } catch {
        return null;
    }
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
    const user = await getUser();

    // Double-check authentication in layout (middleware should handle this, but extra safety)
    if (!user) {
        redirect('/login');
    }

    if (user.role !== 'admin' && user.role !== 'staff') {
        redirect('/login?error=access_denied');
    }

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
                <div className="p-6">
                    <div className="flex items-center gap-2">
                        <Shield className="text-red-500" size={24} />
                        <h1 className="text-xl font-bold text-white tracking-wide">GOD MODE</h1>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">OpCore Admin v2.0</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <item.icon size={18} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Info & Logout */}
                <div className="p-4 border-t border-slate-800">
                    <div className="px-3 py-2 mb-2">
                        <p className="text-sm text-white font-medium truncate">{user.email}</p>
                        <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8">
                    <h2 className="font-semibold text-white">Admin Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 relative">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                            {user.email[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
