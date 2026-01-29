'use client';

import { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertTriangle, Shield, Wallet } from 'lucide-react';
import { importBankStatement } from '../_actions';
import { ImportPreview } from './ImportPreview'; // We'll create this next
import { useRouter } from 'next/navigation';

interface ImportStatementModalProps {
    onClose: () => void;
    userAccountType: string;
}

export function ImportStatementModal({ onClose, userAccountType }: ImportStatementModalProps) {
    const [step, setStep] = useState<'upload' | 'preview'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [accountType, setAccountType] = useState(userAccountType); // Default to user's main type
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [extractedData, setExtractedData] = useState<any[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Please upload a PDF file.');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a PDF file.');
            }
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('accountType', accountType);

        try {
            const result = await importBankStatement(formData);
            if (result.success && result.data) {
                setExtractedData(result.data);
                setStep('preview');
            } else {
                setError(result.error || 'Failed to parse statement.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (step === 'preview') {
        return (
            <ImportPreview
                transactions={extractedData}
                onCancel={() => setStep('upload')}
                onSave={() => onClose()} // In real app, this would trigger save action
                accountType={accountType}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-[var(--border)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <div>
                        <h2 className="text-xl font-bold text-[var(--foreground)]">Import Bank Statement</h2>
                        <p className="text-sm text-[var(--muted-foreground)]">NTA 2025 Compliance Engine</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors">
                        <X size={20} className="text-[var(--muted-foreground)]" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Account Type Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-[var(--foreground)]">Which account is this for?</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAccountType('personal')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${accountType === 'personal'
                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                                    : 'border-[var(--border)] hover:border-[var(--foreground)]'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`p-1.5 rounded-lg ${accountType === 'personal' ? 'bg-blue-500 text-white' : 'bg-[var(--muted)]'}`}>
                                        <Wallet size={16} />
                                    </div>
                                    <span className="font-semibold">Personal</span>
                                </div>
                                <p className="text-xs text-[var(--muted-foreground)]">Salary, Savings, Gigs</p>
                            </button>

                            <button
                                onClick={() => setAccountType('business')}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${accountType === 'business'
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500'
                                    : 'border-[var(--border)] hover:border-[var(--foreground)]'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <div className={`p-1.5 rounded-lg ${accountType === 'business' ? 'bg-indigo-500 text-white' : 'bg-[var(--muted)]'}`}>
                                        <Shield size={16} />
                                    </div>
                                    <span className="font-semibold">Business</span>
                                </div>
                                <p className="text-xs text-[var(--muted-foreground)]">Corporate, Enterprise</p>
                            </button>
                        </div>
                    </div>

                    {/* File Upload */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${file
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                            : dragActive
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]'
                                : 'border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]'
                            }`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="application/pdf"
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex flex-col items-center gap-2 text-green-700 dark:text-green-400">
                                <CheckCircle size={32} />
                                <p className="font-medium">{file.name}</p>
                                <p className="text-xs opacity-75">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-[var(--muted-foreground)]">
                                <div className={`p-3 rounded-full transition-transform duration-300 ${dragActive ? 'bg-blue-100 dark:bg-blue-900/30 scale-110' : 'bg-[var(--muted)]'}`}>
                                    <Upload size={24} className={dragActive ? 'text-blue-500' : ''} />
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--foreground)]">Click to upload or drag and drop</p>
                                    <p className="text-xs mt-1">PDF files only (Max 5MB)</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Info Alert */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg p-3 flex gap-3">
                        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 dark:text-amber-200/80">
                            <strong>Compliance Check:</strong> We will scan for self-transfers, tax credits (WHT), and deductible bank charges automatically.
                        </div>
                    </div>

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-[var(--border)] bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAnalyze}
                        disabled={!file || loading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin">⏳</span> Analyzing...
                            </>
                        ) : (
                            <>
                                <FileText size={16} />
                                Analyze Statement
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
