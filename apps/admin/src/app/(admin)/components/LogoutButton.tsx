'use client';

import { useRouter } from 'next/navigation';
import { LogOut, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout error:', error);
            // Still redirect even if there's an error
            router.push('/login');
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-slate-800 transition-colors w-full disabled:opacity-50"
        >
            {loading ? (
                <Loader2 size={18} className="animate-spin" />
            ) : (
                <LogOut size={18} />
            )}
            <span className="font-medium">Exit God Mode</span>
        </button>
    );
}
