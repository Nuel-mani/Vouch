'use client';

import { useState } from 'react';
import { CheckCircle, ExternalLink, Copy, Check, Loader2, Mail, AlertCircle, HelpCircle } from 'lucide-react';
import { manualVerifyUser, resendUserVerificationEmail } from '../verification-actions';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string | null;
    businessName: string | null;
    createdAt: Date | null;
    verificationHelpRequested: boolean | null;
}

export function VerificationQueue({ users }: { users: User[] }) {
    if (users.length === 0) return null;

    const helpRequested = users.filter(u => u.verificationHelpRequested).length;

    return (
        <section className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mail size={18} className="text-purple-400" />
                Unverified Users
                {helpRequested > 0 && (
                    <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                        {helpRequested} need help
                    </span>
                )}
            </h2>
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800 text-xs uppercase font-medium text-slate-300">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Registered</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {users.map((user) => (
                            <VerificationRow key={user.id} user={user} />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

function VerificationRow({ user }: { user: User }) {
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');
    const [copied, setCopied] = useState(false);

    const handleResendEmail = async () => {
        if (!confirm(`Resend verification email to ${user.email}?`)) return;
        setStatus('loading');
        try {
            const { success, error } = await resendUserVerificationEmail(user.id);
            if (success) {
                toast.success('Email resent successfully');
                setCopied(true); // Reusing 'copied' state for 'sent' visual feedback
                setTimeout(() => setCopied(false), 3000);
            } else {
                toast.error(error || 'Failed to send');
            }
        } catch (e) {
            toast.error('Error occurred');
        } finally {
            setStatus('idle');
        }
    };

    const handleVerify = async () => {
        if (!confirm(`Manually verify ${user.email}? This will allow them to login.`)) return;
        setStatus('loading');
        try {
            const res = await manualVerifyUser(user.id);
            if (res.success) {
                toast.success('User verified successfully');
            } else {
                toast.error(res.error || 'Failed');
            }
        } catch (e) {
            toast.error('Error occurred');
        } finally {
            setStatus('idle');
        }
    };

    return (
        <tr className="hover:bg-slate-800 transition">
            <td className="px-6 py-4 bg-purple-500/5">
                <div className="font-medium text-white">{user.businessName || 'Individual'}</div>
            </td>
            <td className="px-6 py-4 bg-purple-500/5">
                <div className="text-slate-300">{user.email}</div>
            </td>
            <td className="px-6 py-4 bg-purple-500/5">
                {user.verificationHelpRequested ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
                        <HelpCircle size={12} />
                        Needs Help
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded-full">
                        <Mail size={12} />
                        Pending
                    </span>
                )}
            </td>
            <td className="px-6 py-4 bg-purple-500/5">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
            </td>
            <td className="px-6 py-4 text-right bg-purple-500/5">
                <div className="flex justify-end gap-2">
                    <button
                        onClick={handleResendEmail}
                        disabled={status === 'loading'}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs font-medium transition"
                        title="Resend Verification Email"
                    >
                        {status === 'loading' && !copied ? <Loader2 size={14} className="animate-spin" /> : (copied ? <Check size={14} className="text-green-400" /> : <Mail size={14} />)}
                        {copied ? 'Sent' : 'Resend'}
                    </button>
                    <button
                        onClick={handleVerify}
                        disabled={status === 'loading'}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-xs font-medium transition"
                    >
                        {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        Verify
                    </button>
                </div>
            </td>
        </tr>
    );
}
