'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your email...');
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch(`/api/auth/verify-email?token=${token}`);
                const data = await res.json();

                if (data.success) {
                    setStatus('success');
                    setMessage('Email verified successfully!');
                    // Start fade-out transition, then redirect
                    setTimeout(() => setIsFading(true), 1200);
                    setTimeout(() => router.push('/dashboard'), 2000);
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed.');
                }
            } catch (error) {
                setStatus('error');
                setMessage('An error occurred during verification.');
                console.error(error);
            }
        };

        verify();
    }, [token, router]);

    return (
        <div
            className={`min-h-screen flex items-center justify-center bg-[var(--background)] p-4 transition-opacity duration-700 ${isFading ? 'opacity-0' : 'opacity-100'}`}
        >
            <div
                className={`max-w-md w-full bg-[var(--card)] p-8 rounded-2xl shadow-xl border border-[var(--border)] text-center transition-all duration-700 ${isFading ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
            >
                {status === 'verifying' && (
                    <>
                        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Verifying Email</h1>
                        <p className="text-[var(--muted-foreground)]">Please wait while we verify your account...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className={`transition-transform duration-500 ${isFading ? 'scale-110' : 'scale-100'}`}>
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        </div>
                        <h1 className="text-2xl font-bold mb-2 text-green-600">Verified!</h1>
                        <p className="text-[var(--muted-foreground)] mb-4">Your email has been confirmed.</p>
                        <p className="text-sm text-[var(--muted-foreground)] animate-pulse">
                            Taking you to your dashboard...
                        </p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
                        <p className="text-[var(--muted-foreground)] mb-6">{message}</p>
                        <Link href="/login" className="btn-secondary w-full py-3 block rounded-xl">
                            Back to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
            <VerifyContent />
        </Suspense>
    );
}
