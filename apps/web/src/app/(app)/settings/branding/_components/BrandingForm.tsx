'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Image as ImageIcon, FileText, CheckCircle, Loader2, Upload, Building, Calculator, Scan, Stamp, Eye, EyeOff, X, UserCheck, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { updateBrandStudio } from '../../_actions';
import { createPersonalAccount } from '../../../../_actions/account';
import { LivePreview } from './LivePreview';
import { EnrollPersonalAccountModal } from './EnrollPersonalAccountModal';
// @ts-expect-error - colorthief has no types
import ColorThief from 'colorthief';
// removing react-hook-form import 
// Wait, looking at previous code, it wasn't using react-hook-form, it was using controlled state. 
// My failed edit tried to introduce FormProvider. I should revert to the controlled state approach but add the new UI elements.

interface BrandingFormProps {
    user: {
        id: string;
        brandColor: string | null;
        logoUrl: string | null;
        stampUrl: string | null;
        invoiceTemplate: string | null;
        invoiceFont: string | null;
        businessName: string | null;
        businessStructure: string | null;
        businessAddress: string | null;
        phoneNumber: string | null;
        sector: string | null;
        taxIdentityNumber: string | null;
        cacNumber?: string | null;
        nin?: string | null;
        bvn?: string | null;
        totalAssets?: number;
        isProfessionalService?: boolean | null;
        showWatermark?: boolean | null;
        linkedUserId?: string | null;
    };
}

// ... (colorPresets, sectors, businessStructures remain same)
// I will not repeat them to generate small replacement. 
// Ah, replace_file_content needs contiguous block. 
// I will just replace the Props interface and the useState hook.

// Wait, the targeted replace block must be contiguous.
// I'll make two calls or one big one. Props and State are far apart (lines 28 vs 77). 
// I'll use multi_replace.
// Wait, I can't use multi_replace + replace in parallel on same file?
// Documentation says: "Do NOT make multiple parallel calls to this tool or the multi_replace_file_content tool for the same file."
// So I will start with Props and State update using multi_replace.


const colorPresets = [
    '#2252c9', '#059669', '#dc2626', '#7c3aed', '#0891b2', '#ea580c', '#84cc16', '#ec4899', '#f59e0b', '#6366f1'
];

const sectors = [
    'Agriculture', 'Education', 'Finance', 'General', 'General Trade', 'Health',
    'Manufacturing', 'Oil & Gas', 'Professional Services', 'Retail', 'Service', 'Tech',
];

const businessStructures = [
    'Sole Proprietorship',
    'Partnership',
    'Private Limited Company (Ltd)',
    'LLC (Limited Liability Company)',
    'Public Limited Company (PLC)',
    'Incorporated Trustees',
    'Non-Governmental Organization (NGO)',
    'Other'
];

export function BrandingForm({ user }: BrandingFormProps) {
    // State for Real-time Preview
    const [brandColor, setBrandColor] = useState(user.brandColor || '#2252c9');
    const [logoUrl, setLogoUrl] = useState<string | null>(user.logoUrl);
    const [stampUrl, setStampUrl] = useState<string | null>(user.stampUrl);
    const [invoiceTemplate, setInvoiceTemplate] = useState(user.invoiceTemplate || 'modern');
    const [invoiceFont, setInvoiceFont] = useState(user.invoiceFont || 'inter');
    const [showWatermark, setShowWatermark] = useState(user.showWatermark || false);

    // Drag and drop state
    const [logoDragActive, setLogoDragActive] = useState(false);
    const [stampDragActive, setStampDragActive] = useState(false);
    const logoInputRef = React.useRef<HTMLInputElement>(null);
    const stampInputRef = React.useRef<HTMLInputElement>(null);

    // Business Details State (for preview)
    const [businessName, setBusinessName] = useState(user.businessName || '');
    const [businessAddress, setBusinessAddress] = useState(user.businessAddress || '');
    const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || '');
    const [taxId, setTaxId] = useState(user.taxIdentityNumber || '');
    const [cacNumber, setCacNumber] = useState(user.cacNumber || '');
    const [businessStructure, setBusinessStructure] = useState(user.businessStructure || '');
    const [sector, setSector] = useState(user.sector || '');

    // UI Toggles
    // UI Toggles
    const [showDesktopPreview, setShowDesktopPreview] = useState(true);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    // Persist Desktop Preview Preference
    useEffect(() => {
        const saved = window.localStorage.getItem('vouch_show_brand_preview');
        if (saved !== null) {
            setShowDesktopPreview(saved === 'true');
        }
    }, []);

    const toggleDesktopPreview = () => {
        const newState = !showDesktopPreview;
        setShowDesktopPreview(newState);
        window.localStorage.setItem('vouch_show_brand_preview', String(newState));
    };

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [analyzingColor, setAnalyzingColor] = useState(false);

    // Modal Feedback State
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, title: string, messages: string[] }>({ type: null, title: '', messages: [] });

    // Check Eligibility for Dual Account
    const isEligibleForDualAccount =
        (businessStructure === 'Sole Proprietorship' ||
            businessStructure === 'LLC (Limited Liability Company)' ||
            businessStructure === 'Private Limited Company (Ltd)') &&
        !!(user.nin || user.bvn); // Require at least one ID to allow enrollment? Logic said NIN in plan.
    // Let's stick to existing logic or user data.

    // Image Compression Utility
    const compressImage = (file: File, maxWidth = 800): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL(file.type, 0.7)); // Compress to 70% quality
                };
            };
        });
    };

    // Drag handlers and other helpers... (Keeping existing logic)
    const handleLogoDrag = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setLogoDragActive(true);
        else if (e.type === 'dragleave') setLogoDragActive(false);
    };
    const handleLogoDrop = async (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setLogoDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) await processLogoFile(e.dataTransfer.files[0]);
    };
    const handleStampDrag = (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setStampDragActive(true);
        else if (e.type === 'dragleave') setStampDragActive(false);
    };
    const handleStampDrop = async (e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation(); setStampDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) await processStampFile(e.dataTransfer.files[0]);
    };
    const processLogoFile = async (file: File) => {
        try {
            const compressedBase64 = await compressImage(file);
            setLogoUrl(compressedBase64);
            analyzeColor(compressedBase64);
        } catch (err) { console.error("Image compression failed", err); }
    };
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (file) await processLogoFile(file);
    };
    const analyzeColor = (imageUrl: string) => {
        setAnalyzingColor(true);
        const img = new Image(); img.crossOrigin = 'Anonymous'; img.src = imageUrl;
        img.onload = () => {
            try {
                const colorThief = new ColorThief(); const color = colorThief.getColor(img);
                if (color) setBrandColor(rgbToHex(color[0], color[1], color[2]));
            } catch (err) { console.error(err); } finally { setAnalyzingColor(false); }
        };
    };
    const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map(x => {
        const hex = x.toString(16); return hex.length === 1 ? '0' + hex : hex;
    }).join('');
    const processStampFile = async (file: File) => {
        try { const compressedBase64 = await compressImage(file, 400); setStampUrl(compressedBase64); } catch (err) { console.error(err); }
    };
    const handleStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (file) await processStampFile(file);
    };

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        // Append controlled state
        formData.set('brandColor', brandColor);
        formData.set('invoiceTemplate', invoiceTemplate);
        formData.set('invoiceFont', invoiceFont);
        formData.set('showWatermark', String(showWatermark));
        formData.set('businessStructure', businessStructure);
        formData.set('sector', sector);
        formData.set('cacNumber', cacNumber);
        formData.set('logoUrl', logoUrl || '');
        formData.set('stampUrl', stampUrl || '');

        try {
            const result = await updateBrandStudio(formData);

            if (result && result.isComplete) {
                setSuccess(true);
                setFeedback({
                    type: 'success',
                    title: 'Business Profile Complete!',
                    messages: ['Your brand identity and tax profile have been saved.', 'Redirecting to dashboard...']
                });
                setTimeout(() => {
                    // Force a hard reload to ensure ComplianceGuard and Layout state are fresh
                    window.location.href = '/dashboard';
                }, 2500);
            } else if (result && result.missingFields && result.missingFields.length > 0) {
                setFeedback({
                    type: 'error',
                    title: 'Profile Incomplete',
                    messages: result.missingFields
                });
            } else {
                setFeedback({
                    type: 'success',
                    title: 'Changes Saved',
                    messages: ['Your settings have been updated.', 'However, some compliance fields may still be pending.']
                });
                setTimeout(() => setFeedback({ type: null, title: '', messages: [] }), 2500);
            }

        } catch (error) {
            console.error('Error updating brand studio:', error);
            setFeedback({
                type: 'error',
                title: 'Submission Failed',
                messages: ['An error occurred while saving. Please try again.']
            });
        } finally {
            setLoading(false);
        }
    };

    const hasLinkedAccount = !!user.linkedUserId;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] overflow-hidden">

            {/* LEFT PANE: Configuration */}
            <div className={`h-full overflow-y-auto border-r border-[var(--border)] bg-white dark:bg-slate-900 p-6 lg:p-8 transition-all duration-300 ${showDesktopPreview ? 'w-full lg:w-[45%]' : 'w-full lg:max-w-3xl lg:mx-auto lg:border-r-0'}`}>

                <div className="space-y-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-[var(--foreground)]">Brand Studio</h2>
                            <p className="text-[var(--muted-foreground)] text-sm">Customize your business identity.</p>
                        </div>
                        <button
                            type="button"
                            onClick={toggleDesktopPreview}
                            className="hidden lg:flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
                            title={showDesktopPreview ? "Hide Preview" : "Show Preview"}
                        >
                            {showDesktopPreview ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* DUAL ACCOUNT SECTION */}
                    {isEligibleForDualAccount && !hasLinkedAccount && (
                        <div className="p-4 bg-[var(--muted)]/50 rounded-xl border border-[var(--border)] flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div>
                                <h3 className="text-sm font-semibold">Enable Personal Account</h3>
                                <p className="text-xs text-[var(--muted-foreground)]">Separate your personal finances.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowEnrollModal(true)}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                            >
                                Enroll
                            </button>
                        </div>
                    )}

                    {hasLinkedAccount && (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300">
                                <UserCheck size={16} />
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200">Personal Account Linked</h3>
                                <p className="text-xs text-blue-700 dark:text-blue-400">Switch accounts using your PIN.</p>
                            </div>
                        </div>
                    )}
                </div>

                <form action={handleSubmit} className="space-y-10 pb-20">
                    {success && (
                        <div className="bg-green-50 text-green-700 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <CheckCircle size={20} />
                            <span>Brand Identity Saved!</span>
                        </div>
                    )}

                    {/* 1. Identity Assets */}
                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon size={16} /> Identity Assets
                        </h3>
                        {/* ... Logo and Stamp inputs ... */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-medium">Company Logo</label>
                                <div onClick={() => logoInputRef.current?.click()} onDragEnter={handleLogoDrag} onDragLeave={handleLogoDrag} onDragOver={handleLogoDrag} onDrop={handleLogoDrop} className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${logoDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' : 'border-[var(--border)] hover:bg-[var(--muted)]'}`}>
                                    <input type="file" ref={logoInputRef} accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                    {logoUrl ? (
                                        <div className="relative h-20 w-full">
                                            <img src={logoUrl} alt="Logo" className="h-full w-full object-contain" />
                                            {analyzingColor && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 size={20} className="animate-spin text-[var(--primary)]" /></div>}
                                        </div>
                                    ) : (
                                        <div className="py-4"><Upload className={`mx-auto h-8 w-8 mb-2 transition-transform duration-300 ${logoDragActive ? 'text-blue-500 scale-110' : 'text-[var(--muted-foreground)]'}`} /><span className="text-xs text-[var(--muted-foreground)]">Click or drag to upload</span></div>
                                    )}
                                </div>
                                <p className="text-xs text-[var(--muted-foreground)]">Auto-extracts brand color.</p>
                            </div>
                            <div className="space-y-3">
                                <label className="block text-sm font-medium">Digital Stamp / Seal</label>
                                <div onClick={() => stampInputRef.current?.click()} onDragEnter={handleStampDrag} onDragLeave={handleStampDrag} onDragOver={handleStampDrag} onDrop={handleStampDrop} className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${stampDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02]' : 'border-[var(--border)] hover:bg-[var(--muted)]'}`}>
                                    <input type="file" ref={stampInputRef} accept="image/png" onChange={handleStampUpload} className="hidden" />
                                    {stampUrl ? (<div className="relative h-20 w-full"><img src={stampUrl} alt="Stamp" className="h-full w-full object-contain" /></div>) : (<div className="py-4"><Stamp className={`mx-auto h-8 w-8 mb-2 transition-transform duration-300 ${stampDragActive ? 'text-blue-500 scale-110' : 'text-[var(--muted-foreground)]'}`} /><span className="text-xs text-[var(--muted-foreground)]">Click or drag PNG</span></div>)}
                                </div>
                                <p className="text-xs text-[var(--muted-foreground)]">For invoice authorization.</p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-[var(--border)]" />

                    {/* 2. Brand Color */}
                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2"><Palette size={16} /> Brand Color</h3>
                        <div className="flex gap-4 items-center flex-wrap">
                            <div className="relative"><input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-14 h-14 rounded-xl cursor-pointer border-0 p-0 overflow-hidden shadow-sm" /><div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 pointer-events-none" /></div>
                            <div className="flex gap-2 flex-wrap flex-1">{colorPresets.map(c => (<button key={c} type="button" onClick={() => setBrandColor(c)} className={`w-8 h-8 rounded-full border-2 transition-all ${brandColor === c ? 'border-[var(--foreground)] scale-110' : 'border-transparent hover:scale-105'}`} style={{ background: c }} />))}</div>
                        </div>
                    </section>

                    <hr className="border-[var(--border)]" />

                    {/* 3. Business Details */}
                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2"><Building size={16} /> Business Details</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div><label className="block text-sm font-medium mb-1.5">Business Name</label><input name="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="input-field" placeholder="Legal Business Name" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1.5">Phone</label><input name="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="input-field" placeholder="+234..." /></div>
                                <div><label className="block text-sm font-medium mb-1.5">Tax ID / TIN</label><input name="taxIdentityNumber" value={taxId} onChange={(e) => setTaxId(e.target.value)} className="input-field" placeholder="TIN Number" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium mb-1.5">CAC Number</label><input name="cacNumber" value={cacNumber} onChange={(e) => setCacNumber(e.target.value)} className="input-field" placeholder="RC or BN Number" /></div>
                                <div><label className="block text-sm font-medium mb-1.5">Structure</label><select name="businessStructure" value={businessStructure} onChange={(e) => setBusinessStructure(e.target.value)} className="input-field"><option value="">Select Structure</option>{businessStructures.map(s => (<option key={s} value={s}>{s}</option>))}</select></div>
                            </div>
                            <div><label className="block text-sm font-medium mb-1.5">Sector</label><select name="sector" value={sector} onChange={(e) => setSector(e.target.value)} className="input-field"><option value="">Select Sector</option>{sectors.map(s => (<option key={s} value={s}>{s}</option>))}</select></div>
                            <div><label className="block text-sm font-medium mb-1.5">Address</label><textarea name="businessAddress" rows={2} value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} className="input-field resize-none" placeholder="Full Registered Address" /></div>
                        </div>

                        {/* NTA 2025 Compliance Fields */}
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl space-y-4">
                            <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2"><Calculator size={16} /> NTA 2025 Tax Compliance</h4>
                            {/* Personal ID (Only for Individuals/Partnerships) */}
                            {['Sole Proprietorship', 'Partnership', 'LLC (Limited Liability Company)', 'Private Limited Company (Ltd)'].includes(businessStructure) && (
                                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div><label className="block text-sm font-medium mb-1.5">Director/Owner NIN <span className="text-xs text-[var(--muted-foreground)]">(National ID)</span></label><input name="nin" type="text" defaultValue={(user as any).nin || ''} className="input-field" placeholder="11-digit NIN" maxLength={11} /></div>
                                    <div><label className="block text-sm font-medium mb-1.5">Director/Owner BVN <span className="text-xs text-[var(--muted-foreground)]">(Bank Verification)</span></label><input name="bvn" type="text" defaultValue={(user as any).bvn || ''} className="input-field" placeholder="11-digit BVN" maxLength={11} /></div>
                                </div>
                            )}
                            <div><label className="block text-sm font-medium mb-1.5">Total Assets (₦)</label><input name="totalAssets" type="number" defaultValue={(user as any).totalAssets ? Number((user as any).totalAssets) : ''} className="input-field" placeholder="Total fixed assets value" /><p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Required for Small Company classification (must be &lt; ₦250M)</p></div>
                            <label className="flex items-center gap-3 p-3 rounded-lg border border-blue-200 dark:border-blue-500/30 bg-white dark:bg-slate-800 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-colors">
                                <input name="isProfessionalService" type="checkbox" defaultChecked={(user as any).isProfessionalService || false} value="true" className="rounded border-[var(--border)] text-[var(--primary)]" />
                                <div><span className="text-sm font-medium">Professional Services Company</span><p className="text-xs text-[var(--muted-foreground)]">Legal, Engineering, Consulting, etc. (Always taxed at 30%)</p></div>
                            </label>
                        </div>
                    </section>

                    <hr className="border-[var(--border)]" />

                    {/* 4. Document Settings */}
                    <section className="space-y-6">
                        <h3 className="text-sm font-bold text-[var(--muted-foreground)] uppercase tracking-wider flex items-center gap-2"><FileText size={16} /> Document Settings</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium mb-1.5">Template</label><select value={invoiceTemplate} onChange={(e) => setInvoiceTemplate(e.target.value)} className="input-field"><option value="modern">Modern (Accent Bar)</option><option value="bold">Bold (Header Block)</option><option value="classic">Classic (Simple)</option></select></div>
                            <div><label className="block text-sm font-medium mb-1.5">Font Style</label><select value={invoiceFont} onChange={(e) => setInvoiceFont(e.target.value)} className="input-field"><option value="inter">Inter (Clean)</option><option value="roboto">Roboto (Technical)</option><option value="lato">Lato (Elegant)</option></select></div>
                        </div>
                        <label className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 cursor-pointer hover:bg-[var(--muted)] transition-colors">
                            <div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${showWatermark ? 'bg-[var(--primary)] text-white' : 'bg-gray-200 text-gray-500'}`}><Scan size={20} /></div><div><span className="block font-medium">Draft Watermark</span><span className="text-xs text-[var(--muted-foreground)]">Overlay "DRAFT" on all documents</span></div></div>
                            <div className={`w-11 h-6 rounded-full relative transition-colors ${showWatermark ? 'bg-[var(--primary)]' : 'bg-gray-300'}`}><input type="checkbox" checked={showWatermark} onChange={(e) => setShowWatermark(e.target.checked)} className="sr-only" /><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${showWatermark ? 'left-6' : 'left-1'}`} /></div>
                        </label>
                    </section>

                    {/* Sticky Footer */}
                    <div className="sticky bottom-0 bg-white dark:bg-slate-900 pt-4 pb-8 border-t border-[var(--border)] mt-8 flex gap-3">
                        <button type="button" onClick={() => setShowMobilePreview(true)} className="lg:hidden px-4 py-3 rounded-xl border border-[var(--border)] font-medium hover:bg-[var(--muted)] transition-colors flex items-center gap-2"><Eye size={20} /> Preview</button>
                        <button type="submit" disabled={loading} className="flex-1 btn-gradient py-3 text-lg font-semibold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-lg shadow-blue-500/20">{loading ? (<><Loader2 size={20} className="animate-spin" />Saving...</>) : (<>Save Changes</>)}</button>
                    </div>
                </form>
            </div>

            {/* RIGHT PANE: Live Preview */}
            {showDesktopPreview && (
                <div className="hidden lg:block w-[55%] h-full bg-[var(--muted)] relative animate-in fade-in slide-in-from-right-4 duration-300">
                    <LivePreview brandColor={brandColor} invoiceTemplate={invoiceTemplate} invoiceFont={invoiceFont} logoUrl={logoUrl} stampUrl={stampUrl} showWatermark={showWatermark} businessName={businessName} businessAddress={businessAddress} phoneNumber={phoneNumber} taxIdentityNumber={taxId} />
                </div>
            )}

            {/* Mobile Preview Overlay */}
            {showMobilePreview && (
                <div className="fixed inset-0 z-50 bg-[var(--muted)] flex flex-col lg:hidden animate-in slide-in-from-bottom-full duration-300">
                    <div className="bg-white border-b border-[var(--border)] p-4 flex items-center justify-between shadow-sm"><h3 className="font-semibold">Live Preview</h3><button onClick={() => setShowMobilePreview(false)} className="p-2 hover:bg-[var(--muted)] rounded-full transition-colors"><X size={24} /></button></div>
                    <div className="flex-1 overflow-auto p-4"><LivePreview brandColor={brandColor} invoiceTemplate={invoiceTemplate} invoiceFont={invoiceFont} logoUrl={logoUrl} stampUrl={stampUrl} showWatermark={showWatermark} businessName={businessName} businessAddress={businessAddress} phoneNumber={phoneNumber} taxIdentityNumber={taxId} /></div>
                </div>
            )}

            {/* Enroll Personal Account Modal */}
            <EnrollPersonalAccountModal
                isOpen={showEnrollModal}
                onClose={() => setShowEnrollModal(false)}
            />

            {/* Centered Feedback Modal */}
            {feedback.type && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center space-y-6 animate-in zoom-in-95 duration-300 border border-[var(--border)]">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${feedback.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                            {feedback.type === 'success' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-xl font-bold text-[var(--foreground)]">{feedback.title}</h3>
                            <div className="text-sm text-[var(--muted-foreground)] space-y-1">
                                {feedback.messages.map((msg, i) => (
                                    <p key={i}>{msg}</p>
                                ))}
                            </div>
                        </div>

                        {feedback.type === 'error' && (
                            <button
                                onClick={() => setFeedback({ type: null, title: '', messages: [] })}
                                className="w-full py-3 rounded-xl font-medium bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] transition-colors"
                            >
                                Dismiss
                            </button>
                        )}

                        {feedback.type === 'success' && (
                            <div className="flex justify-center">
                                <Loader2 className="animate-spin text-[var(--primary)]" size={24} />
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
