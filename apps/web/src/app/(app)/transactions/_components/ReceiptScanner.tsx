'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ScanResult {
    vendor: string | null;
    amount: number | null;
    date: string;
    category: string;
    description: string | null;
    vatAmount: number | null;
    hasVatNumber: boolean;
    vatNumber?: string | null;
}

interface ReceiptScannerProps {
    onScanComplete: (data: ScanResult) => void;
    onClose: () => void;
}

export function ReceiptScanner({ onScanComplete, onClose }: ReceiptScannerProps) {
    const [scanning, setScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<ScanResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameraActive, setCameraActive] = useState(false);

    const handleFileSelect = async (file: File) => {
        setError(null);
        setPreview(URL.createObjectURL(file));
        setScanning(true);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/receipts/scan', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to scan receipt');
            }

            const data = await response.json();

            if (data.success) {
                setResult(data.data);
            } else {
                throw new Error(data.error || 'Scan failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to scan receipt');
        } finally {
            setScanning(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
            }
        } catch (err) {
            setError('Camera access denied. Please use file upload instead.');
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
                    handleFileSelect(file);
                }
            }, 'image/jpeg', 0.8);
        }

        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
        setCameraActive(false);
    };

    const handleConfirm = () => {
        if (result) {
            onScanComplete(result);
        }
    };

    const reset = () => {
        setPreview(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scan Receipt</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {!preview && !cameraActive && (
                        <div className="space-y-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                                Take a photo or upload an image of your receipt. AI will extract the details automatically.
                            </p>

                            {/* Upload Options */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={startCamera}
                                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                                >
                                    <Camera size={32} className="text-blue-600" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Take Photo</span>
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-xl hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                                >
                                    <Upload size={32} className="text-blue-600" />
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Upload Image</span>
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleInputChange}
                                className="hidden"
                            />
                        </div>
                    )}

                    {cameraActive && (
                        <div className="space-y-4">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full rounded-xl bg-gray-900"
                            />
                            <button
                                onClick={capturePhoto}
                                className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                <Camera size={20} />
                                Capture
                            </button>
                        </div>
                    )}

                    {preview && (
                        <div className="space-y-4">
                            <div className="relative">
                                <img
                                    src={preview}
                                    alt="Receipt preview"
                                    className="w-full rounded-xl max-h-64 object-contain bg-gray-100 dark:bg-slate-700"
                                />
                                {scanning && (
                                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 flex items-center justify-center rounded-xl">
                                        <div className="text-center">
                                            <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-2" />
                                            <p className="text-sm text-gray-600 dark:text-gray-400">Analyzing receipt...</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {result && !scanning && (
                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3 text-green-700 dark:text-green-400">
                                        <CheckCircle size={18} />
                                        <span className="font-medium">Receipt scanned successfully!</span>
                                    </div>
                                    <dl className="text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500 dark:text-gray-400">Vendor</dt>
                                            <dd className="font-medium text-gray-900 dark:text-white">{result.vendor || 'Unknown'}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500 dark:text-gray-400">Amount</dt>
                                            <dd className="font-medium text-gray-900 dark:text-white">
                                                ₦{result.amount?.toLocaleString() || 0}
                                            </dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500 dark:text-gray-400">Date</dt>
                                            <dd className="font-medium text-gray-900 dark:text-white">{result.date}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                                            <dd className="font-medium text-gray-900 dark:text-white">{result.category}</dd>
                                        </div>
                                        {result.hasVatNumber && (
                                            <div className="flex justify-between">
                                                <dt className="text-gray-500 dark:text-gray-400">VAT Number</dt>
                                                <dd className="font-medium text-green-600">{result.vatNumber || 'Found'}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={reset}
                                    className="flex-1 py-2.5 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                                >
                                    Retake
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    disabled={!result}
                                    className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    Use This Data
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

