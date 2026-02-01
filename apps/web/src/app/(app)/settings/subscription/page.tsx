import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { Check, Crown, Zap, Building } from 'lucide-react';
import Link from 'next/link';

interface Plan {
    id: string;
    name: string;
    price: number;
    description: string;
    icon: any;
    features: string[];
    popular?: boolean;
    priceDisplay?: string;
}

const PLANS_DATA: Record<string, Plan> = {
    free: {
        id: 'free',
        name: 'Starter',
        price: 0,
        description: 'For individuals just getting started',
        icon: Zap,
        features: [
            '1000 pages transactions import/year',
            '500 Invoice creation/year',
            'Basic financial reports',
            'Email support',
        ],
    },
    personal_pro: {
        id: 'personal_pro',
        name: 'Personal Pro',
        price: 1500,
        description: 'For growing careers & freelancers',
        icon: Crown,
        popular: true,
        features: [
            '15,000 Banks statement transactions import/year',
            'Advanced analytics & insights',
            'Priority email support',
            'Tax optimization tools',
            'Mobile App Access',
        ],
    },
    business_pro: {
        id: 'business_pro',
        name: 'Business Pro',
        price: 5000,
        description: 'For growing businesses',
        icon: Crown,
        popular: true,
        features: [
            'Unlimited Invoice/Receipt Upload',
            'Advanced analytics & insights',
            'Custom branding & logo',
            'AI Bank Statement Hunter',
            'NTA-Compliant Payroll',
        ],
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 0,
        priceDisplay: 'Contact Sales',
        description: 'For large organizations',
        icon: Building,
        features: [
            'Everything in Business Pro',
            'Multi-user access (up to 10)',
            'Dedicated account manager',
            'API access & webhooks',
            'SLA guarantee',
        ],
    },
};

export default async function SubscriptionPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const sessionUser = await validateSession(token!);

    if (!sessionUser) return null;

    // Fetch user details (for accountType) and current subscription
    const [user, subscription] = await Promise.all([
        db.user.findUnique({ where: { id: sessionUser.id } }),
        db.subscription.findFirst({
            where: { userId: sessionUser.id },
            orderBy: { createdAt: 'desc' },
        })
    ]);

    if (!user) return null;

    let currentPlanId = subscription?.planType;
    const accountType = user.accountType || 'personal'; // Default to personal if null

    if (!currentPlanId) {
        const tier = user.subscriptionTier?.toLowerCase();
        if (tier === 'pro') {
            // Map legacy 'pro' to new split tiers based on account type
            currentPlanId = accountType === 'personal' ? 'personal_pro' : 'business_pro';
        } else if (tier === 'enterprise') {
            currentPlanId = 'enterprise';
        } else {
            currentPlanId = 'free';
        }
    } else {
        // Handle case where db might still have old 'pro' value in Subscription table
        if (currentPlanId === 'pro') {
            currentPlanId = accountType === 'personal' ? 'personal_pro' : 'business_pro';
        }
    }

    // Filter available plans based on account type
    // free user --> if personal --> personal pro only
    // free user --> if business --> Business pro --> Enterprise
    // logic: Always show Free + relevant upsells.

    const availablePlans = [PLANS_DATA.free];

    if (accountType === 'personal') {
        availablePlans.push(PLANS_DATA.personal_pro);
    } else {
        // Business or other
        availablePlans.push(PLANS_DATA.business_pro);
        availablePlans.push(PLANS_DATA.enterprise);
    }

    // Helper to format price
    const formatPrice = (plan: typeof PLANS_DATA.free) => {
        if ('priceDisplay' in plan && plan.priceDisplay) return plan.priceDisplay;
        return plan.price === 0 ? 'Free' : `₦${plan.price.toLocaleString()}`;
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your plan and billing</p>
            </div>

            {/* Current Plan Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm">Current Plan</p>
                        <p className="text-2xl font-bold capitalize">
                            {/* Map ID to Name if possible, or use ID */}
                            {Object.values(PLANS_DATA).find(p => p.id === currentPlanId)?.name || currentPlanId?.replace('_', ' ')}
                        </p>
                        {subscription?.end_date && (
                            <p className="text-blue-100 text-sm mt-1">
                                Renews {new Date(subscription.end_date).toLocaleDateString()}
                            </p>
                        )}
                        {!subscription && (
                            <p className="text-blue-100 text-sm mt-1">
                                Free Plan
                            </p>
                        )}
                    </div>
                    {currentPlanId !== 'enterprise' && currentPlanId !== 'business_pro' && currentPlanId !== 'personal_pro' && (
                        <Link
                            href="#upgrade"
                            className="px-6 py-2.5 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition"
                        >
                            Upgrade Plan
                        </Link>
                    )}
                </div>
            </div>

            {/* Plan Cards */}
            <div id="upgrade" className={`grid grid-cols-1 md:grid-cols-${availablePlans.length} gap-6 mb-8`}>
                {availablePlans.map((plan) => {
                    const isCurrentPlan = currentPlanId === plan.id;
                    const Icon = plan.icon;

                    return (
                        <div
                            key={plan.id}
                            className={`relative bg-white dark:bg-slate-800 rounded-2xl border-2 p-6 flex flex-col ${plan.popular
                                ? 'border-blue-500 shadow-lg'
                                : isCurrentPlan
                                    ? 'border-green-500'
                                    : 'border-gray-200 dark:border-slate-700'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                                    Most Popular
                                </div>
                            )}
                            {isCurrentPlan && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                                    Current Plan
                                </div>
                            )}

                            <div className="flex items-center gap-3 mb-4">
                                <div className={`p-2 rounded-lg ${plan.popular ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{plan.description}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="text-3xl font-black text-gray-900 dark:text-white">
                                    {formatPrice(plan)}
                                </span>
                                {plan.price > 0 && <span className="text-gray-500 dark:text-gray-400">/month</span>}
                            </div>

                            <ul className="space-y-3 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <Check size={16} className="text-green-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href={isCurrentPlan ? '#' : (plan.id === 'enterprise' ? '/contact' : `/billing/upgrade?plan=${plan.id}`)}
                                className={`w-full py-2.5 rounded-xl font-medium transition text-center block ${isCurrentPlan
                                    ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Billing History */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Billing History</h3>
                </div>
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                    <p>No billing history available</p>
                    <p className="text-sm mt-1">Your payment history will appear here</p>
                </div>
            </div>
        </div>
    );
}
