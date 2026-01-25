'use client';

import { useState } from 'react';
import { X, Loader2, Check, AlertTriangle, Play } from 'lucide-react';
import { updateIntegrationConfig, toggleIntegration, testIntegration } from '../actions';

interface IntegrationConfigModalProps {
    integration: {
        id: string;
        name: string;
        description: string;
        requiredEnvVars: string[];
        isActive: boolean;
    };
    onClose: () => void;
}

export function IntegrationConfigModal({ integration, onClose }: IntegrationConfigModalProps) {
    const [loading, setLoading] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [configValues, setConfigValues] = useState<Record<string, string>>({});

    const handleTest = async () => {
        setLoading(true);
        setTestResult(null);

        const result = await testIntegration(integration.id);
        // Normalize result to always have 'message' property
        setTestResult({
            success: result.success,
            message: 'message' in result ? result.message : ('error' in result ? result.error : 'Unknown result'),
        });
        setLoading(false);
    };

    const handleToggle = async () => {
        setLoading(true);
        const result = await toggleIntegration(integration.id, !integration.isActive);
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
    };

    const handleSaveConfig = async () => {
        setLoading(true);
        const result = await updateIntegrationConfig(integration.id, configValues);
        setLoading(false);

        if (result.success) {
            alert('Configuration saved successfully');
            onClose();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white">{integration.name}</h2>
                        <p className="text-sm text-slate-400">{integration.description}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between p-4 bg-slate-900 rounded-xl mb-6">
                    <span className="text-slate-300">Status</span>
                    <div className="flex items-center gap-3">
                        <span className={`text-sm ${integration.isActive ? 'text-green-400' : 'text-slate-500'}`}>
                            {integration.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                            onClick={handleToggle}
                            disabled={loading}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${integration.isActive
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                }`}
                        >
                            {integration.isActive ? 'Disable' : 'Enable'}
                        </button>
                    </div>
                </div>

                {/* Required Environment Variables */}
                {integration.requiredEnvVars.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-slate-300 mb-3">Required Configuration</h3>
                        <div className="space-y-3">
                            {integration.requiredEnvVars.map((envVar) => (
                                <div key={envVar}>
                                    <label className="block text-xs text-slate-500 mb-1">{envVar}</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={configValues[envVar] || ''}
                                        onChange={(e) => setConfigValues({ ...configValues, [envVar]: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Test Result */}
                {testResult && (
                    <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${testResult.success
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {testResult.success ? <Check size={18} /> : <AlertTriangle size={18} />}
                        <span className="text-sm">{testResult.message}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleTest}
                        disabled={loading}
                        className="flex-1 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        Test Connection
                    </button>
                    {Object.keys(configValues).length > 0 && (
                        <button
                            onClick={handleSaveConfig}
                            disabled={loading}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            Save Configuration
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

interface ConfigureButtonProps {
    integration: {
        id: string;
        name: string;
        description: string;
        requiredEnvVars: string[];
        isActive: boolean;
    };
}

export function ConfigureIntegrationButton({ integration }: ConfigureButtonProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/20 transition"
            >
                Configure
            </button>
            {showModal && (
                <IntegrationConfigModal integration={integration} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}
