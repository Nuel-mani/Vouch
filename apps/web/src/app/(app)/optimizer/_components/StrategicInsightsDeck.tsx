'use client';

import { useState } from 'react';
import { Lightbulb, BookOpen, Quote, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export type Insight = {
    id: string;
    title: string;
    insight: string;
    law?: string | null;
    category: string;
    type: string;
    impact?: string | null;
    isActive: boolean;
};

interface StrategicInsightsDeckProps {
    insights: Insight[];
}

export function StrategicInsightsDeck({ insights }: StrategicInsightsDeckProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!insights || insights.length === 0) return null;

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % insights.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + insights.length) % insights.length);
    };

    const currentInsight = insights[activeIndex];

    // Aesthetic Gradients based on type
    const getGradient = (type: string) => {
        switch (type) {
            case 'warning':
                return 'from-amber-500/10 via-orange-500/5 to-red-500/10 border-amber-500/20';
            case 'success':
                return 'from-emerald-500/10 via-teal-500/5 to-green-500/10 border-emerald-500/20';
            case 'opportunity':
            default:
                return 'from-indigo-500/10 via-purple-500/5 to-blue-500/10 border-indigo-500/20';
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'warning': return 'text-amber-600 dark:text-amber-400';
            case 'success': return 'text-emerald-600 dark:text-emerald-400';
            default: return 'text-indigo-600 dark:text-indigo-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-[var(--foreground)] to-[var(--muted-foreground)] bg-clip-text text-transparent flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Strategic Insights
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Legally backed tax intelligence for your business.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={prevSlide}
                        className="p-2 rounded-full hover:bg-[var(--accent)] border border-[var(--border)] transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="p-2 rounded-full hover:bg-[var(--accent)] border border-[var(--border)] transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Main Featured Card */}
            <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-r ${getGradient(currentInsight.type).split(' ')[0]} blur-3xl opacity-30 rounded-3xl transition-all duration-500`} />

                <div className={`relative overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border rounded-3xl p-8 transition-all duration-500 ${getGradient(currentInsight.type).split(' ').pop()}`}>

                    {/* Category Tag */}
                    <div className="absolute top-6 right-6">
                        <span className="px-3 py-1 text-xs font-medium uppercase tracking-wider rounded-full bg-[var(--background)]/80 backdrop-blur border border-[var(--border)]">
                            {currentInsight.category}
                        </span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Left: Icon & Impact */}
                        <div className="flex-shrink-0 space-y-4">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-[var(--background)] shadow-lg ${getIconColor(currentInsight.type)}`}>
                                <Lightbulb className="w-8 h-8" strokeWidth={1.5} />
                            </div>
                            {currentInsight.impact && (
                                <div className="text-xs font-semibold px-3 py-2 rounded-lg bg-[var(--background)]/50 border border-[var(--border)] inline-block text-[var(--foreground)]">
                                    Impact: {currentInsight.impact}
                                </div>
                            )}
                        </div>

                        {/* Right: Content */}
                        <div className="flex-1 space-y-4">
                            <h3 className="text-2xl font-bold text-[var(--foreground)] leading-tight">
                                {currentInsight.title}
                            </h3>

                            <div className="prose dark:prose-invert">
                                <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
                                    {currentInsight.insight}
                                </p>
                            </div>

                            {currentInsight.law && (
                                <div className="flex items-center gap-2 mt-6 pt-6 border-t border-[var(--border)]/50">
                                    <BookOpen className="w-4 h-4 text-[var(--muted-foreground)]" />
                                    <p className="text-sm font-medium text-[var(--muted-foreground)]">
                                        Backed by: <span className="text-[var(--foreground)] font-mono">{currentInsight.law}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination Indicators */}
            <div className="flex justify-center gap-2 pt-2">
                {insights.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={`transition-all duration-300 rounded-full h-1.5 ${idx === activeIndex
                                ? 'w-8 bg-[var(--primary)]'
                                : 'w-2 bg-[var(--muted-foreground)]/30 hover:bg-[var(--muted-foreground)]/50'
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
