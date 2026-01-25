'use client';

import { useState } from 'react';
import { X, Loader2, Calendar, CreditCard, Ban, Clock } from 'lucide-react';
import {
    updateSubscriptionStatus,
    updateSubscriptionPlan,
    extendSubscription,
    cancelSubscription,
} from '../actions';

interface SubscriptionManageModalProps {
    subscription: {
        id: string;
        planType: string;
        status: string;
        currentPeriodEnd: Date;
        user: {
            email: string;
            businessName: string | null;
        };
    };
    onClose: () => void;
}

export function SubscriptionManageModal({ subscription, onClose }: SubscriptionManageModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(subscription.planType);
    const [selectedStatus, setSelectedStatus] = useState(subscription.status);
    const [extendDays, setExtendDays] = useState(30);

    const handleUpdatePlan = async () => {
        if (selectedPlan === subscription.planType) return;

        setLoading(true);
        const result = await updateSubscriptionPlan(
            subscription.id,
            selectedPlan as 'free' | 'pro' | 'enterprise'
        );
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
    };

    const handleUpdateStatus = async () => {
        if (selectedStatus === subscription.status) return;

        setLoading(true);
        const result = await updateSubscriptionStatus(
            subscription.id,
            selectedStatus as 'active' | 'cancelled' | 'paused' | 'expired'
        );
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
    };

    const handleExtend = async () => {
        if (extendDays <= 0) return;

        setLoading(true);
        const result = await extendSubscription(subscription.id, extendDays);
        setLoading(false);

        if (result.success) {
            alert(`Subscription extended by ${extendDays} days`);
            onClose();
        } else {
            alert(result.error);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel this subscription? The user will be downgraded to free tier.')) {
            return;
        }

        setLoading(true);
        const result = await cancelSubscription(subscription.id);
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Manage Subscription</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                <div className="bg-slate-900 rounded-xl p-4 mb-6">
                    <p className="font-medium text-white">{subscription.user.businessName || 'No Business Name'}</p>
                    <p className="text-sm text-slate-400">{subscription.user.email}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={12} />
                        Expires: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </div>
                </div>

                {/* Plan Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        <CreditCard size={14} className="inline mr-1" />
                        Plan Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['free', 'pro', 'enterprise'].map((plan) => (
                            <button
                                key={plan}
                                onClick={() => setSelectedPlan(plan)}
                                className={`p-3 rounded-xl border text-center transition capitalize ${selectedPlan === plan
                                        ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                {plan}
                            </button>
                        ))}
                    </div>
                    {selectedPlan !== subscription.planType && (
                        <button
                            onClick={handleUpdatePlan}
                            disabled={loading}
                            className="w-full mt-2 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Update Plan'}
                        </button>
                    )}
                </div>

                {/* Status Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                    </select>
                    {selectedStatus !== subscription.status && (
                        <button
                            onClick={handleUpdateStatus}
                            disabled={loading}
                            className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Update Status'}
                        </button>
                    )}
                </div>

                {/* Extend Subscription */}
                <div className="mb-6 p-4 bg-slate-900 rounded-xl">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Clock size={14} className="inline mr-1" />
                        Extend Subscription
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            min="1"
                            value={extendDays}
                            onChange={(e) => setExtendDays(Number(e.target.value))}
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <button
                            onClick={handleExtend}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                        >
                            +{extendDays} days
                        </button>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-slate-700 pt-4">
                    <button
                        onClick={handleCancel}
                        disabled={loading || subscription.status === 'cancelled'}
                        className="w-full py-2 px-4 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Ban size={14} />
                        Cancel Subscription
                    </button>
                </div>
            </div>
        </div>
    );
}

interface ManageSubscriptionButtonProps {
    subscription: {
        id: string;
        planType: string;
        status: string;
        currentPeriodEnd: Date;
        user: {
            email: string;
            businessName: string | null;
        };
    };
}

export function ManageSubscriptionButton({ subscription }: ManageSubscriptionButtonProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
                Manage
            </button>
            {showModal && (
                <SubscriptionManageModal subscription={subscription} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}
