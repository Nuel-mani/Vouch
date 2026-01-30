'use client';

import React, { useState } from 'react';
import { X, Lock, Loader2, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { switchAccount } from '../../_actions/account';
import { motion, AnimatePresence } from 'framer-motion';

interface SwitchAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SwitchAccountModal({ isOpen, onClose }: SwitchAccountModalProps) {
    const [pin, setPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await switchAccount(pin);
            if (result.success) {
                // Hard reload to refresh session and user context
                window.location.reload();
            } else {
                setError(result.error || 'Failed to switch account');
                setLoading(false);
                setPin(''); // Clear PIN on error
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={loading ? undefined : onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
                    >
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <ArrowRightLeft className="text-blue-600" size={24} />
                                    Switch Account
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
                                    Enter your 8-digit PIN to switch to your other account.
                                </p>

                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={16} />
                                        <input
                                            type={showPin ? "text" : "password"}
                                            value={pin}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                                                setPin(val);
                                                if (val.length === 8) {
                                                    // Optional: auto-submit or focus submit
                                                }
                                            }}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border)] focus:ring-2 focus:ring-blue-500 outline-none font-mono text-lg tracking-widest text-center"
                                            placeholder="Enter PIN"
                                            inputMode="numeric"
                                            pattern="\d{8}"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || pin.length !== 8}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : 'Switch Account'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
