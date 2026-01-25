'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { updateSettings } from '../actions';

interface SettingsFormProps {
    children: React.ReactNode;
}

export function SettingsForm({ children }: SettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setMessage(null);

        try {
            const result = await updateSettings(formData);
            if (result.success) {
                setMessage({ type: 'success', text: 'Settings saved successfully!' });
            } else {
                setMessage({ type: 'error', text: result.error || 'Failed to save settings' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-4 rounded-xl text-sm ${message.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.text}
                </div>
            )}
            {children}
            <div className="flex justify-end">
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
            </div>
        </form>
    );
}
