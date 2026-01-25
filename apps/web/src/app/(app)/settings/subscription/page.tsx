import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { db } from '@vouch/db';
import { Check, Crown, Zap, Building } from 'lucide-react';
import Link from 'next/link';

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        description: 'For individuals just getting started',
        icon: Zap,
        features: [
            '50 transactions/month',
            'Basic reports',
            'Email support',
            'Standard invoice template',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 5000,
        description: 'For growing businesses',
        icon: Crown,
        popular: true,
        features: [
            'Unlimited transactions',
            'Advanced analytics',
            'Priority support',
            'Custom branding',
            'Tax optimization tools',
            'Receipt scanning',
        ],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 25000,
        description: 'For large organizations',
        icon: Building,
        features: [
            'Everything in Pro',
            'Multi-user access',
            'Dedicated account manager',
            'API access',
            'Custom integrations',
            'SLA guarantee',
        ],
    },
];

export default async function SubscriptionPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) return null;

    // Fetch current subscription
    const subscription = await db.subscription.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });

    const currentPlan = subscription?.planType || 'free';

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
                <p className="text-gray-500 mt-1">Manage your plan and billing</p>
            </div>

            {/* Current Plan Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-sm">Current Plan</p>
                        <p className="text-2xl font-bold capitalize">{currentPlan}</p>
                        {subscription?.currentPeriodEnd && (
                            <p className="text-blue-100 text-sm mt-1">
                                Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    {currentPlan !== 'enterprise' && (
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
            <div id="upgrade" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {plans.map((plan) => {
                    const isCurrentPlan = currentPlan === plan.id;
                    const Icon = plan.icon;

                    return (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-2xl border-2 p-6 ${plan.popular
                                    ? 'border-blue-500 shadow-lg'
                                    : isCurrentPlan
                                        ? 'border-green-500'
                                        : 'border-gray-200'
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
                                <div className={`p-2 rounded-lg ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{plan.name}</h3>
                                    <p className="text-xs text-gray-500">{plan.description}</p>
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="text-3xl font-black text-gray-900">
                                    ₦{plan.price.toLocaleString()}
                                </span>
                                <span className="text-gray-500">/month</span>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                                        <Check size={16} className="text-green-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={isCurrentPlan}
                                className={`w-full py-2.5 rounded-xl font-medium transition ${isCurrentPlan
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : plan.popular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {isCurrentPlan ? 'Current Plan' : plan.price === 0 ? 'Downgrade' : 'Upgrade'}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Billing History</h3>
                </div>
                <div className="p-6 text-center text-gray-500">
                    <p>No billing history available</p>
                    <p className="text-sm mt-1">Your payment history will appear here</p>
                </div>
            </div>
        </div>
    );
}
