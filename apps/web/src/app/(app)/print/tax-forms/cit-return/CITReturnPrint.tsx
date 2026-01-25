'use client';

import { CITReturnData } from "@vouch/services";
import { formatCurrency } from "../../../../../lib/utils";
import { recordTaxFiling } from "../../../../actions/tax";

export function CITReturnPrint({ data }: { data: CITReturnData }) {
    const handlePrint = async () => {
        // Record filing in background
        await recordTaxFiling({
            formType: 'cit-return',
            taxYear: Number(data.filingPeriod) || new Date().getFullYear() - 1,
            turnover: data.turnover,
            assessableProfit: data.assessableProfit,
            totalTaxPaid: data.totalTaxPayable
        });
        window.print();
    };

    const handlePeriodChange = (value: string) => {
        const params = new URLSearchParams(window.location.search);
        params.set('year', value);
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
                    <span className="text-xs font-bold uppercase text-gray-500 mr-2">Filing Year:</span>
                    <select
                        value={data.filingPeriod}
                        onChange={(e) => handlePeriodChange(e.target.value)}
                        className="bg-white border text-sm rounded px-2 py-1 outline-none focus:ring-2 focus:ring-black"
                    >
                        {[2023, 2024, 2025, 2026, 2027].map(y => (
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
                    <h1 className="text-2xl font-bold uppercase">CIT Return</h1>
                    <p className="text-sm font-semibold text-gray-600">COMPANIES INCOME TAX RETURN</p>
                    <p className="text-xs mt-1">Pursuant to CITA (Cap C21 LFN 2004) & NTA 2025</p>
                </div>
                <div className="text-right">
                    <div className="bg-black text-white px-3 py-1 text-sm font-bold uppercase inline-block mb-1">
                        {data.companySize} Company
                    </div>
                    <div className="text-xs font-mono">Filing Year: {data.filingPeriod}</div>
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
                        <span className="block text-xs uppercase text-gray-500">Category</span>
                        <span className="font-medium">{data.isProfessionalService ? 'Professional Services (Mandatory Large)' : 'General Commerce'}</span>
                    </div>
                </div>
            </section>

            {/* Section B: The Small Company Trap / Status Check */}
            <section className="mb-6">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION B: STATUS VALIDATION (THE "MEAT")</div>
                <table className="w-full text-sm border border-black">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black w-[70%]">1. Total Gross Turnover <span className="text-xs italic text-gray-500">(Must be ≤₦50M for Small status)</span></td>
                            <td className={`p-2 text-right font-mono font-bold ${data.turnover > 50000000 ? 'text-red-600' : ''}`}>
                                {formatCurrency(data.turnover)}
                            </td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">2. Total Fixed Assets <span className="text-xs italic text-gray-500">(Must be &lt;₦250M for Small status)</span></td>
                            <td className={`p-2 text-right font-mono font-bold ${data.totalAssets >= 250000000 ? 'text-red-600' : ''}`}>
                                {formatCurrency(data.totalAssets)}
                            </td>
                        </tr>
                        <tr className="bg-gray-50 font-medium">
                            <td className="p-2 border-r border-black text-right">Applicable Tax Status:</td>
                            <td className="p-2 text-right uppercase">{data.companySize.toUpperCase()}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Section C: Computation */}
            <section className="mb-8">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION C: TAX COMPUTATION</div>
                <table className="w-full text-sm border border-black">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black w-[70%]">3. Assessable Profit</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(data.assessableProfit)}</td>
                        </tr>

                        {/* Large Company Logic */}
                        {!data.isNilReturn ? (
                            <>
                                <tr className="border-b border-black">
                                    <td className="p-2 border-r border-black">4. Companies Income Tax @ 30%</td>
                                    <td className="p-2 text-right font-mono">{formatCurrency(data.citPayable)}</td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="p-2 border-r border-black">5. Development Levy @ 4% of Profit <span className="text-xs italic text-gray-500">(Replaces TET/NITDA/NASENI)</span></td>
                                    <td className="p-2 text-right font-mono">{formatCurrency(data.developmentLevy)}</td>
                                </tr>
                                <tr className="border-b border-black">
                                    <td className="p-2 border-r border-black">6. Effective Tax Rate Check (ETR) <span className="text-xs italic text-gray-500">(Should be &gt; 15%)</span></td>
                                    <td className={`p-2 text-right font-mono ${data.etrCheck < 15 ? 'text-red-600 font-bold' : 'text-green-700'}`}>
                                        {data.etrCheck.toFixed(2)}%
                                    </td>
                                </tr>
                            </>
                        ) : (
                            /* Small Company Logic */
                            <tr className="border-b border-black bg-green-50">
                                <td className="p-2 border-r border-black text-green-800 italic" colSpan={2}>
                                    ** EXEMPT FROM CIT & DEV LEVY (SMALL COMPANY STATUS VERIFIED) **
                                </td>
                            </tr>
                        )}

                        <tr className="bg-black text-white font-bold text-lg">
                            <td className="p-3 border-r border-white text-right">TOTAL TAX PAYABLE</td>
                            <td className="p-3 text-right font-mono">{formatCurrency(data.totalTaxPayable)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Nil Return Declaration */}
            {data.isNilReturn && (
                <div className="border-2 border-black border-dashed p-4 mb-8 bg-gray-50">
                    <h3 className="font-bold text-sm uppercase mb-2">Declaration of Nil Return</h3>
                    <p className="text-xs text-justify">
                        I hereby declare that the company turnover is below ₦50,000,000 and total assets are below ₦250,000,000 for the period under review.
                        We elect to file a NIL RETURN in accordance with the Finance Act and NTA 2025 small company exemptions.
                    </p>
                </div>
            )}

            {/* Signatures */}
            <div className="text-xs text-gray-500 mt-8 border-t border-gray-300 pt-4">
                <div className="mt-8 flex justify-between gap-8">
                    <div className="border-t border-black w-1/3 pt-2 text-center text-black">Director Signature</div>
                    <div className="border-t border-black w-1/3 pt-2 text-center text-black">Secretary Signature</div>
                    <div className="border-t border-black w-1/3 pt-2 text-center text-black">Date</div>
                </div>
            </div>
        </div>
    );
}
