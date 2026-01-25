'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadTransactionReceipt } from '../_actions';
import { useRouter } from 'next/navigation';

interface UploadReceiptModalProps {
    transactionId: string;
    onClose: () => void;
}

export function UploadReceiptModal({ transactionId, onClose }: UploadReceiptModalProps) {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

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
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setFile(file);
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async () => {
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('transactionId', transactionId);

        // Capture optional fields
        const payeeInput = document.getElementById('payeeInput') as HTMLInputElement;
        const authorizedInput = document.getElementById('authorizedInput') as HTMLInputElement;

        if (payeeInput?.value) formData.append('payee', payeeInput.value);
        if (authorizedInput?.value) formData.append('authorizedBy', authorizedInput.value);

        const result = await uploadTransactionReceipt(formData);

        if (result?.success) {
            setSuccess(true);
            router.refresh();
            setTimeout(() => {
                onClose();
            }, 1500); // Close after success animation
        } else {
            alert('Upload failed. Please try again.');
            setUploading(false);
        }
    };

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in-95 duration-300 border border-gray-200 dark:border-slate-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Evidence</h3>
                        <p className="text-sm text-gray-500">Secure this transaction against audits.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle size={32} />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Evidence Secured!</h4>
                            <p className="text-sm text-gray-500 text-center">Your transaction is now audit-proof.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Drag & Drop Zone */}
                            <div
                                className={`
                                    relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer
                                    ${dragActive
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                    }
                                    ${file ? 'border-solid bg-gray-50 dark:bg-slate-800/30' : ''}
                                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => inputRef.current?.click()}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={handleChange}
                                    accept="image/*,.pdf"
                                />

                                {file ? (
                                    <div className="relative w-full flex flex-col items-center">
                                        {preview ? (
                                            <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden shadow-sm">
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 text-gray-400">
                                                <FileText size={32} />
                                            </div>
                                        )}
                                        <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFile(null);
                                                setPreview(null);
                                            }}
                                            className="mt-3 text-xs text-red-500 hover:text-red-600 font-medium z-10"
                                        >
                                            Remove file
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 mb-4 transition-transform duration-300 ${dragActive ? 'scale-110' : ''}`}>
                                            <Upload size={24} />
                                        </div>
                                        <p className="font-medium text-gray-900 dark:text-white mb-1">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            SVG, PNG, JPG or PDF (max. 10MB)
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Data Enrichment Fields */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Payee (Business Name)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Amazon Web Services"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        name="payee"
                                        id="payeeInput"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Authorized Person
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. John Doe"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        name="authorizedBy"
                                        id="authorizedInput"
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!file || uploading}
                                className={`
                                    w-full py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl
                                    ${!file || uploading
                                        ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed shadow-none'
                                        : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5'
                                    }
                                `}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Securing Evidence...
                                    </>
                                ) : (
                                    <>
                                        <ImageIcon size={20} />
                                        Upload Proof
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
