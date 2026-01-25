'use client';

import { useState, useRef } from 'react';
import { Upload, CheckCircle, Clock, XCircle, Loader2, Camera, ShieldCheck, X, AlertCircle, AlertTriangle } from 'lucide-react';
import { submitComplianceDocument } from './_complianceActions';
import { toast } from 'sonner';

interface ComplianceRequest {
    id: string;
    requestType: string;
    status: string;
    documentName: string | null;
    createdAt: Date;
    adminNotes: string | null;
}

interface ComplianceUploadProps {
    existingRequests: ComplianceRequest[];
    accountType: 'personal' | 'business';
    isSuspended?: boolean;
    rejectionCount?: number;
}

// Document types for ID verification
const VERIFICATION_TYPES = {
    personal: [
        { value: 'nin_verification', label: 'NIN Verification', description: 'Upload NIN slip or National ID card', icon: '🆔' },
        { value: 'bvn_verification', label: 'BVN Verification', description: 'Upload bank statement showing BVN', icon: '🏦' },
    ],
    business: [
        { value: 'cac_verification', label: 'CAC Certificate', description: 'Upload CAC registration certificate', icon: '📜' },
        { value: 'tin_verification', label: 'TIN Verification', description: 'Upload Tax ID certificate', icon: '🧾' },
        { value: 'director_id', label: 'Director ID', description: 'Upload director/owner identification', icon: '🆔' },
    ],
};

const STATUS_CONFIG = {
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Under Review' },
    approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Verified' },
    rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected' },
};

export function ComplianceUpload({ existingRequests, accountType, isSuspended = false, rejectionCount = 0 }: ComplianceUploadProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const verificationTypes = VERIFICATION_TYPES[accountType] || VERIFICATION_TYPES.personal;
    const submittedTypes = existingRequests.map(r => r.requestType);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File too large. Max 5MB allowed.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!selectedType) {
            toast.error('Please select what you want to verify');
            return;
        }
        if (!imagePreview) {
            toast.error('Please upload an image of your document');
            return;
        }

        setLoading(true);
        try {
            const result = await submitComplianceDocument(selectedType, imagePreview);
            if (result.success) {
                toast.success('Document submitted for verification!');
                setIsOpen(false);
                setSelectedType('');
                setImagePreview(null);
            } else {
                toast.error(result.error || 'Failed to submit');
            }
        } catch (e) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const clearImage = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center gap-2">
                        <ShieldCheck size={20} className="text-[var(--primary)]" />
                        Identity Verification
                    </h2>
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Upload documents to verify your profile information
                    </p>
                </div>
                {/* Only allow upload if NOT suspended, OR allow upload to fix suspension? usually allow to fix */}
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition text-sm font-medium"
                >
                    <Upload size={16} />
                    Verify Document
                </button>
            </div>

            {/* Suspension Alert */}
            {isSuspended && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-red-500 text-white rounded-full mt-1">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-red-600 dark:text-red-400">Account Restricted</h3>
                            <p className="text-sm text-[var(--foreground)] mt-1">
                                Your account has been suspended due to <strong>{rejectionCount} failed verification attempts</strong>.
                                You can only access this page until a valid document is approved.
                            </p>
                            <p className="text-sm font-medium text-red-600 dark:text-red-400 mt-2">
                                Please upload a valid, clear ID document to restore full access.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Status Cards */}
            {existingRequests.length > 0 ? (
                <div className="grid gap-3">
                    {existingRequests.map((req) => {
                        const statusConfig = STATUS_CONFIG[req.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                        const StatusIcon = statusConfig.icon;
                        const typeInfo = [...VERIFICATION_TYPES.personal, ...VERIFICATION_TYPES.business].find(t => t.value === req.requestType);

                        return (
                            <div
                                key={req.id}
                                className={`flex flex-col p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)] gap-2 ${req.status === 'rejected' ? 'border-red-500/30 bg-red-500/5' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{typeInfo?.icon || '📄'}</div>
                                        <div>
                                            <p className="font-medium text-[var(--foreground)]">{typeInfo?.label || req.requestType}</p>
                                            <p className="text-xs text-[var(--muted-foreground)]">
                                                Submitted {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                                        <StatusIcon size={14} />
                                        {statusConfig.label}
                                    </div>
                                </div>

                                {req.status === 'rejected' && req.adminNotes && (
                                    <div className="mt-2 text-sm text-[var(--foreground)] bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                                        <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <span className="font-semibold text-red-600 dark:text-red-400">Rejection Reason: </span>
                                            {req.adminNotes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-8 text-center bg-[var(--muted)] rounded-xl border border-dashed border-[var(--border)]">
                    <ShieldCheck size={40} className="mx-auto mb-3 text-[var(--muted-foreground)]" />
                    <p className="font-medium text-[var(--foreground)]">No verified documents yet</p>
                    <p className="text-sm text-[var(--muted-foreground)] mt-1">
                        Upload ID documents to verify your {accountType === 'business' ? 'business information' : 'identity'}
                    </p>
                </div>
            )}

            {/* Upload Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[var(--foreground)]">Upload Verification Document</h3>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[var(--muted)] rounded-lg">
                                <X size={20} className="text-[var(--muted-foreground)]" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Step 1: Select Type */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                    What do you want to verify?
                                </label>
                                <div className="grid gap-2">
                                    {verificationTypes.map((type) => {
                                        // Allow re-submitting rejected types
                                        const isPending = existingRequests.some(r => r.requestType === type.value && r.status === 'pending');
                                        const isApproved = existingRequests.some(r => r.requestType === type.value && r.status === 'approved');
                                        const isDisabled = isPending || isApproved;

                                        return (
                                            <button
                                                key={type.value}
                                                type="button"
                                                disabled={isDisabled}
                                                onClick={() => setSelectedType(type.value)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition
                                                    ${selectedType === type.value
                                                        ? 'border-[var(--primary)] bg-[var(--primary)]/5'
                                                        : 'border-[var(--border)] hover:bg-[var(--muted)]'}
                                                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <span className="text-xl">{type.icon}</span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-[var(--foreground)] text-sm">{type.label}</p>
                                                    <p className="text-xs text-[var(--muted-foreground)]">{type.description}</p>
                                                </div>
                                                {isPending && <span className="text-xs text-amber-500 font-medium">Under Review</span>}
                                                {isApproved && <span className="text-xs text-green-500 font-medium">Verified</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Step 2: Upload Image */}
                            {selectedType && (
                                <div className="animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                                        Upload Document Image
                                    </label>

                                    {!imagePreview ? (
                                        <div
                                            className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center hover:bg-[var(--muted)] transition cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera size={32} className="mx-auto mb-3 text-[var(--muted-foreground)]" />
                                            <p className="font-medium text-[var(--foreground)]">Take a photo or upload</p>
                                            <p className="text-xs text-[var(--muted-foreground)] mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Document preview"
                                                className="w-full h-48 object-cover rounded-xl border border-[var(--border)]"
                                            />
                                            <button
                                                onClick={clearImage}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            {/* Info Box */}
                            <div className="flex gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-600 dark:text-blue-400">
                                    Make sure the document is clearly visible and all information is readable. Our team will verify this against your profile.
                                </p>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-2.5 px-4 bg-[var(--muted)] text-[var(--foreground)] rounded-lg hover:opacity-80 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !selectedType || !imagePreview}
                                    className="flex-1 py-2.5 px-4 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    Submit for Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
