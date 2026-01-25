'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, ShieldCheck, Mail, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                // Determine if we should show specific errors or generic ones
                // For security, usually efficient to show generic success or specific validation errors
                throw new Error(data.error || 'Request failed');
            }

            setStatus('success');
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Something went wrong');
            setStatus('idle');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--background)]">
                <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">Request Received</h2>
                    <p className="text-[var(--muted-foreground)] mb-6 leading-relaxed">
                        To protect your account, our security team will verify your identity before restoring access.
                    </p>
                    <div className="bg-[var(--muted)] rounded-xl p-4 mb-8 text-left text-sm text-[var(--muted-foreground)] space-y-3">
                        <div className="flex gap-3">
                            <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                            <span>We have logged your request securely.</span>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                            <span>An admin will review your account details.</span>
                        </div>
                        <div className="flex gap-3">
                            <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                            <span>You will receive a call or email shortly.</span>
                        </div>
                    </div>
                    <Link
                        href="/login"
                        className="btn-secondary w-full py-3 flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--background)]">
            <div className="w-full max-w-md">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-8 transition"
                >
                    <ArrowLeft size={16} />
                    Back to Login
                </Link>

                <div className="mb-8">
                    <div className="w-12 h-12 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center mb-6">
                        <ShieldCheck size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--foreground)] mb-2">Account Recovery</h1>
                    <p className="text-[var(--muted-foreground)]">
                        Enter your email to initiate the secure recovery process.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={20} />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-all"
                                placeholder="name@company.com"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full btn-gradient py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {status === 'loading' ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Processing Request...
                            </>
                        ) : (
                            'Request Access Restoration'
                        )}
                    </button>

                    <p className="text-xs text-center text-[var(--muted-foreground)]">
                        For security reasons, Vouch does not send automated reset links for business accounts.
                    </p>
                </form>
            </div>
        </div>
    );
}
