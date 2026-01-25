'use client';

import { useState } from 'react';
import { Mail, Phone, X, Loader2, Key, Calendar } from 'lucide-react';
import { approveRequest, rejectRequest, setTempPassword } from '../actions';
import { toast } from 'sonner';

// --- Pending Request Actions ---
export function RequestActions({ request }: { request: any }) {
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');

    const handleApprove = async (method: 'link' | 'manual') => {
        if (!confirm(method === 'link'
            ? 'Send password reset link to user email?'
            : 'Generate temporary credentials for verbal verification?')) return;

        setStatus('loading');
        try {
            const res = await approveRequest(request.id, method);
            if (res.success) {
                toast.success('Request approved');
                if (method === 'manual' && res.details?.tempPass) {
                    alert(`TEMPORARY PASSWORD: ${res.details.tempPass}\n\nRead this to the user immediately. It will not be shown again.`);
                }
            } else {
                toast.error(res.error || 'Failed');
            }
        } catch (e) {
            toast.error('Error occurred');
        } finally {
            setStatus('idle');
        }
    };

    const handleReject = async () => {
        const reason = prompt('Reason for rejection (internal note):');
        if (!reason) return;

        setStatus('loading');
        try {
            await rejectRequest(request.id, reason);
            toast.success('Request rejected');
        } catch (e) {
            toast.error('Error occurred');
        } finally {
            setStatus('idle');
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={() => handleReject()}
                disabled={status === 'loading'}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                title="Reject Request"
            >
                <X size={18} />
            </button>
            <div className="w-px h-8 bg-slate-700 mx-1" />
            <button
                onClick={() => handleApprove('link')}
                disabled={status === 'loading'}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs font-medium transition"
            >
                {status === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                Send Link
            </button>
            <button
                onClick={() => handleApprove('manual')}
                disabled={status === 'loading'}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-xs font-medium transition"
            >
                <Phone size={14} />
                Manual
            </button>
        </div>
    );
}

// --- Approved Request Actions (Reset Password with Expiry) ---
export function ApprovedRequestActions({ request }: { request: any }) {
    const [status, setStatus] = useState<'idle' | 'loading'>('idle');
    const [showModal, setShowModal] = useState(false);
    const [expiryDays, setExpiryDays] = useState(7);

    const handleSetTempPassword = async () => {
        setStatus('loading');
        try {
            const res = await setTempPassword(request.user.id, request.id, expiryDays);
            if (res.success) {
                toast.success('Temporary password set!');
                alert(`TEMPORARY PASSWORD: ${res.tempPassword}\n\nValid for ${expiryDays} day(s).\n\nProvide this to the user. It will not be shown again.`);
                setShowModal(false);
            } else {
                toast.error(res.error || 'Failed');
            }
        } catch (e) {
            toast.error('Error occurred');
        } finally {
            setStatus('idle');
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/20 rounded-lg text-xs font-medium transition"
            >
                <Key size={14} />
                Set Temp Password
            </button>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4">Set Temporary Password</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            Generate a temporary password for <span className="text-white font-medium">{request.email}</span>.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                <Calendar size={14} className="inline mr-1" />
                                Password Valid For
                            </label>
                            <select
                                value={expiryDays}
                                onChange={(e) => setExpiryDays(Number(e.target.value))}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                            >
                                <option value={1}>1 Day</option>
                                <option value={3}>3 Days</option>
                                <option value={7}>7 Days (Recommended)</option>
                                <option value={14}>14 Days</option>
                                <option value={30}>30 Days</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2 px-4 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSetTempPassword}
                                disabled={status === 'loading'}
                                className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
