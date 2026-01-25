import { db } from '@vouch/db';
import { Shield, Bell, Globe } from 'lucide-react';
import { ClearLogsButton, ResetStatsButton } from './components/SettingsActions';
import { SettingsForm } from './components/SettingsForm';

export default async function AdminSettingsPage() {
    // Fetch system settings
    const settings = await db.systemSetting.findMany();
    const settingsMap = new Map(settings.map((s) => [s.key, s.value]));

    const settingGroups = [
        {
            title: 'Platform Settings',
            icon: Globe,
            settings: [
                { key: 'platform_name', label: 'Platform Name', type: 'text', default: 'OpCore' },
                { key: 'support_email', label: 'Support Email', type: 'email', default: 'support@opcore.ng' },
                { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle', default: 'false' },
            ],
        },
        {
            title: 'Tax Configuration',
            icon: Shield,
            settings: [
                { key: 'small_company_threshold', label: 'Small Company Threshold (₦)', type: 'number', default: '25000000' },
                { key: 'medium_company_threshold', label: 'Medium Company Threshold (₦)', type: 'number', default: '100000000' },
                { key: 'vat_rate', label: 'VAT Rate (%)', type: 'number', default: '7.5' },
                { key: 'education_tax_rate', label: 'Education Tax Rate (%)', type: 'number', default: '2.5' },
            ],
        },
        {
            title: 'Notifications',
            icon: Bell,
            settings: [
                { key: 'email_notifications_enabled', label: 'Email Notifications', type: 'toggle', default: 'true' },
                { key: 'invoice_reminders', label: 'Invoice Reminders', type: 'toggle', default: 'true' },
                { key: 'tax_deadline_alerts', label: 'Tax Deadline Alerts', type: 'toggle', default: 'true' },
            ],
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 mt-1">Configure platform-wide settings</p>
            </div>

            {/* Settings Form */}
            <SettingsForm>
                {settingGroups.map((group) => (
                    <div key={group.title} className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700 flex items-center gap-3">
                            <div className="p-2 bg-slate-700 rounded-lg text-slate-300">
                                <group.icon size={20} />
                            </div>
                            <h2 className="font-semibold text-white">{group.title}</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            {group.settings.map((setting) => (
                                <div key={setting.key} className="flex items-center justify-between">
                                    <div>
                                        <label className="font-medium text-white">{setting.label}</label>
                                        <p className="text-xs text-slate-500 mt-0.5">Key: {setting.key}</p>
                                    </div>
                                    {setting.type === 'toggle' ? (
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name={setting.key}
                                                defaultChecked={settingsMap.get(setting.key) === 'true' || setting.default === 'true'}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    ) : (
                                        <input
                                            type={setting.type}
                                            name={setting.key}
                                            defaultValue={settingsMap.get(setting.key) || setting.default}
                                            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </SettingsForm>

            {/* Danger Zone */}
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-red-500/30">
                    <h2 className="font-semibold text-red-400">Danger Zone</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">Clear All Audit Logs</p>
                            <p className="text-sm text-slate-400">This action cannot be undone</p>
                        </div>
                        <ClearLogsButton />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-white">Reset Platform Statistics</p>
                            <p className="text-sm text-slate-400">Recalculate all aggregated stats</p>
                        </div>
                        <ResetStatsButton />
                    </div>
                </div>
            </div>
        </div>
    );
}

