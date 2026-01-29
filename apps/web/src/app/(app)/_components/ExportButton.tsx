'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface ExportButtonProps {
    model: 'transaction' | 'invoice';
    filters: any;
    exportAction: (filters: any) => Promise<{ success: boolean; data?: string; filename?: string; error?: string }>;
}

export function ExportButton({ model, filters, exportAction }: ExportButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const result = await exportAction(filters);

            if (result.success && result.data && result.filename) {
                // Create a blob and download it
                const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', result.filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                console.error('Export failed:', result.error);
                alert('Failed to export data. Please try again.');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('An unexpected error occurred during export.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {loading ? 'Exporting...' : 'Export'}
        </button>
    );
}
