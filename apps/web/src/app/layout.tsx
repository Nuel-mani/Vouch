import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Merriweather } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@vouch/ui';

import { CryptoPolyfill } from '@/components/CryptoPolyfill';

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const merriweather = Merriweather({ subsets: ['latin'], weight: ['300', '400', '700', '900'], variable: '--font-merriweather' });

export const metadata: Metadata = {
    title: 'Vouch | The Trust OS for Nigerian Business',
    description: 'The offline-first bookkeeping platform built for Nigerian MSMEs. Finance Act 2024 & NTA 2025 compliant.',
    keywords: ['Nigerian tax software', 'bookkeeping', 'SME', 'finance act 2024', 'offline accounting', 'Vouch'],
    authors: [{ name: 'Vouch Technologies' }],
    openGraph: {
        title: 'Vouch | The Trust OS for Nigerian Business',
        description: 'Verifiable integrity for your business operations.',
        type: 'website',
        locale: 'en_NG',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${jakarta.variable} ${merriweather.variable} font-sans`} suppressHydrationWarning>
                <ThemeProvider defaultTheme="system" storageKey="opcore-theme">
                    <CryptoPolyfill />
                    {children}
                    <Toaster richColors position="top-right" />
                </ThemeProvider>
            </body>
        </html>
    );
}
