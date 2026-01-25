'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Building, User, ArrowRight, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const benefits = [
    'Unlimited transactions',
    'AI-powered receipt scanning',
    'NTA 2025 tax automation',
    'Audit-ready reports',
];

const businessStructures = [
    'Sole Proprietorship',
    'Limited Liability Co (LLC)',
    'Public Limited Co (PLC)',
    'Partnership',
    'NGO / Non-Profit',
];

const turnoverBands = [
    { value: 'micro', label: 'Micro (< ₦25M)' },
    { value: 'small', label: 'Small (< ₦100M)' },
    { value: 'medium', label: 'Medium (< ₦500M)' },
    { value: 'large', label: 'Large (> ₦500M)' },
];

const sectors = [
    'Agriculture',
    'Education',
    'Finance',
    'General',
    'General Trade',
    'Health',
    'Manufacturing',
    'Oil & Gas',
    'Professional Services',
    'Retail',
    'Salary Earner',
    'Service',
    'Tech',
];

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultType = searchParams.get('type') || 'personal';

    const [accountType, setAccountType] = useState<'personal' | 'business'>(
        defaultType as 'personal' | 'business'
    );

    // Common Fields
    const [name, setName] = useState(''); // Used for Business Name or Full Name
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    // Business Specific
    const [structure, setStructure] = useState(businessStructures[0]);
    const [turnover, setTurnover] = useState(turnoverBands[0].value);
    const [sector, setSector] = useState('General');
    const [taxId, setTaxId] = useState('');

    // Personal Specific
    const [annualIncome, setAnnualIncome] = useState('');
    const [rentAmount, setRentAmount] = useState('');
    const [paysRent, setPaysRent] = useState(false);

    // UX State
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Derived State for Tax Logic
    useEffect(() => {
        // Business: Micro businesses (<25M) are typically VAT exempt
        if (accountType === 'business') {
            // This is handled in backend but good for UI feedback if needed
        }
    }, [turnover, accountType]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        // NTA 2025 Logic
        const isVatExempt = accountType === 'business' && turnover === 'micro';
        const incomeNum = parseFloat(annualIncome.replace(/,/g, '')) || 0;
        const isTaxExempt = accountType === 'personal' && incomeNum < 800000;

        try {
            const payload = {
                email,
                password,
                accountType,
                businessName: name, // Maps to businessName in DB
                phoneNumber: phone,
                businessAddress: address, // Map to businessAddress? DB has businessAddress.

                // Business Fields
                ...(accountType === 'business' && {
                    businessStructure: structure,
                    turnoverBand: turnover,
                    sector,
                    taxIdentityNumber: taxId,
                    isVatExempt,
                }),

                // Personal Fields
                ...(accountType === 'personal' && {
                    annualIncome: incomeNum,
                    rentAmount: paysRent ? (parseFloat(rentAmount.replace(/,/g, '')) || 0) : 0,
                    paysRent,
                    isTaxExempt,
                    sector: 'Salary Earner', // Default sector for personal
                }),
            };

            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || 'Registration failed');
                throw new Error(data.error || 'Registration failed');
            }

            toast.success('Vouch ID created! Welcome to the standard of trust.');
            router.push('/dashboard');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Panel - Benefits (Visible on Mobile now) */}
            <div className="relative w-full lg:w-1/2 overflow-hidden bg-slate-900 shrink-0 lg:min-h-screen">
                <div className="absolute inset-0" style={{ background: 'var(--gradient-hero)', opacity: 0.15 }} />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 text-white h-auto lg:h-full">
                    <Link href="/" className="flex items-center gap-3 w-fit mb-8 lg:mb-0">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'var(--gradient-primary)' }}>
                            V
                        </div>
                        <span className="font-bold text-xl lg:text-2xl lowercase">vouch</span>
                    </Link>

                    <div className="max-w-md">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs lg:text-sm font-medium mb-4 lg:mb-6">
                            <Sparkles size={14} className="lg:w-4 lg:h-4" />
                            14-day free trial
                        </div>
                        <h2 className="text-3xl lg:text-4xl font-black leading-tight mb-4 lg:mb-6">
                            Start The Journey to{' '}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                                Financial  Compliance
                            </span>{' '}
                            Today
                        </h2>
                        <p className="text-gray-400 text-base lg:text-lg mb-6 lg:mb-10 lg:block hidden">
                            Join 2,000+ Nigerian businesses automating their bookkeeping and tax filings.
                        </p>

                        {/* Mobile-optimized tagline */}
                        <p className="text-gray-400 text-base mb-6 block lg:hidden">
                            Automate bookkeeping and taxes.
                        </p>

                        <div className="space-y-4 hidden lg:block">
                            {benefits.map((benefit) => (
                                <div key={benefit} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle size={18} className="text-green-400" />
                                    </div>
                                    <span className="text-gray-200">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <p className="text-gray-500 text-sm hidden lg:block">
                        No credit card required • Cancel anytime
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--background)] overflow-y-auto">
                <div className="w-full max-w-lg">
                    {/* Mobile Logo Hidden (Using Top Banner instead) */}

                    <div className="mb-8">
                        <h1 className="text-3xl font-black text-[var(--foreground)] mb-2">Create your account</h1>
                        <p className="text-[var(--muted-foreground)]">
                            Join thousands of Nigerians simplifying their taxes.
                        </p>
                    </div>

                    {/* Account Type Selector */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            type="button"
                            onClick={() => setAccountType('personal')}
                            className={`p-4 border-2 rounded-xl flex items-center justify-center gap-2 transition-all
                                ${accountType === 'personal'
                                    ? 'border-[var(--primary)] bg-[var(--primary-50)] text-[var(--primary)]'
                                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary-300)]'
                                }`}
                        >
                            <User size={20} />
                            <span className="font-semibold">Personal</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setAccountType('business')}
                            className={`p-4 border-2 rounded-xl flex items-center justify-center gap-2 transition-all
                                ${accountType === 'business'
                                    ? 'border-[var(--primary)] bg-[var(--primary-50)] text-[var(--primary)]'
                                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary-300)]'
                                }`}
                        >
                            <Building size={20} />
                            <span className="font-semibold">Business</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-start gap-2">
                                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">
                                {accountType === 'business' ? 'Business Name' : 'Full Name'}
                            </label>
                            <div className="relative">
                                {/* Icon placeholder logic if needed */}
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                                    placeholder={accountType === 'business' ? 'e.g. Lagos Ventures Ltd' : 'e.g. Adebayo Johnson'}
                                />
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                                    {accountType === 'business' ? <Building size={18} /> : <User size={18} />}
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:ring-2 focus:ring-[var(--primary)] transition-all"
                                placeholder="name@example.com"
                            />
                        </div>

                        {/* Password Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        minLength={8}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Address & Phone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Address</label>
                                <input
                                    type="text"
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                                    placeholder="123 Street Name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                                    placeholder="+234..."
                                />
                            </div>
                        </div>

                        <hr className="border-[var(--border)] my-6" />

                        {/* --- BUSINESS SPECIFIC --- */}
                        {accountType === 'business' && (
                            <div className="space-y-5">
                                <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Company Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Tax ID */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Tax ID / NIN (Optional)</label>
                                        <input
                                            type="text"
                                            value={taxId}
                                            onChange={(e) => setTaxId(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                                            placeholder="Optional"
                                        />
                                    </div>

                                    {/* Turnover Band */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Turnover Band</label>
                                        <select
                                            value={turnover}
                                            onChange={(e) => setTurnover(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] appearance-none"
                                        >
                                            {turnoverBands.map((band) => (
                                                <option key={band.value} value={band.value}>
                                                    {band.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Structure */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Structure</label>
                                        <select
                                            value={structure}
                                            onChange={(e) => setStructure(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] appearance-none"
                                        >
                                            {businessStructures.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Sector */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Business Sector</label>
                                        <select
                                            value={sector}
                                            onChange={(e) => setSector(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] appearance-none"
                                        >
                                            {sectors.map((s) => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* --- PERSONAL SPECIFIC --- */}
                        {accountType === 'personal' && (
                            <div className="space-y-5">
                                <h3 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider">Tax Profile (NTA 2025)</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Tax ID */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Tax ID / NIN (Optional)</label>
                                        <input
                                            type="text"
                                            value={taxId}
                                            onChange={(e) => setTaxId(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                                            placeholder="Optional"
                                        />
                                    </div>

                                    {/* Annual Income */}
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Annual Income</label>
                                        <input
                                            type="text"
                                            value={annualIncome}
                                            onChange={(e) => setAnnualIncome(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                                            placeholder="Est. Annual"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="paysRent"
                                        checked={paysRent}
                                        onChange={(e) => setPaysRent(e.target.checked)}
                                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                    />
                                    <label htmlFor="paysRent" className="text-sm text-[var(--foreground)]">
                                        I pay Rent (eligible for Relief)
                                    </label>
                                </div>

                                {paysRent && (
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--foreground)] mb-2">Rent Amount</label>
                                        <input
                                            type="text"
                                            value={rentAmount}
                                            onChange={(e) => setRentAmount(e.target.value)}
                                            className="w-full px-4 py-3.5 bg-[var(--muted)] border border-[var(--border)] rounded-xl text-[var(--foreground)]"
                                            placeholder="Annual Rent"
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="pt-2">
                            <label className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    required
                                    className="mt-1 w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                />
                                <span className="text-sm text-[var(--muted-foreground)]">
                                    I agree to the <Link href="/terms" className="text-[var(--primary)] hover:underline">Terms</Link> and <Link href="/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link>.
                                </span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-gradient py-4 text-lg font-semibold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-blue-500/20"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-[var(--muted-foreground)]">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
