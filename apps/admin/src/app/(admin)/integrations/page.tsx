import { db } from '@vouch/db';
import { Check, X, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

// Define available integrations
const availableIntegrations = [
    {
        id: 'paystack',
        name: 'Paystack',
        description: 'Accept payments from customers via card, bank transfer, and USSD',
        category: 'Payments',
        logo: '/integrations/paystack.svg',
        requiredFields: ['PAYSTACK_SECRET_KEY', 'PAYSTACK_PUBLIC_KEY'],
        docsUrl: 'https://paystack.com/docs',
    },
    {
        id: 'resend',
        name: 'Resend',
        description: 'Send transactional emails (invoices, receipts, notifications)',
        category: 'Email',
        logo: '/integrations/resend.svg',
        requiredFields: ['RESEND_API_KEY'],
        docsUrl: 'https://resend.com/docs',
    },
    {
        id: 'cloudflare_r2',
        name: 'Cloudflare R2',
        description: 'S3-compatible object storage for receipts and documents',
        category: 'Storage',
        logo: '/integrations/cloudflare.svg',
        requiredFields: ['S3_ENDPOINT', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET'],
        docsUrl: 'https://developers.cloudflare.com/r2',
    },
    {
        id: 'google_gemini',
        name: 'Google Gemini AI',
        description: 'AI-powered receipt scanning and expense categorization',
        category: 'AI',
        logo: '/integrations/google.svg',
        requiredFields: ['GEMINI_API_KEY'],
        docsUrl: 'https://ai.google.dev/docs',
    },
    {
        id: 'supabase',
        name: 'Supabase',
        description: 'PostgreSQL database hosting and realtime features',
        category: 'Database',
        logo: '/integrations/supabase.svg',
        requiredFields: ['DATABASE_URL'],
        docsUrl: 'https://supabase.com/docs',
    },
    {
        id: 'firs_api',
        name: 'FIRS API',
        description: 'Integration with Federal Inland Revenue Service for tax filings',
        category: 'Government',
        logo: '/integrations/firs.svg',
        requiredFields: ['FIRS_API_KEY', 'FIRS_TIN'],
        docsUrl: 'https://www.firs.gov.ng',
    },
];

export default async function IntegrationsPage() {
    // systemConfig model doesn't exist in schema yet
    // Using empty array as placeholder until model is added
    const configs: { key: string; value: string }[] = [];

    const configMap = new Map(configs.map((c) => [c.key.replace('integration_', ''), c.value]));

    // Check which integrations are configured (simplified check)
    const getIntegrationStatus = (integrationId: string) => {
        const integration = availableIntegrations.find((i) => i.id === integrationId);
        if (!integration) return 'unknown';

        // Check if key exists in config or env
        const hasConfig = configMap.has(integrationId) && configMap.get(integrationId) === 'enabled';
        return hasConfig ? 'connected' : 'not_configured';
    };

    interface IntegrationWithStatus {
        id: string;
        name: string;
        description: string;
        category: string;
        logo: string;
        requiredFields: string[];
        docsUrl: string;
        status: string;
    }

    const categorizedIntegrations = availableIntegrations.reduce((acc, integration) => {
        if (!acc[integration.category]) {
            acc[integration.category] = [];
        }
        acc[integration.category].push({
            ...integration,
            status: getIntegrationStatus(integration.id),
        });
        return acc;
    }, {} as Record<string, IntegrationWithStatus[]>);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Integrations</h1>
                    <p className="text-slate-400 mt-1">Manage third-party service connections</p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition">
                    <RefreshCw size={16} />
                    Refresh Status
                </button>
            </div>

            {/* Integration Categories */}
            {Object.entries(categorizedIntegrations).map(([category, integrations]) => (
                <div key={category}>
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                        {category}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {integrations.map((integration: any) => (
                            <div
                                key={integration.id}
                                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                            {integration.name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white">{integration.name}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${integration.status === 'connected'
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                {integration.status === 'connected' ? 'Connected' : 'Not Configured'}
                                            </span>
                                        </div>
                                    </div>
                                    {integration.status === 'connected' ? (
                                        <Check className="text-green-400" size={20} />
                                    ) : (
                                        <AlertCircle className="text-yellow-400" size={20} />
                                    )}
                                </div>

                                <p className="text-sm text-slate-400 mb-4">{integration.description}</p>

                                <div className="flex items-center justify-between">
                                    <a
                                        href={integration.docsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                    >
                                        Documentation <ExternalLink size={12} />
                                    </a>
                                    <button
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${integration.status === 'connected'
                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                            : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                                            }`}
                                    >
                                        {integration.status === 'connected' ? 'Disconnect' : 'Configure'}
                                    </button>
                                </div>

                                {/* Required Fields Hint */}
                                <details className="mt-4">
                                    <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-400">
                                        Required Environment Variables
                                    </summary>
                                    <ul className="mt-2 space-y-1">
                                        {integration.requiredFields.map((field: string) => (
                                            <li key={field} className="text-xs font-mono text-slate-600 bg-slate-900 px-2 py-1 rounded">
                                                {field}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* API Webhooks Section */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Webhook Endpoints</h2>
                <p className="text-sm text-slate-400 mb-4">
                    These endpoints can be used by external services to send data to OpCore.
                </p>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                        <div>
                            <p className="text-sm font-mono text-slate-300">/api/webhooks/paystack</p>
                            <p className="text-xs text-slate-500">Paystack payment notifications</p>
                        </div>
                        <button className="text-xs text-blue-400 hover:text-blue-300">Copy URL</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                        <div>
                            <p className="text-sm font-mono text-slate-300">/api/webhooks/banking</p>
                            <p className="text-xs text-slate-500">Open Banking transaction sync</p>
                        </div>
                        <button className="text-xs text-blue-400 hover:text-blue-300">Copy URL</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
