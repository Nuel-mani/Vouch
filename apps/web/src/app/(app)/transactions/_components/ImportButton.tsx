'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import { ImportStatementModal } from './ImportStatementModal';

interface ImportButtonProps {
    userAccountType: string;
}

export function ImportButton({ userAccountType }: ImportButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition"
            >
                <Upload size={16} />
                Import Statement
            </button>

            {isOpen && (
                <ImportStatementModal
                    userAccountType={userAccountType}
                    onClose={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
