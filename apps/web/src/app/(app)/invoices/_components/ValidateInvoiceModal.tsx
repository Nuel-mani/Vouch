'use client';

import { useState, useRef } from 'react';
import { X, Upload, Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ValidateInvoiceModalProps {
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    isOpen: boolean;
    onClose: () => void;
    onValidate: (formData: FormData) => Promise<void>;
}

export function ValidateInvoiceModal({
    invoiceId,
    invoiceNumber,
    amount,
    isOpen,
    onClose,
    onValidate
}: ValidateInvoiceModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [method, setMethod] = useState<'proof' | 'signature' | 'manual'>('proof');
    const [dragActive, setDragActive] = useState(false);
    const [proofFile, setProofFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    if (!isOpen) return null;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setProofFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            formData.append('invoiceId', invoiceId);
            formData.append('validationMethod', method);

            // Append the proof file if we have one from drag and drop
            if (proofFile && method === 'proof') {
                formData.set('proofFile', proofFile);
            }

            await onValidate(formData);
            onClose();
            router.refresh();
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-[var(--border)] shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--foreground)]">Validate Invoice {invoiceNumber}</h2>
                        <p className="text-xs text-[var(--muted-foreground)]">Confirm payment of ₦{amount.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-[var(--muted)] rounded-lg transition-colors"
                    >
                        <X size={20} className="text-[var(--muted-foreground)]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Method Selection */}
                    <div className="grid grid-cols-3 gap-2">
                        {(['proof', 'signature', 'manual'] as const).map((m) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setMethod(m)}
                                className={`
                                    px-2 py-2 text-xs font-medium rounded-lg border transition-all capitalize
                                    ${method === m
                                        ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-transparent hover:bg-[var(--border)]'
                                    }
                                `}
                            >
                                {m === 'manual' ? 'Cash/Other' : m}
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Fields */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                Amount Received
                            </label>
                            <input
                                type="number"
                                name="amountReceived"
                                defaultValue={amount}
                                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                Date Received
                            </label>
                            <input
                                type="date"
                                name="dateReceived"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                required
                            />
                        </div>

                        {method === 'proof' && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                    Upload Payment Proof
                                </label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${proofFile
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                            : dragActive
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                                                : 'border-[var(--border)] hover:bg-[var(--muted)]'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        name="proofFile"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        required={!proofFile}
                                    />
                                    {proofFile ? (
                                        <div className="text-green-700 dark:text-green-400">
                                            <Check className="mx-auto mb-2" size={24} />
                                            <p className="text-sm font-medium">{proofFile.name}</p>
                                            <p className="text-xs opacity-75">{(proofFile.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className={`mx-auto mb-2 transition-transform duration-300 ${dragActive ? 'text-blue-500 scale-110' : 'text-[var(--muted-foreground)]'}`} size={24} />
                                            <p className="text-sm text-[var(--muted-foreground)]">Click to upload or drag and drop</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {method === 'signature' && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                    Signature
                                </label>
                                <input
                                    type="text"
                                    name="signatureName"
                                    placeholder="Type name to sign"
                                    className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                                    required
                                />
                                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                                    By typing your name, you certify this payment was received.
                                </p>
                            </div>
                        )}

                        {method === 'manual' && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                                    Notes
                                </label>
                                <textarea
                                    name="notes"
                                    placeholder="Payment details (Check #, Cash, etc)"
                                    className="w-full px-3 py-2 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] h-20 resize-none"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded-xl text-sm font-medium hover:opacity-80 transition"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-[var(--primary)] text-white rounded-xl text-sm font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Validate Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
