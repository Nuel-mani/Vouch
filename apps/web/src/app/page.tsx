'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, WifiOff, FileText, Building, Users, CheckCircle, Sparkles, Menu, X } from 'lucide-react';
import { ComplianceCalculator } from '../components/ComplianceCalculator';
import { ThemeToggle } from '../components/ThemeToggle';

export default function LandingPage() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--background)] font-sans">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[var(--border)]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-lg" style={{ background: 'var(--primary)' }}>
                            V
                        </div>
                        <span className="font-bold text-2xl tracking-tight text-[var(--foreground)] lowercase">vouch</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--muted-foreground)]">
                        <a href="#features" className="hover:text-[var(--primary)] transition-colors">Solutions</a>
                        <Link href="/pricing" className="hover:text-[var(--primary)] transition-colors">Pricing</Link>
                        <a href="#compliance" className="hover:text-[var(--primary)] transition-colors">Compliance Guide</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:block font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors">
                            Log In
                        </Link>
                        <ThemeToggle />
                        <Link
                            href="/register"
                            className="hidden sm:block bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
                        >
                            Get Started
                        </Link>
                        <button
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-200 p-6 flex flex-col gap-6 shadow-2xl animate-in slide-in-from-top-5">
                        <a href="#features" className="text-lg font-bold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Solutions</a>
                        <Link href="/pricing" className="text-lg font-bold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
                        <a href="#compliance" className="text-lg font-bold text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Compliance Guide</a>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-slate-500">Theme:</span>
                            <ThemeToggle />
                        </div>
                        <div className="h-px bg-slate-100 w-full" />
                        <Link href="/login" className="text-lg font-bold text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Log In</Link>
                        <Link
                            href="/register"
                            className="bg-[var(--accent)] text-white font-bold py-4 px-6 rounded-xl text-center shadow-md active:scale-95"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Get Started
                        </Link>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <header className="relative pt-12 pb-16 md:pt-24 md:pb-32 overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 -z-10 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary-100)] opacity-20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--accent-light)] opacity-10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary-100)] text-[var(--primary-700)] text-xs font-black uppercase tracking-widest mb-6">
                            <ShieldCheck size={14} />
                            NTA 2025 Compliant
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.1] mb-6 text-[var(--foreground)] tracking-tight">
                            Don't just hire. <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-gold)' }}>Vouch.</span><br />
                            Scale with Integrity.
                        </h1>
                        <p className="text-xl md:text-2xl text-[var(--muted-foreground)] mb-10 font-serif leading-relaxed max-w-3xl mx-auto">
                            The only Offline-First Operating System for Nigeria. From 'Instagram Hustle' to Corporate Headquarters—manage your Money, People, and Taxes with zero trust issues.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/register"
                                className="w-full sm:w-auto px-10 py-5 bg-[var(--accent)] text-white rounded-2xl font-black text-lg shadow-xl shadow-amber-600/20 hover:bg-[var(--accent-light)] hover:-translate-y-1 transition-all active:scale-95"
                            >
                                Start for Free
                            </Link>
                            <button
                                className="w-full sm:w-auto px-10 py-5 bg-[var(--secondary)] text-white rounded-2xl font-black text-lg shadow-xl hover:bg-[var(--secondary-light)] hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                Book Enterprise Demo
                            </button>
                        </div>

                        <div className="mt-12 flex flex-col items-center gap-4">
                            <p className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-widest">
                                Trusted by 2,000+ Nigerian Businesses including
                            </p>
                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                                <div className="font-black text-xl text-[var(--secondary)]">CONSTRUCT_CO</div>
                                <div className="font-black text-xl text-[var(--secondary)]">RETAIL_CHAIN</div>
                                <div className="font-black text-xl text-[var(--secondary)]">STARTUP_HUBE</div>
                                <div className="font-black text-xl text-[var(--secondary)]">LAG_LOGISTICS</div>
                            </div>
                        </div>
                    </div>

                    {/* Split Interaction Visual */}
                    <div className="relative mt-12 grid md:grid-cols-12 gap-8 items-center">
                        {/* Mobile Phone (Left) */}
                        <div className="md:col-span-4 flex justify-center md:justify-end">
                            <div className="relative w-[280px] h-[560px] bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden animate-float">
                                <div className="absolute top-0 w-full h-6 bg-slate-800 flex justify-center items-end pb-1">
                                    <div className="w-20 h-4 bg-slate-900 rounded-full" />
                                </div>
                                <div className="p-4 pt-8 h-full bg-emerald-50 pointer-events-none">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">V</div>
                                        <div className="text-[10px] font-bold text-emerald-900">Vouch Invoice #981</div>
                                    </div>
                                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 mb-4">
                                        <div className="text-[10px] text-slate-400 mb-1">Fashion Designer Inc.</div>
                                        <div className="text-lg font-black text-slate-900">₦ 85,000.00</div>
                                        <div className="mt-2 flex items-center gap-1 text-[8px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full w-fit">
                                            <CheckCircle size={8} /> Validated by NTA 2025
                                        </div>
                                    </div>
                                    <div className="bg-emerald-600 text-white rounded-2xl p-3 text-[10px] font-medium ml-4 relative">
                                        Thank you for your business! Your tax receipt has been generated automatically.
                                        <div className="absolute bottom-1 right-2 text-[8px] opacity-70">10:42 AM</div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                        <span className="w-full h-px bg-slate-200"></span>
                                        Delivered via WhatsApp
                                        <span className="w-full h-px bg-slate-200"></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Screen (Right) - Hidden on Mobile */}
                        <div className="hidden md:block md:col-span-8">
                            <div className="relative bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden aspect-video">
                                <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4 gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20" />
                                    </div>
                                    <div className="mx-auto text-[10px] text-slate-500 font-mono">payroll / audits / anti-fraud</div>
                                </div>
                                <div className="p-8 grid grid-cols-3 gap-6">
                                    <div className="col-span-2 space-y-6">
                                        <div className="h-4 w-48 bg-slate-800 rounded animate-pulse" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                                <div className="text-[10px] font-black text-rose-500 uppercase tracking-tighter mb-1">Anti-Fraud Alert</div>
                                                <div className="text-sm font-bold text-white">Ghost Worker Detected</div>
                                                <div className="text-[10px] text-slate-400 mt-1">ID #402 matches Staff #889</div>
                                            </div>
                                            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                                <div className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mb-1">Tax Savings</div>
                                                <div className="text-sm font-bold text-white">₦ 2,450,300</div>
                                                <div className="text-[10px] text-slate-400 mt-1">NTA 2025 Optimized</div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-2 w-full bg-slate-800 rounded" />
                                            <div className="h-2 w-5/6 bg-slate-800 rounded" />
                                            <div className="h-2 w-4/6 bg-slate-800 rounded" />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-slate-800/50 aspect-square rounded-2xl border border-slate-700/50 flex flex-col items-center justify-center p-4">
                                            <div className="text-3xl font-black text-white mb-1">2</div>
                                            <div className="text-[8px] font-bold text-rose-500 uppercase text-center">Flags Raised Today</div>
                                        </div>
                                        <div className="bg-[var(--accent)] aspect-square rounded-2xl flex flex-col items-center justify-center p-4 shadow-lg shadow-amber-600/20">
                                            <div className="text-3xl font-black text-white mb-1">98%</div>
                                            <div className="text-[8px] font-bold text-white uppercase text-center">Trust Score</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>


            {/* Emotional Hook Section */}
            <section id="pain" className="py-12 md:py-24 bg-[var(--secondary)] text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
                        <p className="text-[var(--accent)] font-black uppercase tracking-[0.2em] text-sm mb-4">The Realities of Scale</p>
                        <h2 className="text-4xl md:text-6xl font-black mb-6">The Cost of Doing Business</h2>
                        <p className="text-xl text-slate-400 font-serif leading-relaxed">
                            Scaling a business in Nigeria without the right tools isn't just hard—it's expensive. Here is what Vouch solves on day one.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <PainCard
                            badge="System Risk"
                            title="The FIRS Nightmare"
                            description="Avoid massive penalties and audits. Vouch automatically bridges your daily sales to NTA 2025 compliance standards, ensuring you're always 'Audit-Ready'."
                            actionLabel="LEARN COMPLIANCE"
                            imagePlaceholder={<div className="w-full h-full bg-slate-800 flex items-center justify-center"><FileText size={48} className="text-slate-600" /></div>}
                        />
                        <PainCard
                            badge="Revenue Leak"
                            title="The Padding Problem"
                            description="Stop inventory disappearance and expense padding. Our triple-check ledger tracks every single unit from purchase to the last mile, closing the gap for bad actors."
                            actionLabel="SECURE INVENTORY"
                            imagePlaceholder={<div className="w-full h-full bg-slate-800 flex items-center justify-center"><Building size={48} className="text-slate-600" /></div>}
                        />
                        <PainCard
                            badge="Payroll Fraud"
                            title="The Ghost Worker"
                            description="Are you paying people who don't exist? Our biometric identity core integrates with payroll to verify attendance in real-time, even in offline field locations."
                            actionLabel="AUDIT PAYROLL"
                            imagePlaceholder={<div className="w-full h-full bg-slate-800 flex items-center justify-center"><Users size={48} className="text-slate-600" /></div>}
                        />
                    </div>

                    <div className="mt-24 text-center">
                        <div className="inline-flex flex-col items-center">
                            <div className="w-px h-24 bg-gradient-to-b from-[var(--accent)] to-emerald-500 animate-pulse" />
                            <div className="my-6 px-6 py-2 border border-emerald-500/30 rounded-full bg-emerald-500/10 text-emerald-400 font-black text-xs uppercase tracking-widest">
                                Transition to Stability
                            </div>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-black mt-8 mb-4 max-w-2xl mx-auto">
                            Vouch replaces anxiety with <span className="text-emerald-500">Audit Trails.</span>
                        </h3>
                        <p className="text-slate-400 font-serif text-lg">We are your Digital Bureaucracy.</p>
                    </div>
                </div>

                {/* Background effects */}
                <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px]" />
                </div>
            </section>

            {/* Segmentation Section */}
            <section id="solutions" className="py-12 md:py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12 md:mb-20">
                        <p className="text-[var(--primary)] font-black uppercase tracking-[0.2em] text-sm mb-4">Choose Your Engine</p>
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Tailored for Your Growth</h2>
                        <p className="text-xl text-[var(--muted-foreground)] font-serif leading-relaxed">
                            Whether you're managing a nationwide logistics fleet or scaling your first Instagram hustle, Vouch is built for you.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Enterprise Card */}
                        <EngineCard
                            type="Enterprise"
                            tagline="The Trust Engine"
                            headline="Engine for Your Operations."
                            target="Construction, Logistics, Retail Chains"
                            features={[
                                { title: "Clock-In Management System", desc: "Stop time-theft with Unique attendance." },
                                { title: "Maker-Checker Wallets", desc: "Staff can request funds. You upload evidence to unlock next tranche." },
                                { title: "Price Forensic Scanner", desc: "AI that alerts you when a vendor invoice is 40% above market rate." }
                            ]}
                            cta="Get Enterprise Quote"
                            isDark={true}
                            icon={<Building className="text-[var(--accent)]" size={32} />}
                        />

                        {/* SME Card */}
                        <EngineCard
                            type="SMEs & Creators"
                            tagline="The Growth Engine"
                            headline="Your Accountant in Your Pocket."
                            target="IG Vendors, Freelancers, Startups"
                            features={[
                                { title: "NTA 2025 Autopilot", desc: "Turnover tracking that warns before you hit Taxable Threshold." },
                                { title: "Branded Invoicing", desc: "Look like a Fortune 500 company, even if it's just you." },
                                { title: "Offline Mode", desc: "No Data? No Wahala. Invoicing works without internet." }
                            ]}
                            cta="Start SME Trial"
                            isFeatured={true}
                            icon={<Sparkles className="text-emerald-500" size={32} />}
                        />

                        {/* Individual Card */}
                        <EngineCard
                            type="Individuals"
                            tagline="The Career Passport"
                            headline="Verify Your Value."
                            target="Employees, Job Seekers"
                            features={[
                                { title: "Smart CV", desc: "Prove your salary history and reliability to new employers." },
                                { title: "Tax Relief", desc: "Automatically claim your Rent Relief and Pension deductions." },
                                { title: "Early Wage Access", desc: "Access your earned salary before payday." }
                            ]}
                            cta="Get Career Passport"
                            icon={<Users className="text-blue-500" size={32} />}
                        />
                    </div>
                </div>
            </section>

            {/* Nigeria Specific Section */}
            <section className="py-12 md:py-24 bg-[var(--muted)] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="max-w-3xl mb-12 md:mb-16">
                        <p className="text-[var(--primary)] font-black uppercase tracking-[0.2em] text-sm mb-4">Market Fit</p>
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Built for the Realities of Nigeria.</h2>
                        <p className="text-xl text-[var(--muted-foreground)] font-serif leading-relaxed">
                            Generic software fails because it doesn't understand the 'Lagos Traffic' of business—high friction, low trust, and unreliable connectivity.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <MarketFitCard
                            icon={<WifiOff size={24} />}
                            title="Offline-First Architecture"
                            desc="No Signal? No Problem. Your data saves locally and syncs automatically when the network returns."
                        />
                        <MarketFitCard
                            icon={<ShieldCheck size={24} />}
                            title="The 'Tax Shield' Simulator"
                            desc='App suggests: "Buy a delivery van now to reduce CIT by ₦450k." Stop guessing your tax liability.'
                        />
                        <MarketFitCard
                            icon={<FileText size={24} />}
                            title="WhatsApp Integration"
                            desc="Send Invoices and Demand Notices directly to where your customers actually live: WhatsApp."
                        />
                        <MarketFitCard
                            icon={<Building size={24} />}
                            title="Bank-Grade Security"
                            desc="NDPR Compliant. Your data is encrypted and strictly your own. We never sell your business data."
                        />
                        <MarketFitCard
                            icon={<Sparkles size={24} />}
                            title="NTA 2025 Ready"
                            desc="Turnover tracking that prepares you for the new Fiscal Cliff before the regulators come knocking."
                        />
                        <MarketFitCard
                            icon={<Users size={24} />}
                            title="Local Support"
                            desc="Speak to real Nigerians who understand local fiscal policy, not a generic offshore chatbot."
                        />
                    </div>
                </div>
            </section>

            {/* Compliance Check Section */}
            <section className="py-12 md:py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
                        <p className="text-[var(--primary)] font-black uppercase tracking-[0.2em] text-sm mb-4">Lead with Logic</p>
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Will You Survive the Fiscal Cliff?</h2>
                        <p className="text-xl text-[var(--muted-foreground)] font-serif leading-relaxed">
                            Most Nigerian businesses are overpaying taxes or accruing silent penalties. Use our calculator to see where you stand.
                        </p>
                    </div>
                    <ComplianceCalculator />
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-12 md:py-24 bg-[var(--secondary)] relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-3xl md:text-6xl font-black mb-6">Integrity is the New Currency.</h2>
                    <p className="text-lg md:text-xl text-slate-400 mb-8 md:mb-12 font-serif">
                        Join the network of vouched businesses and professionals. Build on trust, scale without limits.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <Link
                            href="/register?type=business"
                            className="px-12 py-5 bg-[var(--accent)] text-white rounded-2xl font-black text-xl shadow-2xl shadow-amber-600/30 hover:bg-[var(--accent-light)] transition-all hover:-translate-y-1"
                        >
                            Get Vouch for Business
                        </Link>
                        <Link
                            href="/register?type=personal"
                            className="px-12 py-5 bg-transparent border-2 border-white/20 text-white rounded-2xl font-black text-xl hover:bg-white/10 transition-all hover:-translate-y-1"
                        >
                            Get Vouch Personal
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-950 text-slate-500 py-12 md:py-24 border-t border-slate-900">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid md:grid-cols-4 gap-12 text-sm mb-12 md:mb-20">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                    V
                                </div>
                                <span className="font-bold text-2xl text-white tracking-tight lowercase">vouch</span>
                            </div>
                            <p className="leading-relaxed mb-8">
                                The Trust OS for offline-first operations in Nigeria. Empowering MSMEs and Enterprises with zero-trust bookkeeping.
                            </p>
                            <div className="flex gap-4">
                                <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white transition-colors cursor-pointer">LN</span>
                                <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white transition-colors cursor-pointer">TW</span>
                                <span className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:text-white transition-colors cursor-pointer">IG</span>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8">Product</h4>
                            <ul className="space-y-4 font-medium">
                                <li><Link href="/pricing" className="hover:text-emerald-500 transition-colors">Pricing & Tokens</Link></li>
                                <li><a href="#solutions" className="hover:text-emerald-500 transition-colors">Enterprise Solutions</a></li>
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">Offline Protocol</a></li>
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">API Docs</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8">Trust Center</h4>
                            <ul className="space-y-4 font-medium">
                                <li><a href="#" className="hover:text-emerald-500 transition-colors font-bold text-emerald-500">NTA 2025 Guide</a></li>
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">Compliance Blog</a></li>
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">Verify a Candidate</a></li>
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">Fraud Reporting</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-white uppercase tracking-widest text-xs mb-8">Legal</h4>
                            <ul className="space-y-4 font-medium">
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">NDPR Compliance</a></li>
                                <li><a href="#" className="hover:text-emerald-500 transition-colors">Security Audit</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs">© 2026 Vouch Technologies Ltd. All rights reserved.</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <p className="text-xs font-bold uppercase tracking-widest">System Status: All Systems Operational</p>
                        </div>
                        <p className="text-xs">Built with Trust in Lagos 🇳🇬</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function MarketFitCard({
    icon,
    title,
    desc
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
}) {
    return (
        <div className="p-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] hover:shadow-xl transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-[var(--primary)] mb-6 group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                {icon}
            </div>
            <h3 className="text-lg font-black mb-3 text-slate-900 dark:text-white">{title}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}

function EngineCard({
    type,
    tagline,
    headline,
    target,
    features,
    cta,
    isDark = false,
    isFeatured = false,
    icon
}: {
    type: string;
    tagline: string;
    headline: string;
    target: string;
    features: { title: string; desc: string }[];
    cta: string;
    isDark?: boolean;
    isFeatured?: boolean;
    icon: React.ReactNode;
}) {
    return (
        <div className={`relative p-8 rounded-[2.5rem] border ${isDark ? 'bg-[var(--secondary)] text-white border-slate-700' : isFeatured ? 'bg-white dark:bg-slate-900 border-[var(--primary)] shadow-2xl scale-105 z-10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'} transition-all hover:-translate-y-2`}>
            {isFeatured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                    Most Popular
                </div>
            )}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isDark ? 'text-[var(--accent)]' : 'text-[var(--primary)]'}`}>{tagline}</p>
                    <h3 className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{type}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-50 dark:bg-slate-900'}`}>
                    {icon}
                </div>
            </div>

            <p className={`text-xs font-bold font-mono mb-6 pb-6 border-b ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400'}`}>
                TARGET: {target}
            </p>

            <h4 className={`text-xl font-black mb-8 leading-tight ${isDark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{headline}</h4>

            <ul className="space-y-6 mb-12">
                {features.map((f, i) => (
                    <li key={i} className="flex gap-4">
                        <div className={`mt-1 h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                            <CheckCircle size={12} />
                        </div>
                        <div>
                            <p className={`text-sm font-black mb-0.5 ${isDark ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{f.title}</p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>{f.desc}</p>
                        </div>
                    </li>
                ))}
            </ul>

            <Link
                href="/register"
                className={`block w-full py-4 rounded-2xl font-black text-center transition-all ${isDark ? 'bg-white text-[var(--secondary)] hover:bg-slate-100' : isFeatured ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-600)] shadow-lg shadow-emerald-600/20' : 'bg-slate-50 dark:bg-slate-800 text-[var(--secondary)] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            >
                {cta}
            </Link>
        </div>
    );
}

function PainCard({
    badge,
    title,
    description,
    actionLabel,
    imagePlaceholder
}: {
    badge: string;
    title: string;
    description: string;
    actionLabel: string;
    imagePlaceholder: React.ReactNode;
}) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden group hover:border-[var(--primary)] transition-all">
            <div className="h-48 relative overflow-hidden">
                {imagePlaceholder}
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-rose-600/90 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                        {badge}
                    </span>
                </div>
            </div>
            <div className="p-8">
                <h3 className="text-xl font-black mb-4 group-hover:text-[var(--primary)] transition-colors">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-8">{description}</p>
                <button className="flex items-center gap-2 text-[10px] font-black text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors uppercase tracking-[0.2em]">
                    {actionLabel} <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
