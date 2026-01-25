'use client';

import { useState } from 'react';
import { Check, X, Loader2, Eye, Image as ImageIcon } from 'lucide-react';
import { approveComplianceRequest, rejectComplianceRequest } from '../actions';
import { toast } from 'sonner';

export function ApproveButton({ requestId }: { requestId: string }) {
    const [loading, setLoading] = useState(false);

    const handleApprove = async () => {
        if (!confirm('Approve this compliance request?')) return;

        setLoading(true);
        try {
            const res = await approveComplianceRequest(requestId);
            if (res.success) {
                toast.success('Request approved');
            } else {
                toast.error(res.error || 'Failed to approve');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleApprove}
            disabled={loading}
            className="p-1.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg transition disabled:opacity-50"
            title="Approve"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        </button>
    );
}

export function RejectButton({ requestId }: { requestId: string }) {
    const [loading, setLoading] = useState(false);

    const handleReject = async () => {
        const reason = prompt('Reason for rejection:');
        if (!reason) return;

        setLoading(true);
        try {
            const res = await rejectComplianceRequest(requestId, reason);
            if (res.success) {
                toast.success('Request rejected');
            } else {
                toast.error(res.error || 'Failed to reject');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleReject}
            disabled={loading}
            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition disabled:opacity-50"
            title="Reject"
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
        </button>
    );
}

interface ViewDocumentButtonProps {
    documentUrl: string;
    documentName: string;
    userName: string;
    requestType: string;
}

export function ViewDocumentButton({ documentUrl, documentName, userName, requestType }: ViewDocumentButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Check if it's a base64 image
    const isBase64Image = documentUrl.startsWith('data:image');

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 transition text-sm"
            >
                <ImageIcon size={14} />
                View Image
            </button>

            {/* Image Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div>
                                <h3 className="font-semibold text-white">{requestType}</h3>
                                <p className="text-sm text-slate-400">Submitted by {userName}</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-slate-800 rounded-lg transition"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Image */}
                        <div className="p-4 flex items-center justify-center bg-slate-950 min-h-[400px]">
                            {isBase64Image ? (
                                <img
                                    src={documentUrl}
                                    alt={documentName}
                                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                />
                            ) : (
                                <a
                                    href={documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 underline"
                                >
                                    Open Document in New Tab
                                </a>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-700 flex justify-end gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
