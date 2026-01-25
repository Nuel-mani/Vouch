'use client';

import {
    FileText,
    Share2,
    Download,
    CreditCard,
    Briefcase,
    Calendar,
    LayoutDashboard,
    TrendingUp
} from 'lucide-react';
import Image from 'next/image';

interface LivePreviewProps {
    brandColor: string;
    invoiceTemplate: string;
    invoiceFont: string;
    logoUrl?: string | null;
    stampUrl?: string | null;
    showWatermark: boolean;
    businessName: string;
    businessAddress: string;
    phoneNumber: string;
    taxIdentityNumber: string;
}

export function LivePreview({
    brandColor,
    invoiceTemplate,
    invoiceFont,
    logoUrl,
    stampUrl,
    showWatermark,
    businessName,
    businessAddress,
    phoneNumber,
    taxIdentityNumber
}: LivePreviewProps) {

    // Helper to get font family class
    const getFontClass = () => {
        switch (invoiceFont) {
            case 'roboto': return 'font-mono'; // Using mono as proxy for Roboto in Tailwind
            case 'lato': return 'font-serif';  // Using serif as proxy for Lato
            default: return 'font-sans';       // Inter (Default)
        }
    };

    return (
        <div className="w-full h-full p-8 bg-[var(--muted)] overflow-y-auto flex flex-col items-center gap-8">

            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-lg font-bold text-[var(--foreground)]">Live Preview</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Compare Client View vs. Your Dashboard</p>
            </div>

            {/* 1. Dashboard Card Preview */}
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-[var(--border)] p-6 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: brandColor }} />

                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg text-white" style={{ background: brandColor }}>
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="font-semibold text-[var(--foreground)]">Monthly Revenue</h3>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-2xl font-black text-[var(--foreground)]">₦2,540,500.00</p>
                    <p className="text-sm font-medium" style={{ color: brandColor }}>+12.5% from last month</p>
                </div>
            </div>

            {/* 2. Invoice Preview (Paper) */}
            <div className={`w-full max-w-md bg-white shadow-xl rounded-sm min-h-[500px] relative text-[10px] leading-tight text-gray-800 p-8 ${getFontClass()} transition-all duration-300`}>

                {/* Watermark Overlay */}
                {showWatermark && (
                    <div className="absolute inset-0 z-10 opacity-10 pointer-events-none flex items-center justify-center">
                        <span className="text-6xl font-black -rotate-45 uppercase border-4 border-current px-8 py-4 rounded-xl">
                            DRAFT
                        </span>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="h-10 w-auto object-contain mb-2" />
                        ) : (
                            <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center text-xs font-bold text-gray-400 mb-2">
                                LOGO
                            </div>
                        )}
                        <h1 className="text-xl font-bold mb-1" style={{ color: invoiceTemplate === 'bold' ? brandColor : 'inherit' }}>
                            INVOICE
                        </h1>
                        <p className="text-gray-500">#INV-2025-001</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold">{businessName || 'Your Business Name'}</p>
                        <p className="text-gray-500 whitespace-pre-line">{businessAddress || '123 Business Road\nLagos, Nigeria'}</p>
                        <p className="text-gray-500 mt-1">{phoneNumber || '+234 800 000 0000'}</p>
                        <p className="text-gray-500 text-[9px] mt-1">TIN: {taxIdentityNumber || '12345678-0001'}</p>
                    </div>
                </div>

                {/* Bill To */}
                <div className="mb-8 p-4 rounded bg-[var(--muted)]/50 border border-[var(--border)]">
                    <p className="text-gray-500 uppercase tracking-widest text-[8px] mb-1 font-bold">Bill To</p>
                    <p className="font-bold text-xs">Acme Corp Ltd</p>
                    <p className="text-gray-500">reception@acmecorp.com</p>
                </div>

                {/* Line Items */}
                <table className="w-full mb-8">
                    <thead className="border-b-2 border-gray-100">
                        <tr>
                            <th className="text-left py-2 font-bold text-gray-500">Description</th>
                            <th className="text-right py-2 font-bold text-gray-500">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        <tr>
                            <td className="py-2">Professional Services - Jan Retainer</td>
                            <td className="text-right py-2 font-medium">₦500,000.00</td>
                        </tr>
                        <tr>
                            <td className="py-2">Web Hosting (Annual)</td>
                            <td className="text-right py-2 font-medium">₦120,000.00</td>
                        </tr>
                    </tbody>
                </table>

                {/* Footer / Stamp */}
                <div className="flex justify-between items-end mt-auto pt-8 border-t border-gray-100">
                    <div className="w-1/2">
                        <p className="font-bold" style={{ color: brandColor }}>Payment Instructions</p>
                        <p className="text-gray-500 mt-1">Bank: GTBank</p>
                        <p className="text-gray-500">Account: 0123456789</p>
                    </div>
                    <div className="text-right relative">
                        {stampUrl && (
                            <img
                                src={stampUrl}
                                alt="Stamp"
                                className="absolute -top-12 -right-4 w-24 h-24 object-contain opacity-90 mix-blend-multiply pointer-events-none transform rotate-[-12deg]"
                            />
                        )}
                        <p className="text-gray-400 text-[8px] uppercase tracking-widest mb-4">Authorized Signature</p>
                        <div className="w-32 border-b border-gray-300 ml-auto"></div>
                    </div>
                </div>

                {/* Accent Bar (Modern Template) */}
                {invoiceTemplate === 'modern' && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: brandColor }} />
                )}

                {/* Header Bar (Bold Template) */}
                {invoiceTemplate === 'bold' && (
                    <div className="absolute top-0 left-0 right-0 h-2" style={{ background: brandColor }} />
                )}

            </div>

        </div>
    );
}
