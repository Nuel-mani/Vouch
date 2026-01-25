'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const testimonials = [
    {
        quote: "Vouch saved us over ₦2.3M in tax deductions we didn't know we could claim.",
        author: "Adebayo Ogunlesi",
        role: "CEO, TechVentures Ltd",
    },
    {
        quote: "Finally, a bookkeeping app that understands Nigerian tax laws. Game changer!",
        author: "Chioma Nwosu",
        role: "Founder, BeautyBox NG",
    },
];

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                const errorMessage = data.error || 'Login failed';
                toast.error(errorMessage);
                throw new Error(errorMessage);
            }

            toast.success('Welcome back!');
            router.push('/dashboard');
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'An error occurred';
            setError(msg);
            if (msg === 'An error occurred') toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel - Branding (Visible on Mobile now) */}
            <div className="relative w-full lg:w-1/2 overflow-hidden shrink-0 lg:min-h-screen" style={{ background: 'var(--gradient-primary)' }}>
                {/* Animated background elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full border-[40px] border-white/10 animate-float" />
                    <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full border-[60px] border-white/5" style={{ animationDelay: '2s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 text-white h-auto lg:h-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 w-fit mb-8 lg:mb-0">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-xl flex items-center justify-center text-[var(--primary)] font-bold text-lg">
                            V
                        </div>
                        <span className="font-bold text-xl lg:text-2xl lowercase">vouch</span>
                    </Link>

                    {/* Testimonial */}
                    <div className="max-w-md">
                        <div className="mb-0 lg:mb-8">
                            <p className="text-xl lg:text-2xl font-medium leading-relaxed mb-4 lg:mb-6">
                                "{testimonials[0].quote}"
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/20 flex items-center justify-center font-bold">
                                    {testimonials[0].author[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm lg:text-base">{testimonials[0].author}</p>
                                    <p className="text-white/70 text-xs lg:text-sm">{testimonials[0].role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Features - Desktop Only */}
                        <div className="space-y-3 border-t border-white/20 pt-8 hidden lg:block">
                            {['NTA 2025 Tax Automation', 'Works Offline', 'Audit-Ready Reports'].map((feature) => (
                                <div key={feature} className="flex items-center gap-3 text-white/90">
                                    <CheckCircle size={18} className="text-green-300" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer - Desktop Only */}
                    <p className="text-white/50 text-sm hidden lg:block">
                        © 2026 Vouch Technologies Ltd.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-[var(--background)]">
                <div className="w-full max-w-md">
                    {/* Mobile Logo Hidden */}

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-[var(--foreground)] mb-2">Welcome back</h1>
                        <p className="text-[var(--muted-foreground)]">
                            Sign in to continue to your dashboard
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-[var(--error-light)] text-[var(--error)] p-4 rounded-xl text-sm font-medium">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label htmlFor="password" className="block text-sm font-semibold text-[var(--foreground)]">
                                    Password
                                </label>
                                <Link href="/forgot-password" className="text-sm text-[var(--primary)] font-medium hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-all pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                            />
                            <label htmlFor="remember" className="text-sm text-[var(--muted-foreground)]">
                                Keep me signed in
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-gradient py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-[var(--muted-foreground)]">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-[var(--primary)] font-semibold hover:underline">
                                Start free trial
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
