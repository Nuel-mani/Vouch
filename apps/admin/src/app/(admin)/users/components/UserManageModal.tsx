'use client';

import { useState } from 'react';
import { X, Loader2, User, Crown, ShieldCheck, Trash2, Ban } from 'lucide-react';
import { updateUserRole, updateSubscriptionTier, suspendUser, deleteUser } from '../actions';
import { impersonateUser } from '../../../actions/impersonate';

interface UserManageModalProps {
    user: {
        id: string;
        email: string;
        businessName: string | null;
        role: string;
        subscriptionTier: string;
    };
    onClose: () => void;
}

export function UserManageModal({ user, onClose }: UserManageModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [selectedTier, setSelectedTier] = useState(user.subscriptionTier);

    const handleUpdateRole = async () => {
        if (selectedRole === user.role) return;

        setLoading(true);
        const result = await updateUserRole(user.id, selectedRole as 'user' | 'staff' | 'admin');
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
    };

    const handleUpdateTier = async () => {
        if (selectedTier === user.subscriptionTier) return;

        setLoading(true);
        const result = await updateSubscriptionTier(user.id, selectedTier);
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
    };

    const handleSuspend = async () => {
        if (!confirm('Are you sure you want to suspend this user?')) return;

        setLoading(true);
        const result = await suspendUser(user.id);
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to PERMANENTLY DELETE ${user.email}? This cannot be undone.`)) return;

        setLoading(true);
        const result = await deleteUser(user.id);
        setLoading(false);

        if (result.success) {
            onClose();
        } else {
            alert(result.error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 m-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Manage User</h2>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* User Info */}
                <div className="bg-slate-900 rounded-xl p-4 mb-6">
                    <p className="font-medium text-white">{user.businessName || 'No Business Name'}</p>
                    <p className="text-sm text-slate-400">{user.email}</p>
                </div>

                {/* Role Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">User Role</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['user', 'staff', 'admin'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setSelectedRole(role)}
                                className={`p-3 rounded-xl border text-center transition ${selectedRole === role
                                    ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                                    : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                    }`}
                            >
                                {role === 'admin' && <Crown size={16} className="mx-auto mb-1" />}
                                {role === 'staff' && <ShieldCheck size={16} className="mx-auto mb-1" />}
                                {role === 'user' && <User size={16} className="mx-auto mb-1" />}
                                <span className="text-xs capitalize">{role}</span>
                            </button>
                        ))}
                    </div>
                    {selectedRole !== user.role && (
                        <button
                            onClick={handleUpdateRole}
                            disabled={loading}
                            className="w-full mt-2 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Update Role'}
                        </button>
                    )}
                </div>

                {/* Subscription Tier */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">Subscription Tier</label>
                    <select
                        value={selectedTier}
                        onChange={(e) => setSelectedTier(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                    </select>
                    {selectedTier !== user.subscriptionTier && (
                        <button
                            onClick={handleUpdateTier}
                            disabled={loading}
                            className="w-full mt-2 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Update Tier'}
                        </button>
                    )}
                </div>

                {/* Impersonation Section */}
                <div className="mb-6 border-t border-slate-700 pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-300">Support Access</span>
                        <ImpersonateButton userId={user.id} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Log in as this user to troubleshoot issues. This action is audited.
                    </p>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-slate-700 pt-4">
                    <p className="text-sm text-slate-500 mb-3">Danger Zone</p>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSuspend}
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Ban size={14} />
                            Suspend
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex-1 py-2 px-4 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Impersonate Button Component
function ImpersonateButton({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(false);

    const handleImpersonate = async () => {
        if (!confirm('Are you sure you want to log in as this user?')) return;

        setLoading(true);
        try {
            const result = await impersonateUser(userId);
            if (result.success && result.url) {
                // Open in new tab
                window.open(result.url, '_blank');
            } else {
                alert(result.error || 'Impersonation failed');
            }
        } catch (error) {
            console.error('Impersonation error:', error);
            alert('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleImpersonate}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition disabled:opacity-50"
        >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <ShieldCheck size={12} />}
            Login as User
        </button>
    );
}

interface ManageButtonProps {
    user: {
        id: string;
        email: string;
        businessName: string | null;
        role: string;
        subscriptionTier: string;
    };
}

export function ManageUserButton({ user }: ManageButtonProps) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="text-blue-400 hover:text-blue-300 font-medium"
            >
                Manage
            </button>
            {showModal && (
                <UserManageModal user={user} onClose={() => setShowModal(false)} />
            )}
        </>
    );
}
