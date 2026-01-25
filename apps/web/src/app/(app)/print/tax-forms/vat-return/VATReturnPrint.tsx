'use client';

import { VATReturnData } from "@vouch/services";
import { formatCurrency } from "../../../../../lib/utils";
import { recordTaxFiling } from "../../../../actions/tax";

export function VATReturnPrint({ data }: { data: VATReturnData }) {
    const handlePrint = async () => {
        // Record filing in background
        await recordTaxFiling({
            formType: 'vat-return',
            taxYear: data.year,
            turnover: data.totalSales,
            assessableProfit: data.totalSales - data.totalPurchases,
            totalTaxPaid: data.netVATPayable
        });
        window.print();
    };

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const handlePeriodChange = (type: 'month' | 'year', value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set(type, value);
        window.location.search = params.toString();
    };

    return (
        <div className="max-w-[210mm] mx-auto bg-white p-8 md:p-12 text-black print:p-0 min-h-screen">
            {/* Controls - Hide in Print */}
            <div className="print:hidden mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition"
                >
                    ← Back
                </button>

                <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                    <span className="text-xs font-bold uppercase text-gray-500 mr-2">Filing Period:</span>
                    <select
                        value={data.month}
                        onChange={(e) => handlePeriodChange('month', e.target.value)}
                        className="bg-white border text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-black"
                    >
                        {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                        ))}
                    </select>
                    <select
                        value={data.year}
                        onChange={(e) => handlePeriodChange('year', e.target.value)}
                        className="bg-white border text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-black"
                    >
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:opacity-90 transition shadow-lg"
                    >
                        Print / Save PDF
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-black pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold uppercase">VAT Return</h1>
                    <p className="text-sm font-semibold text-gray-600">VALUE ADDED TAX RETURN (FORM 002)</p>
                    <p className="text-xs mt-1">Pursuant to VAT Act 2025 (7.5% Standard Rate)</p>
                </div>
                <div className="text-right">
                    <div className="bg-black text-white px-3 py-1 text-sm font-bold uppercase inline-block mb-1">
                        Monthly Return
                    </div>
                    <div className="text-xs font-mono">Period: {data.period}</div>
                </div>
            </div>

            {/* Section A: Company Details */}
            <section className="mb-6">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION A: COMPANY DETAILS</div>
                <div className="border border-black grid grid-cols-2 text-sm">
                    <div className="p-2 border-r border-black border-b">
                        <span className="block text-xs uppercase text-gray-500">Company Name</span>
                        <span className="font-medium">{data.companyName}</span>
                    </div>
                    <div className="p-2 border-b border-black">
                        <span className="block text-xs uppercase text-gray-500">RC Number</span>
                        <span className="font-medium">{data.rcNumber}</span>
                    </div>
                    <div className="p-2 border-r border-black">
                        <span className="block text-xs uppercase text-gray-500">Tax Identification Number (TIN)</span>
                        <span className="font-medium font-mono">{data.tin}</span>
                    </div>
                    <div className="p-2">
                        <span className="block text-xs uppercase text-gray-500">VAT Registration Status</span>
                        <span className="font-medium">{data.isVATRegistered ? 'Registered' : 'Not Registered'}</span>
                    </div>
                </div>
            </section>

            {/* Section B: Sales (Output VAT) */}
            <section className="mb-6">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION B: OUTPUT VAT (SALES)</div>
                <table className="w-full text-sm border border-black">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black w-[70%]">1. Total Sales (including VAT)</td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.totalSales)}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">2. Exempt Sales (Zero-rated or Exempt)</td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.exemptSales)}</td>
                        </tr>
                        <tr className="border-b border-black font-medium">
                            <td className="p-2 border-r border-black">3. Taxable Sales (Subject to 7.5%)</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(data.taxableSales)}</td>
                        </tr>
                        <tr className="bg-blue-50 font-bold">
                            <td className="p-2 border-r border-black text-right">Output VAT @ 7.5%</td>
                            <td className="p-2 text-right font-mono text-blue-600">{formatCurrency(data.outputVAT)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Section C: Purchases (Input VAT) */}
            <section className="mb-8">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION C: INPUT VAT (PURCHASES)</div>
                <table className="w-full text-sm border border-black">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black w-[70%]">4. Total Purchases (including VAT)</td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.totalPurchases)}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">5. Exempt Purchases</td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.exemptPurchases)}</td>
                        </tr>
                        <tr className="border-b border-black font-medium">
                            <td className="p-2 border-r border-black">6. Taxable Purchases (Subject to 7.5%)</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(data.taxablePurchases)}</td>
                        </tr>
                        <tr className="bg-green-50 font-bold">
                            <td className="p-2 border-r border-black text-right">Input VAT @ 7.5%</td>
                            <td className="p-2 text-right font-mono text-green-600">{formatCurrency(data.inputVAT)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Section D: Net VAT Payable */}
            <section className="mb-8">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION D: VAT COMPUTATION</div>
                <table className="w-full text-sm border border-black">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black w-[70%]">7. Output VAT (Sales)</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(data.outputVAT)}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">8. Less: Input VAT (Purchases)</td>
                            <td className="p-2 text-right font-mono">({formatCurrency(data.inputVAT)})</td>
                        </tr>
                        <tr className="bg-black text-white font-bold text-lg">
                            <td className="p-3 border-r border-white text-right">NET VAT PAYABLE</td>
                            <td className="p-3 text-right font-mono">{formatCurrency(data.netVATPayable)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Declaration */}
            <div className="border-2 border-black border-dashed p-4 mb-8 bg-gray-50">
                <h3 className="font-bold text-sm uppercase mb-2">Declaration</h3>
                <p className="text-xs text-justify">
                    I hereby declare that the information provided in this VAT return is true, correct, and complete to the best of my knowledge.
                    I understand that any false declaration may result in penalties under the VAT Act 2025.
                </p>
            </div>

            {/* Signatures */}
            <div className="text-xs text-gray-500 mt-8 border-t border-gray-300 pt-4">
                <div className="mt-8 flex justify-between gap-8">
                    <div className="border-t border-black w-1/3 pt-2 text-center text-black">Authorized Signatory</div>
                    <div className="border-t border-black w-1/3 pt-2 text-center text-black">Position</div>
                    <div className="border-t border-black w-1/3 pt-2 text-center text-black">Date</div>
                </div>
            </div>
        </div>
    );
}
