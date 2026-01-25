'use client';

import { FormAData } from "@vouch/services";
import { formatCurrency } from "@/lib/utils";
import { recordTaxFiling } from "../../../../actions/tax";

export function FormAPrint({ data }: { data: FormAData }) {
    const handlePrint = async () => {
        // Record filing in background
        await recordTaxFiling({
            formType: 'form-a',
            taxYear: new Date().getFullYear() - 1,
            turnover: data.tradeIncome,
            assessableProfit: data.chargeableIncome,
            totalTaxPaid: data.taxPayable
        });
        window.print();
    };

    return (
        <div className="max-w-[210mm] mx-auto bg-white p-8 md:p-12 text-black print:p-0 min-h-screen">
            {/* Controls - Hide in Print */}
            <div className="print:hidden mb-8 flex justify-between items-center">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition"
                >
                    ← Back
                </button>
                <div className="flex gap-4">
                    {/* Future Save Action Hook */}
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:opacity-90 transition shadow-lg"
                    >
                        Print / Save PDF
                    </button>
                </div>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold uppercase">Form A</h1>
                    <p className="text-sm font-semibold text-gray-600">INCOME TAX FORM FOR RETURN OF INCOME AND CLAIMS FOR ALLOWANCES AND RELIEFS</p>
                    <p className="text-xs mt-1">Pursuant to the Personal Income Tax Act (Amended 2011) & Nigeria Tax Act 2025</p>
                </div>
                <div className="text-right">
                    <div className="border border-black p-2 inline-block">
                        <p className="text-xs font-bold">Tax Year</p>
                        <p className="text-xl font-mono">{new Date().getFullYear() - 1}</p>
                    </div>
                </div>
            </div>

            {/* Section A: Identification */}
            <section className="mb-6">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION A: PERSONAL INFORMATION & IDENTIFICATION KEYS</div>
                <div className="border border-black grid grid-cols-2 text-sm">
                    <div className="p-2 border-r border-black border-b">
                        <span className="block text-xs uppercase text-gray-500">Taxpayer Name</span>
                        <span className="font-medium">{data.taxpayerName}</span>
                    </div>
                    <div className="p-2 border-b border-black">
                        <span className="block text-xs uppercase text-gray-500">State of Residence</span>
                        <span className="font-medium">{data.state}</span>
                    </div>
                    <div className="p-2 border-r border-black border-b">
                        <span className="block text-xs uppercase text-gray-500">Address</span>
                        <span className="font-medium">{data.address}</span>
                    </div>
                    <div className="p-2 border-b border-black">
                        <span className="block text-xs uppercase text-gray-500">Tax Identification Number (TIN)</span>
                        <span className="font-medium font-mono">{data.tin}</span>
                    </div>
                    <div className="p-2 border-r border-black">
                        <span className="block text-xs uppercase text-gray-500">National Identity Number (NIN) <span className="text-red-500">*</span></span>
                        <span className="font-medium font-mono">{data.nin}</span>
                    </div>
                    <div className="p-2">
                        <span className="block text-xs uppercase text-gray-500">Bank Verification Number (BVN) <span className="text-red-500">*</span></span>
                        <span className="font-medium font-mono">{data.bvn}</span>
                    </div>
                </div>
            </section>

            {/* Section B: Income Declaration */}
            <section className="mb-6">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION B: STATEMENT OF INCOME (THE "MEAT")</div>
                <table className="w-full text-sm border border-black">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black w-[70%]">1. Income from Employment (Salary, Bonuses, Allowances)</td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.employmentIncome)}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">2. Income from Trade / Business / Profession (Turnover for IG Sellers)</td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.tradeIncome)}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">3. Income from Digital Assets (Crypto, NFTs) <span className="text-xs italic text-gray-500">- 10% CGT applies</span></td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.digitalAssetIncome)}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">4. Foreign Sourced Income (Remote Work)</td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.foreignIncome)}</td>
                        </tr>
                        <tr className="font-bold bg-gray-200">
                            <td className="p-2 border-r border-black text-right">TOTAL GROSS INCOME</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(data.totalIncome)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Section C: Reliefs */}
            <section className="mb-6">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION C: RELIEFS & DEDUCTIONS</div>
                <table className="w-full text-sm border border-black">
                    <tbody>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black w-[70%]">
                                5. Rent Relief <span className="text-xs italic text-gray-500">(Max ₦500k or 20% of Rent Paid)</span>
                                <div className="text-xs text-gray-500 mt-1">Rent Paid: {formatCurrency(data.rentPaid)}</div>
                            </td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.rentReliefClaimed)}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">6. Pension Contribution (8%)</td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.pensionContribution)}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">7. NHF Contribution (2.5%)</td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.nhfContribution)}</td>
                        </tr>
                        <tr className="border-b border-black">
                            <td className="p-2 border-r border-black">8. Consolidated Relief Allowance (Fixed Base + 20% of Income) - <i>Simplified</i></td>
                            <td className="p-2 text-right font-mono bg-gray-50">{formatCurrency(data.totalReliefs - data.rentReliefClaimed - data.pensionContribution - data.nhfContribution)}</td>
                        </tr>
                        <tr className="font-bold bg-gray-200">
                            <td className="p-2 border-r border-black text-right">TOTAL RELIEFS</td>
                            <td className="p-2 text-right font-mono">{formatCurrency(data.totalReliefs)}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            {/* Section D: Tax Computation */}
            <section className="mb-8">
                <div className="bg-gray-100 p-2 border border-black border-b-0 font-bold text-sm">SECTION D: TAX COMPUTATION</div>
                <div className="border border-black text-sm">
                    <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-2 border-r border-black">9. Total Gross Income</div>
                        <div className="p-2 text-right font-mono">{formatCurrency(data.totalIncome)}</div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-black">
                        <div className="p-2 border-r border-black">10. Less: Total Reliefs</div>
                        <div className="p-2 text-right font-mono">({formatCurrency(data.totalReliefs)})</div>
                    </div>
                    <div className="grid grid-cols-2 border-b border-black bg-gray-50 font-bold">
                        <div className="p-2 border-r border-black">11. CHARGEABLE INCOME</div>
                        <div className="p-2 text-right font-mono">{formatCurrency(data.chargeableIncome)}</div>
                    </div>
                    {data.digitalAssetTax > 0 && (
                        <div className="grid grid-cols-2 border-b border-black bg-purple-50">
                            <div className="p-2 border-r border-black">12. Digital Asset Tax (CGT @ 10%)</div>
                            <div className="p-2 text-right font-mono text-purple-600">{formatCurrency(data.digitalAssetTax)}</div>
                        </div>
                    )}
                    <div className="grid grid-cols-2 bg-black text-white font-bold text-lg">
                        <div className="p-3 border-r border-white text-right">TOTAL TAX PAYABLE</div>
                        <div className="p-3 text-right font-mono">{formatCurrency(data.taxPayable + data.digitalAssetTax)}</div>
                    </div>
                </div>
            </section>

            {/* Declaration */}
            <div className="text-xs text-gray-500 mt-8 border-t border-gray-300 pt-4">
                <p>I hereby declare that the information given in this return is true and correct to the best of my knowledge and belief, and in accordance with the Nigeria Tax Act 2025.</p>
                <div className="mt-8 flex justify-between">
                    <div className="border-t border-black w-1/3 pt-2 text-center text-black">Signature</div>
                    <div className="border-t border-black w-1/3 pt-2 text-center text-black">Date</div>
                </div>
            </div>
        </div>
    );
}
