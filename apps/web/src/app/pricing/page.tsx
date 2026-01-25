import Link from 'next/link';
import { Check, Sparkles, Zap, Crown, Building, ArrowRight, Shield, Clock, Users } from 'lucide-react';

const plans = [
    {
        id: 'free',
        name: 'Starter',
        description: 'Perfect for getting started',
        price: 0,
        period: 'forever',
        icon: Zap,
        features: [
            '50 transactions/month',
            'Basic financial reports',
            'Email support',
            'Standard invoice template',
            'Mobile access',
        ],
        cta: 'Start Free',
        ctaStyle: 'secondary',
    },
    {
        id: 'pro',
        name: 'Growth',
        description: 'For growing businesses',
        price: 5000,
        period: '/month',
        icon: Crown,
        popular: true,
        features: [
            'Unlimited transactions',
            'Advanced analytics & insights',
            'Priority email support',
            'Custom branding & logo',
            'Tax optimization tools',
            'AI receipt scanning',
            'Multiple invoice templates',
            'Audit-ready exports',
        ],
        cta: 'Start Free Trial',
        ctaStyle: 'primary',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        price: 25000,
        period: '/month',
        icon: Building,
        features: [
            'Everything in Growth',
            'Multi-user access (up to 10)',
            'Dedicated account manager',
            'API access & webhooks',
            'Custom integrations',
            'SLA guarantee (99.9%)',
            'Priority phone support',
            'Custom reporting',
        ],
        cta: 'Contact Sales',
        ctaStyle: 'secondary',
    },
];

const faqs = [
    {
        q: 'What is included in the free trial?',
        a: 'The 14-day free trial gives you full access to all Growth plan features. No credit card required to start.',
    },
    {
        q: 'Can I change my plan later?',
        a: 'Yes! You can upgrade or downgrade at any time. Changes take effect immediately, and we\'ll prorate your billing.',
    },
    {
        q: 'Is my data secure?',
        a: 'Absolutely. We use bank-level encryption (AES-256), and your data is stored on secure servers in Nigeria. We are fully compliant with NDPR.',
    },
    {
        q: 'Do you offer discounts for annual billing?',
        a: 'Yes! Pay annually and save 20%. That\'s 2 months free on any paid plan.',
    },
];

export default function PricingPage() {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[var(--border)]">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'var(--primary)' }}>
                            V
                        </div>
                        <span className="font-bold text-xl tracking-tight lowercase">vouch</span>
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted-foreground)]">
                        <Link href="/#features" className="hover:text-[var(--primary)] transition">Features</Link>
                        <Link href="/pricing" className="text-[var(--primary)]">Pricing</Link>
                        <Link href="/#about" className="hover:text-[var(--primary)] transition">About</Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="font-bold hover:text-[var(--primary)] transition">
                            Log In
                        </Link>
                        <Link
                            href="/register"
                            className="btn-gradient text-sm py-2 px-5"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="pt-20 pb-16 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--primary)] rounded-full blur-[128px] opacity-10" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[var(--secondary)] rounded-full blur-[128px] opacity-10" />
                </div>

                <div className="max-w-4xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary-50)] text-[var(--primary)] text-sm font-semibold mb-6">
                        <Sparkles size={16} />
                        14-day free trial • No credit card required
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                        Simple, Transparent{' '}
                        <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'var(--gradient-primary)' }}>
                            Pricing
                        </span>
                    </h1>
                    <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
                        Choose the plan that fits your business. All plans include our core tax compliance features.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="pb-24 px-4">
                <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl p-8 transition-all duration-300 
                                    ${plan.popular
                                        ? 'bg-gradient-to-b from-[var(--primary)] to-[var(--primary-700)] text-white shadow-2xl scale-105 z-10'
                                        : 'bg-white dark:bg-slate-800 border border-[var(--border)] hover:shadow-xl hover:-translate-y-1'
                                    }`}
                            >
                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-[var(--primary)] text-sm font-bold rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                )}

                                {/* Header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`p-2.5 rounded-xl ${plan.popular ? 'bg-white/20' : 'bg-[var(--primary-50)]'}`}>
                                        <Icon size={24} className={plan.popular ? 'text-white' : 'text-[var(--primary)]'} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{plan.name}</h3>
                                        <p className={`text-sm ${plan.popular ? 'text-white/80' : 'text-[var(--muted-foreground)]'}`}>
                                            {plan.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <span className="text-4xl font-black">
                                        {plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`}
                                    </span>
                                    {plan.price > 0 && (
                                        <span className={plan.popular ? 'text-white/70' : 'text-[var(--muted-foreground)]'}>
                                            {plan.period}
                                        </span>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3 text-sm">
                                            <Check
                                                size={18}
                                                className={`flex-shrink-0 mt-0.5 ${plan.popular ? 'text-green-300' : 'text-[var(--success)]'}`}
                                            />
                                            <span className={plan.popular ? 'text-white/90' : ''}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Link
                                    href={plan.id === 'enterprise' ? '/contact' : '/register'}
                                    className={`block w-full py-3 px-6 rounded-xl font-bold text-center transition-all
                                        ${plan.popular
                                            ? 'bg-white text-[var(--primary)] hover:bg-gray-100 shadow-lg'
                                            : plan.ctaStyle === 'primary'
                                                ? 'btn-primary'
                                                : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--border)]'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-16 border-y border-[var(--border)] bg-[var(--muted)]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--primary-50)] flex items-center justify-center">
                                <Shield className="text-[var(--primary)]" size={24} />
                            </div>
                            <p className="font-bold text-[var(--foreground)]">Bank-Level Security</p>
                            <p className="text-sm text-[var(--muted-foreground)]">AES-256 encryption</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                                <Check className="text-[var(--success)]" size={24} />
                            </div>
                            <p className="font-bold text-[var(--foreground)]">NDPR Compliant</p>
                            <p className="text-sm text-[var(--muted-foreground)]">Nigerian data protection</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--warning-light)] flex items-center justify-center">
                                <Clock className="text-[var(--warning)]" size={24} />
                            </div>
                            <p className="font-bold text-[var(--foreground)]">99.9% Uptime</p>
                            <p className="text-sm text-[var(--muted-foreground)]">Always available</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                                <Users className="text-purple-600" size={24} />
                            </div>
                            <p className="font-bold text-[var(--foreground)]">2,000+ Businesses</p>
                            <p className="text-sm text-[var(--muted-foreground)]">Vouched by Vouch</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 px-4">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <details
                                key={i}
                                className="group bg-white dark:bg-slate-800 border border-[var(--border)] rounded-xl overflow-hidden"
                            >
                                <summary className="flex items-center justify-between p-6 cursor-pointer font-semibold text-[var(--foreground)] hover:bg-[var(--muted)] transition">
                                    {faq.q}
                                    <ArrowRight className="transform transition-transform group-open:rotate-90" size={18} />
                                </summary>
                                <div className="px-6 pb-6 text-[var(--muted-foreground)]">
                                    {faq.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 relative overflow-hidden" style={{ background: 'var(--gradient-primary)' }}>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10 text-white">
                    <h2 className="text-4xl font-black mb-6">Ready to Automate Your Tax Compliance?</h2>
                    <p className="text-xl text-white/80 mb-10">
                        Join thousands of Nigerian businesses using Vouch to stay compliant.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/register"
                            className="px-8 py-4 bg-white text-[var(--primary)] rounded-xl font-bold text-lg shadow-xl hover:bg-gray-50 transition"
                        >
                            Start Your Free Trial
                        </Link>
                        <Link
                            href="/contact"
                            className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition"
                        >
                            Talk to Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-gray-400 py-16 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-4 gap-12 text-sm">
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-xs" style={{ background: 'var(--primary)' }}>
                                V
                            </div>
                            <span className="font-bold text-lg text-white tracking-tight lowercase">vouch</span>
                        </Link>
                        <p>
                            The offline-first bookkeeping platform for Nigeria. Simplify Finance Act 2024 compliance today.
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2">
                            <li><Link href="/#features" className="hover:text-white transition">Features</Link></li>
                            <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                            <li><Link href="/" className="hover:text-white transition">Offline Mode</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Resources</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-white transition">Tax Guide</Link></li>
                            <li><Link href="/" className="hover:text-white transition">Help Center</Link></li>
                            <li><Link href="/" className="hover:text-white transition">Blog</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><Link href="/" className="hover:text-white transition">Privacy Policy</Link></li>
                            <li><Link href="/" className="hover:text-white transition">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 md:px-8 mt-16 pt-8 border-t border-slate-800 text-xs flex justify-between">
                    <p>© 2026 Vouch Technologies Ltd. All rights reserved.</p>
                    <p>Made in Lagos 🇳🇬</p>
                </div>
            </footer>
        </div>
    );
}
