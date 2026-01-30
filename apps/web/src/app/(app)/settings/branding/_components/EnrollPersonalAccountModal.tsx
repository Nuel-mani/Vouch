'use client';

import React, { useState } from 'react';
import { X, Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { createPersonalAccount, switchAccount } from '../../../../_actions/account';
import { motion, AnimatePresence } from 'framer-motion';

interface EnrollPersonalAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EnrollPersonalAccountModal({ isOpen, onClose }: EnrollPersonalAccountModalProps) {
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (pin.length !== 8) {
            setError('PIN must be exactly 8 digits');
            return;
        }

        if (pin !== confirmPin) {
            setError('PINs do not match');
            return;
        }

        setLoading(true);

        try {
            // 1. Create the personal account
            const result = await createPersonalAccount(pin);

            if (result.success) {
                // 2. Automatically switch to the new personal account
                const switchResult = await switchAccount(pin);

                if (switchResult.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        // Redirect to dashboard (which will route to /settings/vouch-id if incomplete)
                        window.location.href = '/dashboard';
                    }, 2000);
                } else {
                    setSuccess(true); // Account created, but switch failed. Fallback to reload.
                    setError('Account created, but failed to switch automatically. Please switch manually.');
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                }
            } else {
                setError(result.error || 'Failed to enroll account');
                setLoading(false);
            }
        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={loading || success ? undefined : onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
                    >
                        {success ? (
                            <div className="p-8 text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
                                >
                                    <CheckCircle size={32} />
                                </motion.div>
                                <h2 className="text-2xl font-bold">
                                    {(success as any).recovered ? 'Account Recovered!' : 'Account Created!'}
                                </h2>
                                <p className="text-[var(--muted-foreground)]">Switching to your personal workspace...</p>
                                <div className="pt-4">
                                    <Loader2 className="animate-spin mx-auto text-[var(--muted-foreground)]" />
                                    <span className="text-xs text-[var(--muted-foreground)]">Redirecting...</span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <Lock className="text-blue-600" size={24} />
                                        Setup Account PIN
                                    </h2>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-sm text-[var(--muted-foreground)]">
                                        Create an 8-digit PIN to securely switch between your Business and Personal accounts.
                                    </p>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Enter 8-digit PIN</label>
                                            <input
                                                type={showPin ? "text" : "password"}
                                                value={pin}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                                    setPin(val);
                                                }}
                                                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg tracking-widest text-center"
                                                placeholder="00000000"
                                                inputMode="numeric"
                                                pattern="\d{8}"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Confirm PIN</label>
                                            <input
                                                type={showPin ? "text" : "password"}
                                                value={confirmPin}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                                    setConfirmPin(val);
                                                }}
                                                className="w-full px-4 py-2 rounded-lg border border-[var(--border)] focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg tracking-widest text-center"
                                                placeholder="00000000"
                                                inputMode="numeric"
                                                pattern="\d{8}"
                                            />
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => setShowPin(!showPin)}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                {showPin ? "Hide PIN" : "Show PIN"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || pin.length !== 8 || pin !== confirmPin}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Create Personal Account'}
                                </button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
