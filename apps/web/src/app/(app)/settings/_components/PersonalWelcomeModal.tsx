'use client';

import React, { useState } from 'react';
import { User, Shield, ArrowRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalWelcomeModalProps {
    initiallyOpen: boolean;
    onClose?: () => void;
    user: any;
}

export function PersonalWelcomeModal({ initiallyOpen, onClose, user }: PersonalWelcomeModalProps) {
    const [isOpen, setIsOpen] = useState(initiallyOpen);

    // If not open, don't render (or maybe render null to be safe)
    if (!isOpen) return null;

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[var(--border)]"
                >
                    {/* Header Graphic */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl transform rotate-3">
                            <User className="text-white" size={32} />
                        </div>
                    </div>

                    <div className="p-8 space-y-6">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">Welcome to your Personal Workspace</h2>
                            <p className="text-[var(--muted-foreground)]">
                                You are now in your <strong>separate personal account</strong>. This space is strictly for your personal finances, distinct from <span className="text-[var(--primary)] font-medium">{user.businessName}</span>.
                            </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20 flex gap-4 text-left">
                            <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg shrink-0 h-fit">
                                <Shield className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">Identity Verification Required</h4>
                                <p className="text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed">
                                    To ensure compliance with NTA 2025, please verify your Personal Profile (Vouch ID). This data is never shared without your permission.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleClose}
                                className="w-full py-3.5 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[var(--primary)]/20"
                            >
                                Review My Profile
                                <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full py-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] text-sm font-medium transition-colors"
                            >
                                I'll do this later
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
