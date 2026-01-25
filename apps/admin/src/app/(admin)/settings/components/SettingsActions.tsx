'use client';

import { useState } from 'react';
import { Save, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { updateSettings, clearAuditLogs, resetPlatformStatistics } from '../actions';

export function SaveSettingsButton() {
    const [loading, setLoading] = useState(false);

    return (
        <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Save size={16} />
            )}
            Save Changes
        </button>
    );
}

export function ClearLogsButton() {
    const [loading, setLoading] = useState(false);

    const handleClear = async () => {
        if (!confirm('Are you sure you want to clear ALL audit logs? This action cannot be undone.')) {
            return;
        }

        setLoading(true);
        try {
            const result = await clearAuditLogs();
            if (result.success) {
                alert(`Successfully deleted ${result.deletedCount} log entries.`);
            } else {
                alert(result.error || 'Failed to clear logs');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClear}
            disabled={loading}
            className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 transition disabled:opacity-50 inline-flex items-center gap-2"
        >
            {loading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                <Trash2 size={14} />
            )}
            Clear Logs
        </button>
    );
}

export function ResetStatsButton() {
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!confirm('Are you sure you want to recalculate all platform statistics?')) {
            return;
        }

        setLoading(true);
        try {
            const result = await resetPlatformStatistics();
            if (result.success) {
                alert('Statistics reset successfully.');
            } else {
                alert(result.error || 'Failed to reset statistics');
            }
        } catch (error) {
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-500/20 transition flex items-center gap-2 disabled:opacity-50"
        >
            {loading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : (
                <RefreshCw size={14} />
            )}
            Reset
        </button>
    );
}
